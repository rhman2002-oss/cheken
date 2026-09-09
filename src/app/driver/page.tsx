"use client";

import React, { useState, useEffect } from "react";
import {
  Bike,
  MapPin,
  Phone,
  CheckCircle2,
  LogOut,
  Navigation,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  ShoppingBag,
  Clock,
  Check,
  X,
  Compass,
} from "lucide-react";
import { Order, Driver } from "@/config/restaurant";
import { getOrders, updateOrderStatus } from "@/lib/ordersService";
import { getDrivers, verifyDriverLogin } from "@/lib/driversService";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const DRIVER_SESSION_KEY = "restaurant_driver_session_v1";

export default function DriverPage() {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // حالة تسجيل الدخول
  const [phoneInput, setPhoneInput] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // حالة الطلبات
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);

  // حالة نافذة اختيار تطبيق الخرائط
  const [navTargetOrder, setNavTargetOrder] = useState<Order | null>(null);

  // رسالة إشعار سريعة (Toast)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // استرجاع جلسة المندوب المحفوظة
  useEffect(() => {
    async function restoreSession() {
      try {
        const saved = localStorage.getItem(DRIVER_SESSION_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.id) {
            const driversList = await getDrivers();
            const current = driversList.find((d) => d.id === parsed.id && d.isActive);
            if (current) {
              setDriver(current);
            } else {
              localStorage.removeItem(DRIVER_SESSION_KEY);
            }
          }
        }
      } catch {
        // ignore
      } finally {
        setIsInitializing(false);
      }
    }

    restoreSession();
  }, []);

  // جلب الطلبات الخاصة بهذا المندوب فقط
  const loadMyOrders = async () => {
    if (!driver) return;
    setIsLoadingOrders(true);
    try {
      const allOrders = await getOrders();
      // الطلبات المعينة لهذا المندوب وحالتها جارية (قيد التوصيل أو قيد التحضير)
      const myActive = allOrders
        .filter(
          (o) =>
            o.assignedDriverId === driver.id &&
            (o.status === "out_for_delivery" || o.status === "preparing")
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setOrders(myActive);
    } catch (err) {
      console.error("Failed to load driver orders:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // الاستماع للتحديثات الحية للطلبات
  useEffect(() => {
    if (!driver) return;
    loadMyOrders();

    const handleUpdate = () => {
      loadMyOrders();
    };

    window.addEventListener("order-status-changed", handleUpdate);
    window.addEventListener("new-order-received", handleUpdate);
    window.addEventListener("orders-cleared", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    // اشتراك Supabase اللحظي إن وجد
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel("driver-orders-realtime")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "orders" },
            () => {
              loadMyOrders();
            }
          )
          .subscribe();
      } catch (e) {
        console.warn("Supabase realtime subscription failed:", e);
      }
    }

    // فحص دوري كل 6 ثوانٍ كإجراء احتياطي
    const interval = setInterval(loadMyOrders, 6000);

    return () => {
      window.removeEventListener("order-status-changed", handleUpdate);
      window.removeEventListener("new-order-received", handleUpdate);
      window.removeEventListener("orders-cleared", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
      clearInterval(interval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [driver]);

  // تنفيذ تسجيل الدخول
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!phoneInput.trim()) {
      setLoginError("يرجى كتابة رقم هاتفك");
      return;
    }
    if (!pinInput.trim()) {
      setLoginError("يرجى إدخال رمز الدخول السري");
      return;
    }

    setIsLoggingIn(true);
    try {
      const found = await verifyDriverLogin(phoneInput, pinInput);
      if (found) {
        setDriver(found);
        localStorage.setItem(DRIVER_SESSION_KEY, JSON.stringify(found));
        showToast(`أهلاً بك يا ${found.name} 🛵`);
      } else {
        setLoginError("رقم الهاتف أو رمز الدخول غير صحيح، أو أن حسابك معطل");
      }
    } catch {
      setLoginError("حدث خطأ في الاتصال، حاول مجدداً");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // تسجيل الخروج
  const handleLogout = () => {
    if (confirm("هل تريد تسجيل الخروج من واجهة المندوب؟")) {
      localStorage.removeItem(DRIVER_SESSION_KEY);
      setDriver(null);
      setOrders([]);
    }
  };

  // إنهاء وتوصيل الطلب
  const handleCompleteOrder = async (orderId: string) => {
    setCompletingOrderId(orderId);
    try {
      const success = await updateOrderStatus(orderId, "completed");
      if (success) {
        // حذف الطلب فوراً من قائمة المندوب
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        showToast("تم تسليم الطلب بنجاح! عاشت إيدك 👏");
      } else {
        showToast("تعذر تحديث حالة الطلب، يرجى المحاولة ثانية");
      }
    } catch (err) {
      console.error(err);
      showToast("حدث خطأ أثناء إتمام الطلب");
    } finally {
      setCompletingOrderId(null);
    }
  };

  // توليد روابط التوجيه
  const getMapsUrl = (loc?: { lat: number; lng: number }) => {
    if (!loc) return "#";
    return `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`;
  };

  const getWazeUrl = (loc?: { lat: number; lng: number }) => {
    if (!loc) return "#";
    return `https://waze.com/ul?ll=${loc.lat},${loc.lng}&navigate=yes`;
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 text-xs">
        <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mb-2" />
        <span>جاري تشغيل واجهة المندوب...</span>
      </div>
    );
  }

  // ==========================================
  // شاشة تسجيل الدخول المخصصة للموبايل
  // ==========================================
  if (!driver) {
    return (
      <div className="w-full min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4">
        {/* التنبيه العائم */}
        {toastMessage && (
          <div className="fixed top-4 start-4 end-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="pt-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center mb-4 shadow-lg shadow-amber-500/10">
            <Bike className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            تطبيق مندوب التوصيل
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            سجل دخولك لمتابعة الطلبات الموجهة لك وتسليمها
          </p>
        </div>

        {/* نموذج تسجيل الدخول */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl my-auto">
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                رقم هاتفك
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="07701234567"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full h-12 ps-11 pe-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white font-mono placeholder:text-slate-600 outline-none focus:border-amber-500 transition-colors"
                />
                <Phone className="w-4 h-4 text-slate-500 absolute start-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                رمز الدخول السري (PIN)
              </label>
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                placeholder="••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full h-12 px-4 rounded-2xl bg-slate-950 border border-slate-800 text-center text-lg font-mono tracking-widest text-white placeholder:text-slate-600 outline-none focus:border-amber-500 transition-colors"
              />
              <span className="block text-[11px] text-slate-500 mt-1 text-center">
                الرمز الذي زوّدك به مدير المطعم (الافتراضي: 1234)
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <>
                  <Bike className="w-5 h-5" />
                  <span>دخول لحساب المندوب</span>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="pb-4 text-center">
          <p className="text-[11px] text-slate-600">
            نظام التوصيل المباشر للمطعم
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // شاشة المندوب الرئيسية (طلبات التوصيل)
  // ==========================================
  return (
    <div className="w-full min-h-screen bg-slate-950 text-white flex flex-col">
      {/* التنبيه العائم */}
      {toastMessage && (
        <div className="fixed top-4 start-4 end-4 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* رأس الصفحة الثابت للموبايل */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="text-sm font-black text-white">{driver.name}</h2>
            </div>
            <p className="text-[11px] text-slate-400 font-mono dir-ltr text-start">
              {driver.phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadMyOrders}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 active:rotate-180 transition-transform"
            title="تحديث الطلبات"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingOrders ? "animate-spin text-amber-400" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-red-400 transition-colors"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* شريط حالة الطلبات */}
      <div className="px-4 py-2.5 bg-slate-900/40 border-b border-slate-800/50 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-bold">
          الطلبات المعينة لك للتوصيل:
        </span>
        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-black">
          {orders.length} طلب
        </span>
      </div>

      {/* قائمة الطلبات */}
      <main className="flex-1 p-4 space-y-4 pb-12">
        {orders.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-300">
                لا توجد طلبات معينة لك حالياً
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[260px] mx-auto">
                عندما يُعيّن لك مدير المطعم طلباً جديداً سيظهر لك هنا فوراً 🛵
              </p>
            </div>
            <button
              type="button"
              onClick={loadMyOrders}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-bold active:scale-95 transition-all"
            >
              تحديث الآن
            </button>
          </div>
        ) : (
          orders.map((order) => {
            const hasLocation = !!order.customerLocation?.lat;
            const isCompleting = completingOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3.5"
              >
                {/* رأس بطاقة الطلب */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-400 font-mono font-black text-xs">
                      #{order.orderNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {new Date(order.createdAt).toLocaleTimeString("ar-EG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    قيد التوصيل
                  </span>
                </div>

                {/* معلومات الزبون ورقم الهاتف */}
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-white">
                      {order.customerName || "زبون بدون اسم"}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5 dir-ltr text-start">
                      {order.customerPhone}
                    </p>
                  </div>

                  {order.customerPhone && (
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="h-10 px-3.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      <span>اتصال</span>
                    </a>
                  )}
                </div>

                {/* تفاصيل الأصناف */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                  <div className="text-[11px] text-slate-400 font-bold mb-1">
                    أصناف الطلب:
                  </div>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-300 font-medium">
                        {item.quantity} × {item.name}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {(item.price * item.quantity).toLocaleString()} د.ع
                      </span>
                    </div>
                  ))}

                  {/* المجموع الإجمالي */}
                  <div className="pt-2 mt-1 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-300">
                      المجموع المطلوب:
                    </span>
                    <span className="text-sm font-black text-amber-400 font-mono">
                      {order.totalAmount.toLocaleString()} د.ع
                    </span>
                  </div>
                </div>

                {/* العنوان والنقطة الدالة */}
                {(order.customerAddress || order.notes || order.customerLocation?.addressTitle) && (
                  <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-xs space-y-1">
                    <div className="flex items-start gap-1.5 text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">
                        {order.customerLocation?.addressTitle || order.customerAddress || "موقع محدد عبر الخارطة"}
                      </span>
                    </div>

                    {order.notes && (
                      <div className="text-[11px] text-amber-400/90 font-medium ps-5">
                        ملاحظة: {order.notes}
                      </div>
                    )}
                  </div>
                )}

                {/* زر عرض الموقع على الخريطة */}
                <button
                  type="button"
                  onClick={() => setNavTargetOrder(order)}
                  className="w-full h-11 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Navigation className="w-4 h-4 text-blue-400" />
                  <span>عرض الموقع والتوجيه عبر الخريطة</span>
                </button>

                {/* الزر الرئيسي: تم التوصيل */}
                <button
                  type="button"
                  disabled={isCompleting}
                  onClick={() => handleCompleteOrder(order.id)}
                  className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isCompleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 stroke-[3]" />
                      <span>تم التوصيل</span>
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </main>

      {/* نافذة اختيار تطبيق الخرائط (Dialog افتح بواسطة) */}
      {navTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-3 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-black text-white">
                  اختر تطبيق الملاحة والتوجيه
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setNavTargetOrder(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              اختر التطبيق المفضل لديك للذهاب مباشرة إلى موقع الزبون ({navTargetOrder.customerName}):
            </p>

            <div className="space-y-2.5 pt-1">
              {/* خيار 1: Google Maps */}
              <a
                href={
                  navTargetOrder.customerLocation?.lat
                    ? getMapsUrl(navTargetOrder.customerLocation)
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        navTargetOrder.customerAddress || ""
                      )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setNavTargetOrder(null)}
                className="w-full h-13 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs flex items-center justify-between border border-slate-700 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-start">
                    <div className="text-sm font-black">Google Maps</div>
                    <div className="text-[11px] text-slate-400">خرائط قوقل الرسمية والتوجيه الصوتي</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>

              {/* خيار 2: Waze */}
              <a
                href={
                  navTargetOrder.customerLocation?.lat
                    ? getWazeUrl(navTargetOrder.customerLocation)
                    : `https://waze.com/ul?q=${encodeURIComponent(
                        navTargetOrder.customerAddress || ""
                      )}&navigate=yes`
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setNavTargetOrder(null)}
                className="w-full h-13 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs flex items-center justify-between border border-slate-700 active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                    <Navigation className="w-4 h-4" />
                  </div>
                  <div className="text-start">
                    <div className="text-sm font-black">Waze</div>
                    <div className="text-[11px] text-slate-400">تطبيق ويز للملاحة وتفادي الزحام</div>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            <button
              type="button"
              onClick={() => setNavTargetOrder(null)}
              className="w-full h-11 rounded-2xl bg-slate-950 text-slate-400 font-bold text-xs"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
