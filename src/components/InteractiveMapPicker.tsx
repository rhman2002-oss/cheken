"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, Navigation, MapPin, Loader2, Check, X, AlertCircle } from "lucide-react";
import { CustomerLocation } from "@/config/restaurant";
import "leaflet/dist/leaflet.css";

interface InteractiveMapPickerProps {
  initialLocation?: CustomerLocation | null;
  onConfirm: (location: CustomerLocation, addressText?: string) => void;
  onCancel?: () => void;
  title?: string;
}

// الموقع الافتراضي (بغداد - المنصور) كمركز انطلاق في حال عدم توفر GPS
const DEFAULT_CENTER = { lat: 33.3128, lng: 44.3615 };

export const InteractiveMapPicker: React.FC<InteractiveMapPickerProps> = ({
  initialLocation,
  onConfirm,
  onCancel,
  title = "تحديد موقع التوصيل على الخارطة",
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: initialLocation?.lat || DEFAULT_CENTER.lat,
    lng: initialLocation?.lng || DEFAULT_CENTER.lng,
  });

  const [addressTitle, setAddressTitle] = useState<string>(
    initialLocation?.addressTitle || ""
  );
  const [notes, setNotes] = useState<string>(initialLocation?.notes || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "success" | "denied">("idle");

  // تهيئة خريطة Leaflet في المتصفح فقط
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) return;
      if ((mapContainerRef.current as any)._leaflet_id) return;

      const L = await import("leaflet");

      if (!isMounted || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;
      if ((mapContainerRef.current as any)._leaflet_id) return;

      // إنشاء أيقونة مخصصة رائعة للموقع لمنع أي أخطاء بالصور الافتراضية
      const pinIcon = L.divIcon({
        className: "custom-leaflet-pin",
        html: `
          <div style="position: relative; transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
            <div style="background-color: #E52E2E; color: white; width: 38px; height: 38px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.35); border: 2.5px solid white;">
              <div style="transform: rotate(45deg); width: 12px; height: 12px; background-color: white; border-radius: 50%;"></div>
            </div>
            <div style="width: 14px; height: 5px; background: rgba(0,0,0,0.25); border-radius: 50%; margin-top: -2px; margin-inline: auto; filter: blur(1px);"></div>
          </div>
        `,
        iconSize: [38, 48],
        iconAnchor: [19, 44],
      });

      const initialLat = initialLocation?.lat || DEFAULT_CENTER.lat;
      const initialLng = initialLocation?.lng || DEFAULT_CENTER.lng;

      if (mapContainerRef.current) {
        (mapContainerRef.current as any)._leaflet_id = undefined;
      }

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: initialLocation?.lat ? 16 : 14,
        zoomControl: false,
      });

      // طبقة خرائط OpenStreetMap المجانية عالية السرعة
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
      }).addTo(map);

      // زر التكبير والتصغير بجهة اليمين
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // وضع العلامة القابلة للسحب
      const marker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true,
        autoPan: true,
      }).addTo(map);

      // الاستماع لتغيير موقع العلامة بالسحب
      marker.on("dragend", () => {
        const newPos = marker.getLatLng();
        if (isMounted) {
          setPosition({ lat: newPos.lat, lng: newPos.lng });
          reverseGeocode(newPos.lat, newPos.lng);
        }
      });

      // النقر على أي نقطة بالخريطة لنقل العلامة إليها فوراً
      map.on("click", (e: any) => {
        marker.setLatLng(e.latlng);
        if (isMounted) {
          setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
          reverseGeocode(e.latlng.lat, e.latlng.lng);
        }
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // فرض تحديث أبعاد الخريطة بعد التحميل لضمان ظهور البلاطات
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 150);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 400);

      // إذا لم يكن هناك موقع سابق، اطلب الـ GPS تلقائياً
      if (!initialLocation?.lat) {
        requestCurrentLocation(map, marker);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // ignore
        }
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      if (mapContainerRef.current) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // معرفة اسم المنطقة والشارع تلقائياً عند تغيير الإحداثيات
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
      );
      if (!res.ok) return;
      const json = await res.json();
      if (json && json.display_name) {
        const parts = json.display_name.split(",");
        const cleanName = parts.slice(0, 3).join("، ").trim();
        setAddressTitle(cleanName);
      }
    } catch {
      // ignore
    }
  };

  // طلب الموقع الجغرافي الفعلي للجهاز بدقة عالية مع معالجة بديلة للواي فاي
  const requestCurrentLocation = (customMap?: any, customMarker?: any) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsStatus("denied");
      return;
    }

    setIsLocating(true);
    setGpsStatus("idle");

    const onLocationFound = (pos: GeolocationPosition) => {
      const { latitude, longitude } = pos.coords;
      setPosition({ lat: latitude, lng: longitude });
      setGpsStatus("success");
      setIsLocating(false);

      const map = customMap || mapInstanceRef.current;
      const marker = customMarker || markerRef.current;

      if (map && marker) {
        map.setView([latitude, longitude], 16, { animate: true });
        marker.setLatLng([latitude, longitude]);
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 150);
      }

      reverseGeocode(latitude, longitude);
    };

    // محاولة أولى بدقة عالية (GPS الأجهزة المحمولة)
    navigator.geolocation.getCurrentPosition(
      onLocationFound,
      (err) => {
        console.warn("High accuracy geolocation timed out or failed, falling back to network:", err);
        // محاولة بديلة بدقة عادية (لأجهزة الحاسوب وشبكات الواي فاي)
        navigator.geolocation.getCurrentPosition(
          onLocationFound,
          (fallbackErr) => {
            console.warn("All geolocation attempts failed:", fallbackErr);
            setGpsStatus("denied");
            setIsLocating(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 12000,
            maximumAge: 60000,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 30000,
      }
    );
  };

  // البحث عن منطقة أو معلم
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q || q.length < 2) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&limit=5&accept-language=ar`
      );
      const data = await res.json();
      setSearchResults(data || []);
    } catch (err) {
      console.warn("Location search error:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // اختيار نتيجة من البحث
  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPosition({ lat, lng });
    setAddressTitle(result.display_name?.split(",")[0] || searchQuery);
    setSearchResults([]);
    setSearchQuery("");

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true });
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  // تأكيد الموقع
  const handleConfirm = () => {
    const mapsUrl = `https://www.google.com/maps?q=${position.lat},${position.lng}`;
    const loc: CustomerLocation = {
      lat: position.lat,
      lng: position.lng,
      mapsUrl,
      notes: notes.trim() || undefined,
      addressTitle: addressTitle.trim() || undefined,
    };
    onConfirm(loc, notes.trim() || addressTitle.trim());
  };

  return (
    <div className="flex flex-col h-full max-h-[85vh] sm:max-h-[80vh]">
      {/* رأس النافذة */}
      <div className="p-4 border-b border-border-subtle flex items-center justify-between shrink-0 bg-surface">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-full bg-primary-light text-primary">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-text-main leading-tight">
              {title}
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              اسحب العلامة الحمراء أو انقر على موقعك بدقة لتوجيه السائق
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-bg-page transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* شريط البحث وزر الـ GPS فوق الخارطة */}
      <div className="p-3 bg-bg-page/70 border-b border-border-subtle shrink-0 relative z-20 space-y-2">
        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منطقة، حي، أو معلم (مثال: المنصور، اليرموك)..."
              className="w-full ps-8 pe-3 py-2 rounded-input bg-surface border border-border-subtle text-xs text-text-main outline-none focus:border-primary"
            />
            <Search className="w-3.5 h-3.5 text-text-muted absolute start-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>

          <button
            type="button"
            onClick={() => requestCurrentLocation()}
            disabled={isLocating}
            className="min-h-[38px] px-3 rounded-btn bg-surface hover:bg-primary-light border border-border-subtle text-text-main hover:text-primary text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs disabled:opacity-60"
            title="تحديد موقعي عبر GPS"
          >
            {isLocating ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Navigation className="w-4 h-4 text-primary" />
            )}
            <span className="hidden sm:inline">موقعي الحالي</span>
          </button>
        </div>

        {/* نتائج البحث المنسدلة */}
        {searchResults.length > 0 && (
          <div className="absolute start-3 end-3 top-12 bg-surface rounded-card border border-border-subtle shadow-xl max-h-48 overflow-y-auto z-30 divide-y divide-border-subtle">
            {searchResults.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSearchResult(r)}
                className="w-full text-start p-2.5 hover:bg-bg-page text-xs text-text-main flex items-start gap-2 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span className="truncate">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {/* تنبيه الـ GPS إن تم رفضه */}
        {gpsStatus === "denied" && (
          <div className="p-2 rounded-btn bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              تعذر الوصول التلقائي للـ GPS. لا مشكلة، يمكنك سحب العلامة الحمراء على الخريطة أو البحث يدوياً!
            </span>
          </div>
        )}
      </div>

      {/* عرض عنوان المنطقة المحددة حالياً */}
      {addressTitle && (
        <div className="px-3.5 py-2 bg-primary/10 border-b border-border-subtle flex items-center gap-2 text-xs font-bold text-primary animate-in fade-in">
          <MapPin className="w-4 h-4 shrink-0 text-primary" />
          <span className="truncate">الموقع المحدد: {addressTitle}</span>
        </div>
      )}

      {/* حاوية الخارطة التفاعلية */}
      <div className="relative w-full h-[360px] sm:h-[400px] min-h-[360px] bg-gray-100 z-10 overflow-hidden">
        <div
          ref={mapContainerRef}
          style={{ width: "100%", height: "100%", minHeight: "360px", position: "relative" }}
          className="w-full h-full"
        />
      </div>

      {/* حقل الملاحظات الاختيارية وأزرار الحفظ */}
      <div className="p-4 border-t border-border-subtle bg-surface shrink-0 space-y-3">
        <div>
          <label className="block text-xs font-bold text-text-main mb-1">
            تفاصيل أو نقطة دالة إضافية <span className="text-text-muted font-normal text-[11px]">(اختياري لمساعدة السائق)</span>
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="مثال: البيت الثالث يمين، قرب صيدلية كذا، شقة رقم 4..."
            className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="text-[11px] text-text-muted hidden sm:block dir-ltr font-mono">
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="min-h-[42px] px-4 rounded-btn bg-bg-page text-text-muted hover:text-text-main text-xs font-bold transition-colors"
              >
                إلغاء
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-initial min-h-[42px] px-6 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>تأكيد هذا الموقع</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
