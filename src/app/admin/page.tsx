"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  Utensils,
  Settings,
  Image as ImageIcon,
  LogOut,
  ExternalLink,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Eye,
  ShoppingBag,
  MessageCircle,
  Tag,
  Upload,
  Clock,
  MapPin,
  Phone,
  Layers,
  RefreshCw,
  Volume2,
  Check,
  X,
  AlertCircle,
  Search,
  Calendar,
  User,
  Inbox,
  ArrowUpDown,
  QrCode,
  Download,
  Copy,
  Bike,
  Key,
  Share2,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { RestaurantDataProvider, useRestaurant } from "@/context/RestaurantDataContext";
import { MenuItem, MenuMode, Discount, Order, OrderStatus, CheckoutMethod, Driver } from "@/config/restaurant";
import { formatPrice, getDiscountedPrice } from "@/lib/utils";
import { getOrders, updateOrderStatus, playNewOrderSound, clearAllOrders } from "@/lib/ordersService";
import { getDrivers, createDriver, updateDriver, deleteDriver, assignDriverToOrder } from "@/lib/driversService";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function AdminDashboardContent() {
  const router = useRouter();
  const {
    data,
    updateMenuMode,
    updateCheckoutMethod,
    toggleIsOpen,
    updateGeneralInfo,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    updateItemDiscount,
  } = useRestaurant();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "mode" | "items" | "general" | "images" | "qrcode" | "drivers">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [isClearingOrders, setIsClearingOrders] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // تصفير ومسح جميع الطلبات
  const handleClearOrders = async () => {
    setIsClearingOrders(true);
    try {
      await clearAllOrders();
      setOrders([]);
      setIsClearModalOpen(false);
      showToast("🗑️ تم تصفير ومسح جميع الطلبات بنجاح!");
    } catch (err) {
      console.error("Failed to clear orders:", err);
      showToast("❌ حدث خطأ أثناء تصفير الطلبات");
    } finally {
      setIsClearingOrders(false);
    }
  };

  // حالة المناديب
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [driverFormData, setDriverFormData] = useState({
    name: "",
    phone: "",
    pin: "1234",
  });

  // حالة تعيين مندوب لطلب
  const [assigningOrder, setAssigningOrder] = useState<Order | null>(null);
  const [isAssigningLoading, setIsAssigningLoading] = useState(false);

  // حالة فلترة الأقسام في إدارة الأصناف
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  // حالة نافذة إضافة/تعديل صنف
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemFormData, setItemFormData] = useState({
    name: "",
    description: "",
    price: 0,
    categoryId: data.categories[0]?.id || "burgers",
    image: "",
    calories: 500,
    badge: "",
    isAvailable: true,
  });

  // حالة نافذة الخصم السريع
  const [discountModalItem, setDiscountModalItem] = useState<MenuItem | null>(null);
  const [discountFormData, setDiscountFormData] = useState<Discount>({
    type: "percentage",
    value: 10,
    active: true,
  });

  // حالة تعديل البيانات العامة
  const [generalFormData, setGeneralFormData] = useState({
    name: data.name,
    tagline: data.tagline,
    description: data.description,
    phone: data.contact.phone,
    whatsappNumber: data.contact.whatsappNumber,
    address: data.location.address,
    googleMapsUrl: data.location.googleMapsUrl,
    logo: data.logo,
    heroImage: data.heroImage,
  });

  // حالة رفع الصور
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  // رابط الموقع الأساسي للباركودات
  const [siteOrigin, setSiteOrigin] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSiteOrigin(window.location.origin);
    }
  }, []);

  // التحقق من المصادقة
  useEffect(() => {
    const auth = sessionStorage.getItem("restaurant_admin_auth");
    if (!auth) {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // جلب وتحديث الطلبات
  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const list = await getOrders();
      setOrders(list);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  // جلب وتحديث المناديب
  const loadDrivers = async () => {
    setDriversLoading(true);
    try {
      const list = await getDrivers();
      setDrivers(list);
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
    } finally {
      setDriversLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadOrders();
    loadDrivers();

    const handleNewOrder = () => {
      playNewOrderSound();
      showToast("🔔 وصلك طلب جديد عبر الموقع!");
      loadOrders();
    };

    const handleDriversUpdated = () => {
      loadDrivers();
    };

    window.addEventListener("new-order-received", handleNewOrder);
    window.addEventListener("order-status-changed", loadOrders);
    window.addEventListener("storage", loadOrders);
    window.addEventListener("drivers-updated", handleDriversUpdated);

    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      try {
        channel = supabase
          .channel("admin-orders-realtime")
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "orders" },
            () => {
              playNewOrderSound();
              showToast("🔔 وصلك طلب جديد عبر الموقع!");
              loadOrders();
            }
          )
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "orders" },
            () => {
              loadOrders();
            }
          )
          .subscribe();
      } catch (e) {
        console.warn("Supabase realtime subscription failed:", e);
      }
    }

    const interval = setInterval(loadOrders, 10000);

    return () => {
      window.removeEventListener("new-order-received", handleNewOrder);
      window.removeEventListener("order-status-changed", loadOrders);
      window.removeEventListener("storage", loadOrders);
      window.removeEventListener("drivers-updated", handleDriversUpdated);
      clearInterval(interval);
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [isAuthenticated]);

  // تغيير حالة الطلب
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const success = await updateOrderStatus(orderId, newStatus);
    if (success) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      const statusNames: Record<OrderStatus, string> = {
        pending: "جديد (بانتظار التأكيد)",
        preparing: "قيد التحضير والتجهيز",
        out_for_delivery: "قيد التوصيل مع المندوب",
        completed: "تم التسليم بنجاح",
        cancelled: "ملغي",
      };
      showToast(`تم تحديث حالة الطلب إلى: ${statusNames[newStatus]} ✓`);
    }
  };

  // مزامنة البيانات العامة مع الحالة
  useEffect(() => {
    setGeneralFormData({
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      phone: data.contact.phone,
      whatsappNumber: data.contact.whatsappNumber,
      address: data.location.address,
      googleMapsUrl: data.location.googleMapsUrl,
      logo: data.logo,
      heroImage: data.heroImage,
    });
  }, [data]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("restaurant_admin_auth");
    router.push("/admin/login");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-page text-text-muted text-sm">
        جاري التحقق من الصلاحيات...
      </div>
    );
  }

  // فتح نافذة صنف جديد
  const handleOpenNewItemModal = () => {
    setEditingItem(null);
    setItemFormData({
      name: "",
      description: "",
      price: 25,
      categoryId: data.categories[0]?.id || "burgers",
      image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80",
      calories: 450,
      badge: "",
      isAvailable: true,
    });
    setIsItemModalOpen(true);
  };

  // فتح نافذة تعديل صنف
  const handleOpenEditItemModal = (item: MenuItem) => {
    setEditingItem(item);
    setItemFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId || data.categories[0]?.id || "burgers",
      image: item.image,
      calories: item.calories || 0,
      badge: item.badge || "",
      isAvailable: item.isAvailable ?? true,
    });
    setIsItemModalOpen(true);
  };

  // حفظ الصنف (جديد أو تعديل)
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      await updateMenuItem({
        ...editingItem,
        ...itemFormData,
        price: Number(itemFormData.price),
        calories: Number(itemFormData.calories),
      });
      showToast("تم تحديث الصنف بنجاح ✓");
    } else {
      await addMenuItem({
        ...itemFormData,
        price: Number(itemFormData.price),
        calories: Number(itemFormData.calories),
      });
      showToast("تمت إضافة الصنف بنجاح ✓");
    }
    setIsItemModalOpen(false);
  };

  // فتح نافذة الخصم
  const handleOpenDiscountModal = (item: MenuItem) => {
    setDiscountModalItem(item);
    setDiscountFormData(
      item.discount || {
        type: "percentage",
        value: 10,
        active: true,
      }
    );
  };

  // حفظ الخصم
  const handleSaveDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (discountModalItem) {
      await updateItemDiscount(discountModalItem.id, discountFormData);
      showToast("تم تحديث الخصم بنجاح ✓");
      setDiscountModalItem(null);
    }
  };

  // حفظ البيانات العامة
  const handleSaveGeneralInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateGeneralInfo({
      name: generalFormData.name,
      tagline: generalFormData.tagline,
      description: generalFormData.description,
      logo: generalFormData.logo,
      heroImage: generalFormData.heroImage,
      contact: {
        ...data.contact,
        phone: generalFormData.phone,
        whatsappNumber: generalFormData.whatsappNumber,
      },
      location: {
        ...data.location,
        address: generalFormData.address,
        googleMapsUrl: generalFormData.googleMapsUrl,
      },
    });
    showToast("تم حفظ بيانات المطعم بنجاح ✓");
  };

  // محاكاة رفع صورة
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setUploadedImageUrl(result);
        showToast("تم تحميل الصورة بنجاح! يمكنك نسخ الرابط لاستخدامه ✓");
      };
      reader.readAsDataURL(file);
    }
  };


  const handleDownloadQR = (canvasId: string, filename: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      link.click();
      showToast("تم تحميل صورة الباركود بنجاح ✓");
    }
  };

  // دوال إدارة المناديب
  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverFormData.name.trim() || !driverFormData.phone.trim()) {
      showToast("يرجى إدخال اسم المندوب ورقم هاتفه");
      return;
    }
    await createDriver({
      name: driverFormData.name.trim(),
      phone: driverFormData.phone.trim(),
      pin: driverFormData.pin.trim() || "1234",
    });
    setDriverFormData({ name: "", phone: "", pin: "1234" });
    setIsDriverModalOpen(false);
    showToast("تمت إضافة المندوب بنجاح ✓");
    loadDrivers();
  };

  const handleToggleDriverStatus = async (driver: Driver) => {
    await updateDriver(driver.id, { isActive: !driver.isActive });
    showToast(driver.isActive ? `تم تعطيل المندوب ${driver.name}` : `تم تفعيل المندوب ${driver.name} بنجاح ✓`);
    loadDrivers();
  };

  const handleDeleteDriver = async (driverId: string, driverName: string) => {
    if (confirm(`هل أنت متأكد من رغبتك بحذف المندوب (${driverName})؟`)) {
      await deleteDriver(driverId);
      showToast(`تم حذف المندوب ${driverName} بنجاح ✓`);
      loadDrivers();
    }
  };

  // مشاركة رابط تسجيل الدخول مع المندوب
  const handleShareDriver = async (driver: Driver) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const driverUrl = `${origin}/driver`;
    const shareText = `مرحباً ${driver.name}،\nرابط تطبيق التوصيل الخاص بك:\n${driverUrl}\n\nبيانات الدخول:\n📱 رقم الهاتف: ${driver.phone}\n🔑 رمز الدخول: ${driver.pin || "1234"}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `تطبيق التوصيل - ${data.name}`,
          text: shareText,
          url: driverUrl,
        });
        showToast("تم فتح المشاركة بنجاح ✓");
        return;
      } catch (err: any) {
        if (err?.name === "AbortError") return;
      }
    }

    // Fallback: النسخ للحافظة
    try {
      await navigator.clipboard.writeText(shareText);
      showToast("تم نسخ رابط وبيانات المندوب للحافظة بنجاح ✓");
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = shareText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showToast("تم نسخ رابط وبيانات الدخول ✓");
    }
  };

  // تعيين مندوب لطلب
  const handleOpenAssignModal = (order: Order) => {
    const activeDrivers = drivers.filter((d) => d.isActive);
    if (activeDrivers.length === 0) {
      showToast("⚠️ لا يوجد مناديب نشطين حالياً. يرجى إضافة أو تفعيل مندوب أولاً");
      setActiveTab("drivers");
      return;
    }
    setAssigningOrder(order);
  };

  const handleConfirmAssignDriver = async (orderId: string, driver: Driver) => {
    setIsAssigningLoading(true);
    try {
      await assignDriverToOrder(orderId, driver.id, driver.name);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: "out_for_delivery",
                assignedDriverId: driver.id,
                assignedDriverName: driver.name,
                assignedAt: new Date().toISOString(),
              }
            : o
        )
      );
      setAssigningOrder(null);
      showToast(`تم إسناد الطلب للمندوب (${driver.name}) وهو الآن قيد التوصيل 🛵 ✓`);
    } catch {
      showToast("حدث خطأ أثناء تعيين المندوب");
    } finally {
      setIsAssigningLoading(false);
    }
  };

  const pendingOrdersCount = orders.filter(
    (o) => o.status === "pending" || o.status === "preparing" || o.status === "out_for_delivery"
  ).length;

  return (
    <div className="min-h-screen bg-bg-page text-text-main">
      {/* التنبيه العائم (Toast) */}
      {toastMessage && (
        <div className="fixed top-5 start-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-btn shadow-xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* الشريط العلوي للوحة التحكم */}
      <header className="sticky top-0 z-30 bg-surface border-b border-border-subtle shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-primary-light text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base block">
                لوحة تحكم صاحب المطعم
              </span>
              <span className="text-[11px] text-text-muted">
                {data.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="min-h-[40px] px-3 py-1.5 rounded-btn bg-bg-page hover:bg-border-subtle text-text-main text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>معاينة الموقع</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[40px] p-2 rounded-btn bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* أشرطة التبويب Responsive */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2 border-t border-border-subtle/50">
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`min-h-[42px] px-3.5 sm:px-4 py-2 rounded-btn text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 relative ${
              activeTab === "orders"
                ? "bg-primary text-white shadow-xs"
                : "bg-bg-page text-text-muted hover:text-text-main"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>إدارة الطلبات</span>
            {pendingOrdersCount > 0 && (
              <span className="ms-1 px-1.5 py-0.5 text-[10px] font-black rounded-full bg-red-500 text-white animate-pulse">
                {pendingOrdersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("mode")}
            className={`min-h-[42px] px-3.5 sm:px-4 py-2 rounded-btn text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeTab === "mode"
                ? "bg-primary text-white shadow-xs"
                : "bg-bg-page text-text-muted hover:text-text-main"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>سويتش النمط والحالة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("items")}
            className={`min-h-[42px] px-3.5 sm:px-4 py-2 rounded-btn text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeTab === "items"
                ? "bg-primary text-white shadow-xs"
                : "bg-bg-page text-text-muted hover:text-text-main"
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>إدارة الأصناف والخصومات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`min-h-[42px] px-3.5 sm:px-4 py-2 rounded-btn text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeTab === "general"
                ? "bg-primary text-white shadow-xs"
                : "bg-bg-page text-text-muted hover:text-text-main"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>بيانات المطعم</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("images")}
            className={`min-h-[42px] px-3.5 sm:px-4 py-2 rounded-btn text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeTab === "images"
                ? "bg-primary text-white shadow-xs"
                : "bg-bg-page text-text-muted hover:text-text-main"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>رفع الصور</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("qrcode")}
            className={`min-h-[42px] px-3.5 sm:px-4 py-2 rounded-btn text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeTab === "qrcode"
                ? "bg-primary text-white shadow-xs"
                : "bg-bg-page text-text-muted hover:text-text-main"
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>الباركود (QR Codes)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("drivers")}
            className={`min-h-[42px] px-3.5 sm:px-4 py-2 rounded-btn text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
              activeTab === "drivers"
                ? "bg-primary text-white shadow-xs"
                : "bg-bg-page text-text-muted hover:text-text-main"
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>المناديب</span>
            {drivers.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-white font-black">
                {drivers.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* المحتوى الرئيسي للوحة التحكم */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-20">
        {/* ============================================================
            التبويب 0: إدارة واستقبال الطلبات (Orders Dashboard)
           ============================================================ */}
        {activeTab === "orders" && (() => {
          const pendingCount = orders.filter((o) => o.status === "pending").length;
          const preparingCount = orders.filter((o) => o.status === "preparing").length;
          const deliveringCount = orders.filter((o) => o.status === "out_for_delivery").length;
          const completedCount = orders.filter((o) => o.status === "completed").length;
          const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

          const filteredOrders = orders.filter((order) => {
            const matchStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
            const q = orderSearchQuery.trim().toLowerCase();
            const matchSearch =
              !q ||
              order.orderNumber.toString().includes(q) ||
              order.customerName.toLowerCase().includes(q) ||
              order.customerPhone.toLowerCase().includes(q) ||
              (order.customerAddress && order.customerAddress.toLowerCase().includes(q));
            return matchStatus && matchSearch;
          });

          return (
            <div className="space-y-6">
              {/* الرأس: العنوان وأزرار التحديث والفحص الصوتي */}
              <div className="bg-surface rounded-card p-5 sm:p-6 border border-border-subtle shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-base sm:text-xl font-black text-text-main flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    <span>لوحة استقبال وإدارة الطلبات الحية</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-text-muted mt-1">
                    استقبال فوري للطلبات المباشرة من الموقع وتحديث حالاتها، مع إشعار صوتي عند وصول أي طلب جديد.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      playNewOrderSound();
                      showToast("🔊 تم تجربة صوت رنين الطلبات الجديدة");
                    }}
                    className="min-h-[40px] px-3 py-2 rounded-btn bg-bg-page hover:bg-border-subtle border border-border-subtle text-text-main text-xs font-bold flex items-center gap-1.5 transition-colors"
                    title="تجربة صوت التنبيه"
                  >
                    <Volume2 className="w-4 h-4 text-primary" />
                    <span>تجربة الصوت</span>
                  </button>

                  <button
                    type="button"
                    onClick={loadOrders}
                    disabled={ordersLoading}
                    className="min-h-[40px] px-4 py-2 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-60"
                  >
                    <RefreshCw className={`w-4 h-4 ${ordersLoading ? "animate-spin" : ""}`} />
                    <span>تحديث</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsClearModalOpen(true)}
                    disabled={ordersLoading || orders.length === 0}
                    className="min-h-[40px] px-3.5 py-2 rounded-btn bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="تصفير ومسح جميع الطلبات من السيرفر والنظام"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span>تصفير الطلبات</span>
                  </button>
                </div>
              </div>

              {/* بطاقات الإحصائيات السريعة */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div
                  onClick={() => setOrderStatusFilter("pending")}
                  className={`p-4 rounded-card border cursor-pointer transition-all ${
                    orderStatusFilter === "pending"
                      ? "border-amber-500 bg-amber-500/10 shadow-xs"
                      : "border-border-subtle bg-surface hover:border-amber-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700">بانتظار التأكيد</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-amber-600">{pendingCount}</span>
                    <span className="text-[11px] text-text-muted">طلب جديد</span>
                  </div>
                </div>

                <div
                  onClick={() => setOrderStatusFilter("preparing")}
                  className={`p-4 rounded-card border cursor-pointer transition-all ${
                    orderStatusFilter === "preparing"
                      ? "border-blue-500 bg-blue-500/10 shadow-xs"
                      : "border-border-subtle bg-surface hover:border-blue-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700">قيد التجهيز</span>
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-blue-600">{preparingCount}</span>
                    <span className="text-[11px] text-text-muted">قيد التحضير</span>
                  </div>
                </div>

                <div
                  onClick={() => setOrderStatusFilter("completed")}
                  className={`p-4 rounded-card border cursor-pointer transition-all ${
                    orderStatusFilter === "completed"
                      ? "border-emerald-500 bg-emerald-500/10 shadow-xs"
                      : "border-border-subtle bg-surface hover:border-emerald-500/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700">تم التسليم</span>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-emerald-600">{completedCount}</span>
                    <span className="text-[11px] text-text-muted">طلب مكتمل</span>
                  </div>
                </div>

                <div
                  onClick={() => setOrderStatusFilter("all")}
                  className={`p-4 rounded-card border cursor-pointer transition-all ${
                    orderStatusFilter === "all"
                      ? "border-primary bg-primary-light/40 shadow-xs"
                      : "border-border-subtle bg-surface hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text-main">إجمالي الطلبات</span>
                    <Inbox className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-black text-text-main">{orders.length}</span>
                    <span className="text-[11px] text-text-muted">طلب مسجل</span>
                  </div>
                </div>
              </div>

              {/* شريط الفلاتر والبحث */}
              <div className="bg-surface rounded-card p-4 border border-border-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* أزرار الفلترة */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter("all")}
                    className={`px-3 py-1.5 rounded-btn text-xs font-bold whitespace-nowrap transition-all ${
                      orderStatusFilter === "all"
                        ? "bg-text-main text-white"
                        : "bg-bg-page text-text-muted hover:text-text-main"
                    }`}
                  >
                    الكل ({orders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter("pending")}
                    className={`px-3 py-1.5 rounded-btn text-xs font-bold whitespace-nowrap transition-all ${
                      orderStatusFilter === "pending"
                        ? "bg-amber-600 text-white"
                        : "bg-bg-page text-text-muted hover:text-text-main"
                    }`}
                  >
                    جديد ({pendingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter("preparing")}
                    className={`px-3 py-1.5 rounded-btn text-xs font-bold whitespace-nowrap transition-all ${
                      orderStatusFilter === "preparing"
                        ? "bg-blue-600 text-white"
                        : "bg-bg-page text-text-muted hover:text-text-main"
                    }`}
                  >
                    قيد التحضير ({preparingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter("out_for_delivery")}
                    className={`px-3 py-1.5 rounded-btn text-xs font-bold whitespace-nowrap transition-all ${
                      orderStatusFilter === "out_for_delivery"
                        ? "bg-blue-600 text-white"
                        : "bg-bg-page text-text-muted hover:text-text-main"
                    }`}
                  >
                    قيد التوصيل ({deliveringCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter("completed")}
                    className={`px-3 py-1.5 rounded-btn text-xs font-bold whitespace-nowrap transition-all ${
                      orderStatusFilter === "completed"
                        ? "bg-emerald-600 text-white"
                        : "bg-bg-page text-text-muted hover:text-text-main"
                    }`}
                  >
                    تم التسليم ({completedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderStatusFilter("cancelled")}
                    className={`px-3 py-1.5 rounded-btn text-xs font-bold whitespace-nowrap transition-all ${
                      orderStatusFilter === "cancelled"
                        ? "bg-red-600 text-white"
                        : "bg-bg-page text-text-muted hover:text-text-main"
                    }`}
                  >
                    ملغي ({cancelledCount})
                  </button>
                </div>

                {/* حقل البحث */}
                <div className="relative min-w-[240px]">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="بحث برقم الطلب، الاسم، أو الهاتف..."
                    className="w-full ps-9 pe-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none focus:border-primary"
                  />
                  {orderSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setOrderSearchQuery("")}
                      className="absolute end-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* قائمة كروت الطلبات */}
              {filteredOrders.length === 0 ? (
                <div className="bg-surface rounded-card p-12 text-center border border-border-subtle">
                  <div className="w-14 h-14 mx-auto rounded-full bg-bg-page flex items-center justify-center text-text-muted mb-3">
                    <Inbox className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-sm text-text-main mb-1">
                    لا توجد طلبات مطابقة حالياً
                  </h3>
                  <p className="text-xs text-text-muted">
                    {orderSearchQuery || orderStatusFilter !== "all"
                      ? "جرب تغيير خيارات الفلترة أو مسح عبارة البحث"
                      : "ستظهر أي طلبات جديدة يقوم الزبائن بتقديمها هنا فوراً وبشكل حي"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const formattedDate = new Date(order.createdAt).toLocaleDateString("ar-IQ", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    // تنظيف رقم الهاتف لرابط الواتساب والاتصال
                    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, "");

                    return (
                      <div
                        key={order.id}
                        className={`bg-surface rounded-card p-4 sm:p-5 border transition-all shadow-xs ${
                          order.status === "pending"
                            ? "border-amber-400/80 bg-amber-500/[0.02]"
                            : order.status === "preparing"
                            ? "border-blue-300"
                            : order.status === "out_for_delivery"
                            ? "border-blue-400/80 bg-blue-500/[0.02]"
                            : "border-border-subtle"
                        }`}
                      >
                        {/* الجزء العلوي: رقم الطلب + المصدر + الحالة + التاريخ */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-border-subtle">
                          <div className="flex items-center gap-2.5">
                            <span className="font-black text-base sm:text-lg text-text-main">
                              #{order.orderNumber}
                            </span>

                            <span
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                order.orderSource === "طلب من الموقع"
                                  ? "bg-primary-light text-primary border border-primary/20"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {order.orderSource}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-text-muted flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formattedDate}</span>
                            </span>

                            {/* شارة الحالة */}
                            {order.status === "pending" && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                <span>جديد (بانتظار التأكيد)</span>
                              </span>
                            )}
                            {order.status === "preparing" && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-blue-600 animate-spin" />
                                <span>قيد التحضير والتجهيز</span>
                              </span>
                            )}
                            {order.status === "out_for_delivery" && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1.5">
                                <Bike className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                                <span>قيد التوصيل {order.assignedDriverName ? `(مع ${order.assignedDriverName})` : ""}</span>
                              </span>
                            )}
                            {order.status === "completed" && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>تم التسليم</span>
                              </span>
                            )}
                            {order.status === "cancelled" && (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                                <X className="w-3 h-3 text-red-600" />
                                <span>ملغي</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* تفاصيل العميل والوجبات المطلوبة */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3.5 border-b border-border-subtle">
                          {/* بيانات الزبون */}
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <User className="w-3.5 h-3.5 text-text-muted" />
                              <span className="font-bold text-text-main text-sm">
                                {order.customerName}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <a
                                href={`tel:${order.customerPhone}`}
                                className="font-semibold text-primary hover:underline flex items-center gap-1 dir-ltr text-right"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>{order.customerPhone}</span>
                              </a>

                              <a
                                href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                                  `مرحباً ${order.customerName}، معك مطعم ${data.name} بخصوص طلبك رقم #${order.orderNumber}.`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-0.5 rounded-badge bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-600" />
                                <span>محادثة واتساب</span>
                              </a>
                            </div>

                            {/* موقع التوصيل وخرائط قوقل */}
                            {(order.customerLocation?.mapsUrl || order.customerAddress) && (
                              <div className="pt-1 space-y-1.5">
                                {order.customerLocation?.mapsUrl ? (
                                  <a
                                    href={order.customerLocation.mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-btn bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors shadow-2xs"
                                  >
                                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                    <span>🗺️ فتح الموقع بخرائط قوقل</span>
                                    <ExternalLink className="w-3 h-3 text-blue-500" />
                                  </a>
                                ) : (
                                  <div className="flex items-start gap-1.5 text-text-muted">
                                    <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
                                    <span>{order.customerAddress}</span>
                                  </div>
                                )}

                                {/* الملاحظة الإضافية أو النقطة الدالة إن وجدت */}
                                {(order.customerLocation?.notes || (order.customerLocation?.mapsUrl && order.customerAddress && order.customerAddress !== "موقع محدد على الخريطة")) && (
                                  <div className="text-[11px] text-text-muted flex items-start gap-1 ps-1">
                                    <span className="font-semibold text-text-main">نقطة دالة:</span>
                                    <span>{order.customerLocation?.notes || order.customerAddress}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {order.notes && (
                              <div className="p-2.5 rounded-card bg-amber-500/10 border border-amber-500/20 text-amber-900 text-[11px] mt-2">
                                <span className="font-bold block mb-0.5">ملاحظات الزبون:</span>
                                <span>{order.notes}</span>
                              </div>
                            )}
                          </div>

                          {/* قائمة الأصناف المطلوبة */}
                          <div className="bg-bg-page/70 rounded-card p-3 border border-border-subtle/70">
                            <span className="text-[11px] font-bold text-text-muted block mb-2">
                              الأصناف المطلوبة:
                            </span>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto">
                              {order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs py-1 border-b border-border-subtle/40 last:border-0"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center">
                                      {item.quantity}x
                                    </span>
                                    <span className="font-semibold text-text-main">{item.name}</span>
                                  </div>
                                  <span className="font-bold text-text-main">
                                    {formatPrice(item.price * item.quantity, data.currency, data.currencyPosition)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* الجزء السفلي: الإجمالي وأزرار التحكم بالحالة */}
                        <div className="pt-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-text-muted">المجموع الكلي:</span>
                            <span className="text-base sm:text-lg font-black text-primary">
                              {formatPrice(order.totalAmount, data.currency, data.currencyPosition)}
                            </span>
                          </div>

                          {/* أزرار التحكم التفاعلية */}
                          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                            {order.status === "pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAssignModal(order)}
                                  className="min-h-[38px] px-3.5 py-1.5 rounded-btn bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                                  title="تعيين مندوب توصيل لهذا الطلب"
                                >
                                  <Bike className="w-4 h-4" />
                                  <span>تعيين مندوب</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(order.id, "preparing")}
                                  className="min-h-[38px] px-3.5 py-1.5 rounded-btn bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>قبول وبدء التحضير</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(order.id, "cancelled")}
                                  className="min-h-[38px] px-3 py-1.5 rounded-btn bg-bg-page hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>إلغاء الطلب</span>
                                </button>
                              </>
                            )}

                            {order.status === "preparing" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAssignModal(order)}
                                  className="min-h-[38px] px-3.5 py-1.5 rounded-btn bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                                  title="تعيين مندوب توصيل لهذا الطلب"
                                >
                                  <Bike className="w-4 h-4" />
                                  <span>تعيين مندوب</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(order.id, "completed")}
                                  className="min-h-[38px] px-4 py-1.5 rounded-btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>تم التسليم والتوصيل</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(order.id, "cancelled")}
                                  className="min-h-[38px] px-3 py-1.5 rounded-btn bg-bg-page hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>إلغاء</span>
                                </button>
                              </>
                            )}

                            {order.status === "out_for_delivery" && (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs text-blue-800 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-btn font-bold flex items-center gap-1.5">
                                  <Bike className="w-4 h-4 text-blue-600" />
                                  <span>مع المندوب: {order.assignedDriverName || "المندوب"}</span>
                                </span>

                                <button
                                  type="button"
                                  onClick={() => handleOpenAssignModal(order)}
                                  className="min-h-[38px] px-3.5 py-1.5 rounded-btn bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                                  title="تغيير المندوب المعين لهذا الطلب"
                                >
                                  <Bike className="w-3.5 h-3.5 text-amber-600" />
                                  <span>تغيير المندوب</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(order.id, "completed")}
                                  className="min-h-[38px] px-3.5 py-1.5 rounded-btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                                  title="تأكيد تسليم الطلب يدوياً"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>تم التسليم</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(order.id, "cancelled")}
                                  className="min-h-[38px] px-3 py-1.5 rounded-btn bg-bg-page hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                                  title="إلغاء الطلب"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>إلغاء</span>
                                </button>
                              </div>
                            )}

                            {order.status === "completed" && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                                  <span>تم إنجاز الطلب بنجاح</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(order.id, "preparing")}
                                  className="min-h-[32px] px-2.5 py-1 rounded-btn bg-bg-page hover:bg-border-subtle text-text-muted text-[11px] font-semibold border border-border-subtle transition-colors"
                                >
                                  إعادة لـ قيد التحضير
                                </button>
                              </div>
                            )}

                            {order.status === "cancelled" && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-red-600 font-bold flex items-center gap-1">
                                  <X className="w-3.5 h-3.5" />
                                  <span>الطلب ملغي</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStatusChange(order.id, "pending")}
                                  className="min-h-[32px] px-2.5 py-1 rounded-btn bg-bg-page hover:bg-border-subtle text-text-muted text-[11px] font-semibold border border-border-subtle transition-colors"
                                >
                                  إعادة فتح كطلب جديد
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* ============================================================
            التبويب 1: سويتش نمط المنيو وحالة المطعم
           ============================================================ */}
        {activeTab === "mode" && (
          <div className="space-y-6 max-w-2xl">
            {/* بطاقة نمط المنيو وطريقة الطلب */}
            <div className="bg-surface rounded-card p-5 sm:p-6 border border-border-subtle shadow-xs space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-text-main flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <span>
                    {data.siteMode === "display"
                      ? "نمط الموقع الحالي (عرض واستعراض فقط)"
                      : "طريقة إتمام الطلب والتحكم بالسلة (Checkout Method)"}
                  </span>
                </h2>
                <p className="text-xs text-text-muted mt-1">
                  {data.siteMode === "display"
                    ? "الموقع مضبوط مركزياً على وضع العرض فقط (Display Only)، والسلة وأزرار الطلب معطلة."
                    : "حدد كيف يكمل الزبون طلبه من السلة (عبر الموقع مباشرة، أو عبر واتساب، أو كلاهما معاً)."}
                </p>
              </div>

              {data.siteMode === "display" ? (
                <div className="p-4 rounded-card border border-blue-200 bg-blue-50/50 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-blue-900 block text-sm">
                      وضع العرض فقط مفعّل (Display Only)
                    </span>
                    <p className="text-blue-800 leading-relaxed">
                      المنيو يظهر للزبائن لتصفح الوجبات والأسعار فقط. خيارات إتمام الطلب والسلة مخفية تلقائياً في هذا الوضع.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* الخيارات الفرعية لطريقة إتمام الطلب (Checkout Method) */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-text-main flex items-center gap-1.5 mb-2">
                      <span>طريقة إتمام الطلب المتاحة للزبون في السلة:</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {/* خيار 1: عبر الموقع فقط */}
                      <button
                        type="button"
                        onClick={() => {
                          updateCheckoutMethod("website");
                          showToast("تم تحديد طريقة الطلب: عبر الموقع فقط (يُحفظ بلوحة التحكم)");
                        }}
                        className={`p-2.5 rounded-btn text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all text-center ${
                          data.checkoutMethod === "website"
                            ? "bg-primary text-white border-primary shadow-xs"
                            : "bg-surface border-border-subtle text-text-muted hover:text-text-main hover:border-primary/40"
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <span>🌐 عبر الموقع فقط</span>
                        </span>
                        <span className="text-[10px] opacity-80 font-normal">
                          (يُحفظ بلوحة التحكم)
                        </span>
                      </button>

                      {/* خيار 2: عبر واتساب فقط */}
                      <button
                        type="button"
                        onClick={() => {
                          updateCheckoutMethod("whatsapp");
                          showToast("تم تحديد طريقة الطلب: عبر واتساب فقط");
                        }}
                        className={`p-2.5 rounded-btn text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all text-center ${
                          data.checkoutMethod === "whatsapp"
                            ? "bg-whatsapp text-white border-whatsapp shadow-xs"
                            : "bg-surface border-border-subtle text-text-muted hover:text-text-main hover:border-whatsapp/40"
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <span>💬 عبر واتساب فقط</span>
                        </span>
                        <span className="text-[10px] opacity-80 font-normal">
                          (إرسال فاتورة لواتساب)
                        </span>
                      </button>

                      {/* خيار 3: كلاهما معاً */}
                      <button
                        type="button"
                        onClick={() => {
                          updateCheckoutMethod("both");
                          showToast("تم تحديد طريقة الطلب: كلاهما متاحان معاً للزبون");
                        }}
                        className={`p-2.5 rounded-btn text-xs font-bold flex flex-col items-center justify-center gap-1 border transition-all text-center ${
                          data.checkoutMethod === "both" || !data.checkoutMethod
                            ? "bg-text-main text-white border-text-main shadow-xs"
                            : "bg-surface border-border-subtle text-text-muted hover:text-text-main hover:border-text-main/40"
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          <span>⚡ كلاهما معاً</span>
                        </span>
                        <span className="text-[10px] opacity-80 font-normal">
                          (الموقع + واتساب)
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* بطاقة حالة المطعم: مفتوح / مغلق */}
            <div className="bg-surface rounded-card p-5 sm:p-6 border border-border-subtle shadow-xs flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-text-main">
                  حالة استقبال الطلبات
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  التحكم في شارة فتح أو إغلاق المطعم المعروضة للزبائن
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const currentOpen = data.isOpenStatus.defaultStatus === "open";
                  toggleIsOpen(!currentOpen);
                  showToast(
                    !currentOpen
                      ? "المطعم الآن مفتوح ويستقبل الطلبات 🟢"
                      : "المطعم مغلق حالياً 🔴"
                  );
                }}
                className={`min-h-[44px] px-5 py-2.5 rounded-btn font-bold text-xs sm:text-sm transition-all shadow-xs ${
                  data.isOpenStatus.defaultStatus === "open"
                    ? "bg-emerald-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {data.isOpenStatus.defaultStatus === "open"
                  ? "مفتوح الآن 🟢"
                  : "مغلق حالياً 🔴"}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            التبويب 2: إدارة الأصناف والوجبات والخصومات
           ============================================================ */}
        {activeTab === "items" && (
          <div className="space-y-6">
            {/* الشريط العلوي لإدارة الأصناف: زر الإضافة وفلتر الأقسام */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface p-4 rounded-card border border-border-subtle">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategoryFilter("all")}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-btn text-xs font-bold shrink-0 transition-colors ${
                    selectedCategoryFilter === "all"
                      ? "bg-primary text-white"
                      : "bg-bg-page text-text-muted hover:text-text-main"
                  }`}
                >
                  جميع الأصناف
                </button>
                {data.categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(c.id)}
                    className={`min-h-[38px] px-3.5 py-1.5 rounded-btn text-xs font-bold shrink-0 transition-colors ${
                      selectedCategoryFilter === c.id
                        ? "bg-primary text-white"
                        : "bg-bg-page text-text-muted hover:text-text-main"
                    }`}
                  >
                    <span>{c.icon}</span> {c.name}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleOpenNewItemModal}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 rounded-btn bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة صنف جديد</span>
              </button>
            </div>

            {/* قائمة الأصناف */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.categories
                .filter(
                  (c) =>
                    selectedCategoryFilter === "all" ||
                    c.id === selectedCategoryFilter
                )
                .flatMap((c) => c.items)
                .map((item) => {
                  const discountedPrice = getDiscountedPrice(item);
                  const hasDiscount = item.discount?.active && item.discount.value > 0;
                  const isAvailable = item.isAvailable !== false;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-card bg-surface border transition-all flex flex-col justify-between gap-3 ${
                        isAvailable
                          ? "border-border-subtle"
                          : "border-red-200 bg-red-50/20"
                      }`}
                    >
                      {/* رأس بطاقة الصنف */}
                      <div className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-badge overflow-hidden shrink-0 bg-bg-page">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="font-bold text-sm text-text-main truncate">
                              {item.name}
                            </h4>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                                isAvailable
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {isAvailable ? "متوفر" : "غير متوفر"}
                            </span>
                          </div>

                          {/* السعر والخصم */}
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="text-sm font-black text-primary">
                              {formatPrice(discountedPrice, data.currency, data.currencyPosition)}
                            </span>
                            {hasDiscount && (
                              <span className="text-[11px] text-text-muted line-through">
                                {formatPrice(item.price, data.currency, data.currencyPosition)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* شريط أدوات الصنف (التحكم بالتوفر، الخصم، التعديل، الحذف) */}
                      <div className="pt-3 border-t border-border-subtle/80 flex items-center justify-between gap-2">
                        {/* سويتش التوفر بنقرة واحدة */}
                        <button
                          type="button"
                          onClick={async () => {
                            await toggleItemAvailability(item.id);
                            showToast(
                              isAvailable
                                ? `تم تعطيل توفر (${item.name})`
                                : `تم تفعيل توفر (${item.name})`
                            );
                          }}
                          className={`min-h-[38px] px-2.5 py-1 rounded-btn text-xs font-bold transition-colors ${
                            isAvailable
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "bg-red-50 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          {isAvailable ? "تعطيل التوفر" : "تفعيل التوفر"}
                        </button>

                        <div className="flex items-center gap-1.5">
                          {/* زر الخصم */}
                          <button
                            type="button"
                            onClick={() => handleOpenDiscountModal(item)}
                            title="إضافة أو تعديل خصم"
                            className={`min-h-[38px] min-w-[38px] rounded-btn flex items-center justify-center transition-colors ${
                              hasDiscount
                                ? "bg-secondary text-text-main font-bold"
                                : "bg-bg-page hover:bg-border-subtle text-text-muted"
                            }`}
                          >
                            <Tag className="w-4 h-4" />
                          </button>

                          {/* زر التعديل */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditItemModal(item)}
                            title="تعديل الصنف"
                            className="min-h-[38px] min-w-[38px] rounded-btn bg-bg-page hover:bg-border-subtle text-text-main flex items-center justify-center transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* زر الحذف */}
                          <button
                            type="button"
                            onClick={async () => {
                              if (confirm(`هل أنت متأكد من حذف وجبة (${item.name})؟`)) {
                                await deleteMenuItem(item.id);
                                showToast("تم حذف الصنف بنجاح ✓");
                              }
                            }}
                            title="حذف الصنف"
                            className="min-h-[38px] min-w-[38px] rounded-btn bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ============================================================
            التبويب 3: بيانات المطعم العامة
           ============================================================ */}
        {activeTab === "general" && (
          <div className="max-w-2xl bg-surface rounded-card p-5 sm:p-6 border border-border-subtle shadow-xs">
            <h2 className="text-base sm:text-lg font-black text-text-main mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              <span>تعديل بيانات وهوية المطعم</span>
            </h2>

            <form onSubmit={handleSaveGeneralInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-main mb-1">
                  اسم المطعم
                </label>
                <input
                  type="text"
                  required
                  value={generalFormData.name}
                  onChange={(e) =>
                    setGeneralFormData({ ...generalFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main mb-1">
                  الشعار الترويجي (Tagline)
                </label>
                <input
                  type="text"
                  value={generalFormData.tagline}
                  onChange={(e) =>
                    setGeneralFormData({ ...generalFormData, tagline: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main mb-1">
                  الوصف التعريفي (SEO)
                </label>
                <textarea
                  rows={2}
                  value={generalFormData.description}
                  onChange={(e) =>
                    setGeneralFormData({
                      ...generalFormData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-main mb-1 flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-whatsapp" />
                    <span>رقم الواتساب للطلبات</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={generalFormData.whatsappNumber}
                    onChange={(e) =>
                      setGeneralFormData({
                        ...generalFormData,
                        whatsappNumber: e.target.value,
                      })
                    }
                    placeholder="966500000000 (بدون +)"
                    className="w-full px-3 py-2.5 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none focus:ring-2 focus:ring-primary/20 dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-main mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span>رقم الاتصال المباشر</span>
                  </label>
                  <input
                    type="text"
                    value={generalFormData.phone}
                    onChange={(e) =>
                      setGeneralFormData({
                        ...generalFormData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none focus:ring-2 focus:ring-primary/20 dir-ltr text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>العنوان التفصيلي</span>
                </label>
                <input
                  type="text"
                  value={generalFormData.address}
                  onChange={(e) =>
                    setGeneralFormData({ ...generalFormData, address: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main mb-1">
                  رابط خرائط جوجل (Google Maps)
                </label>
                <input
                  type="url"
                  value={generalFormData.googleMapsUrl}
                  onChange={(e) =>
                    setGeneralFormData({
                      ...generalFormData,
                      googleMapsUrl: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none focus:ring-2 focus:ring-primary/20 dir-ltr text-left"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-main mb-1">
                    رابط اللوجو (Logo URL)
                  </label>
                  <input
                    type="url"
                    value={generalFormData.logo}
                    onChange={(e) =>
                      setGeneralFormData({ ...generalFormData, logo: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none dir-ltr text-left"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-main mb-1">
                    رابط صورة الغلاف (Hero Image)
                  </label>
                  <input
                    type="url"
                    value={generalFormData.heroImage}
                    onChange={(e) =>
                      setGeneralFormData({
                        ...generalFormData,
                        heroImage: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none dir-ltr text-left"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full min-h-[48px] py-3 rounded-btn bg-primary hover:bg-primary-hover text-white font-bold text-sm shadow-md transition-all active:scale-98"
              >
                حفظ التعديلات
              </button>
            </form>
          </div>
        )}

        {/* ============================================================
            التبويب 4: رفع الصور
           ============================================================ */}
        {activeTab === "images" && (
          <div className="max-w-xl bg-surface rounded-card p-5 sm:p-6 border border-border-subtle shadow-xs space-y-5">
            <div>
              <h2 className="text-base sm:text-lg font-black text-text-main flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                <span>رفع وتجهيز صور الوجبات</span>
              </h2>
              <p className="text-xs text-text-muted mt-1">
                اختر صورة من جوالك أو حاسوبك للحصول على رابط يمكنك لصقه في أي صنف أو في الشعار.
              </p>
            </div>

            <div className="p-6 border-2 border-dashed border-border-subtle hover:border-primary rounded-card text-center flex flex-col items-center justify-center bg-bg-page/50 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileUpload}
                id="file-upload-input"
                className="hidden"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center">
                <div className="p-3 rounded-full bg-primary-light text-primary mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-text-main">
                  اضغط هنا لاختيار صورة من جهازك
                </span>
                <span className="text-[11px] text-text-muted mt-1">
                  JPG, PNG, WebP (الحجم المفضل أقل من 2 ميجابايت)
                </span>
              </label>
            </div>

            {uploadedImageUrl && (
              <div className="p-4 rounded-card bg-bg-page border border-border-subtle space-y-3">
                <span className="text-xs font-bold text-text-main block">
                  معاينة الصورة المرفوعة:
                </span>
                <div className="relative w-full h-48 rounded-badge overflow-hidden bg-surface">
                  <Image
                    src={uploadedImageUrl}
                    alt="Uploaded"
                    fill
                    className="object-cover"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-text-muted mb-1">
                    رابط الصورة:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={uploadedImageUrl}
                      className="w-full px-3 py-2 rounded-input bg-surface border border-border-subtle text-xs text-text-main outline-none dir-ltr"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(uploadedImageUrl);
                        showToast("تم نسخ رابط الصورة إلى الحافظة ✓");
                      }}
                      className="min-h-[38px] px-3 py-1.5 rounded-btn bg-primary text-white text-xs font-bold shrink-0"
                    >
                      نسخ
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* ============================================================
            التبويب 5: توليد وتحميل الباركودات (QR Codes)
           ============================================================ */}
        {activeTab === "qrcode" && (() => {
          const currentBaseUrl = siteOrigin || (typeof window !== "undefined" ? window.location.origin : "");
          const landingUrl = `${currentBaseUrl}/`;
          const menuUrl = `${currentBaseUrl}/menu`;
          const inStoreDisplayUrl = `${currentBaseUrl}/menu/display`;

          return (
            <div className="space-y-6 max-w-5xl">
              {/* ترويسة قسم الباركود */}
              <div className="bg-surface rounded-card p-5 sm:p-6 border border-border-subtle shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-text-main flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary" />
                    <span>توليد وطباعة باركود المطعم (QR Codes)</span>
                  </h2>
                  <p className="text-xs text-text-muted mt-1">
                    باركودات رقمية عالية الدقة جاهزة للطباعة على الستاندات، الطاولات، والمنشورات التسويقية، تعمل فوراً داخل المتصفح بدون إنترنت خارجي.
                  </p>
                </div>
              </div>

              {/* شبكة الباركودات */}
              <div className={`grid grid-cols-1 ${data.siteMode === "both" ? "lg:grid-cols-3" : "md:grid-cols-2"} gap-6`}>
                {/* 1. باركود الواجهة التفاعلية (صفحة الهبوط) */}
                <div className="bg-surface rounded-card p-5 sm:p-6 border border-border-subtle shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary-light text-primary border border-primary/20">
                        الواجهة التفاعلية
                      </span>
                      <span className="text-[11px] text-text-muted">الصفحة الرئيسية</span>
                    </div>

                    <h3 className="font-extrabold text-sm sm:text-base text-text-main">
                      باركود الواجهة التفاعلية (صفحة الهبوط)
                    </h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      يوجه الزبون لصفحة الهبوط الترويجية الجذابة، ليتعرف على هوية المطعم ثم يضغط "اطلب الآن" للانتقال للمنيو.
                    </p>
                  </div>

                  {/* معاينة الباركود */}
                  <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-border-subtle/80 shadow-xs">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <QRCodeCanvas
                        id="qr-landing-canvas"
                        value={landingUrl}
                        size={220}
                        level="H"
                        marginSize={2}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 mt-3 flex items-center gap-1">
                      <span>امسح الكاميرا للتجربة</span>
                    </span>
                  </div>

                  {/* الرابط النصي وزر النسخ */}
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted mb-1">
                      الرابط الموجه إليه:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={landingUrl}
                        className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none dir-ltr font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(landingUrl);
                          showToast("تم نسخ رابط الواجهة التفاعلية بنجاح ✓");
                        }}
                        className="min-h-[38px] px-3 py-1.5 rounded-btn bg-bg-page hover:bg-border-subtle border border-border-subtle text-text-main text-xs font-bold shrink-0 flex items-center gap-1 transition-colors"
                        title="نسخ الرابط"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ</span>
                      </button>
                    </div>
                  </div>

                  {/* زر التحميل بجودة عالية */}
                  <button
                    type="button"
                    onClick={() => handleDownloadQR("qr-landing-canvas", `qrcode-landing-${data.name}.png`)}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-btn bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل الباركود للطباعة (PNG عالي الدقة)</span>
                  </button>
                </div>

                {/* 2. باركود المنيو المباشر / صفحة التوصيل */}
                <div className="bg-surface rounded-card p-5 sm:p-6 border border-border-subtle shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {data.siteMode === "both" ? "صفحة التوصيل للجمهور" : "المنيو المباشر"}
                      </span>
                      <span className="text-[11px] text-text-muted font-mono">/menu</span>
                    </div>

                    <h3 className="font-extrabold text-sm sm:text-base text-text-main">
                      {data.siteMode === "both"
                        ? "باركود صفحة التوصيل والطلب للجمهور"
                        : "باركود المنيو المباشر"}
                    </h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      {data.siteMode === "both"
                        ? "يوجه الزبون مباشرة لصفحة التوصيل العامة والطلب السريع مع كامل نظام السلة وإتمام الطلب للجمهور."
                        : "يوجه الزبون مباشرة لصفحة قائمة الطعام والطلب السريع دون المرور بصفحة الهبوط."}
                    </p>
                  </div>

                  {/* معاينة الباركود */}
                  <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-border-subtle/80 shadow-xs">
                    <div className="p-3 bg-white rounded-lg shadow-sm">
                      <QRCodeCanvas
                        id="qr-menu-canvas"
                        value={menuUrl}
                        size={220}
                        level="H"
                        marginSize={2}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 mt-3 flex items-center gap-1">
                      <span>امسح الكاميرا للتجربة</span>
                    </span>
                  </div>

                  {/* الرابط النصي وزر النسخ */}
                  <div>
                    <label className="block text-[11px] font-bold text-text-muted mb-1">
                      الرابط الموجه إليه:
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={menuUrl}
                        className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none dir-ltr font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(menuUrl);
                          showToast("تم نسخ رابط المنيو بنجاح ✓");
                        }}
                        className="min-h-[38px] px-3 py-1.5 rounded-btn bg-bg-page hover:bg-border-subtle border border-border-subtle text-text-main text-xs font-bold shrink-0 flex items-center gap-1 transition-colors"
                        title="نسخ الرابط"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ</span>
                      </button>
                    </div>
                  </div>

                  {/* زر التحميل بجودة عالية */}
                  <button
                    type="button"
                    onClick={() => handleDownloadQR("qr-menu-canvas", `qrcode-menu-${data.name}.png`)}
                    className="w-full min-h-[44px] py-2.5 px-4 rounded-btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل الباركود للطباعة (PNG عالي الدقة)</span>
                  </button>
                </div>

                {/* 3. باركود العرض داخل المطعم (طاولات الصالة) - يظهر حصراً عند تفعيل وضع "كلاهما" */}
                {data.siteMode === "both" && (
                  <div className="bg-surface rounded-card p-5 sm:p-6 border-2 border-purple-500/40 shadow-xs flex flex-col justify-between space-y-4 animate-in fade-in">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-purple-100 text-purple-800 border border-purple-300">
                          العرض الداخلي للطاولات
                        </span>
                        <span className="text-[11px] text-text-muted font-mono">/menu/display</span>
                      </div>

                      <h3 className="font-extrabold text-sm sm:text-base text-text-main">
                        باركود العرض داخل المطعم (طاولات الصالة)
                      </h3>
                      <p className="text-xs text-text-muted mt-1 leading-relaxed">
                        يُطبع ويُوضع على طاولات الصالة داخل المطعم. يعرض المنيو والأسعار فقط بدون سلة أو أزرار طلب (يختلف عن باركود التوصيل أعلاه المخصص للطلب الخارجي).
                      </p>
                    </div>

                    {/* معاينة الباركود */}
                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-border-subtle/80 shadow-xs">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <QRCodeCanvas
                          id="qr-display-canvas"
                          value={inStoreDisplayUrl}
                          size={220}
                          level="H"
                          marginSize={2}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-gray-500 mt-3 flex items-center gap-1">
                        <span>امسح الكاميرا للتجربة (عرض فقط)</span>
                      </span>
                    </div>

                    {/* الرابط النصي وزر النسخ */}
                    <div>
                      <label className="block text-[11px] font-bold text-text-muted mb-1">
                        الرابط الموجه إليه:
                      </label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          readOnly
                          value={inStoreDisplayUrl}
                          className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none dir-ltr font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(inStoreDisplayUrl);
                            showToast("تم نسخ رابط العرض داخل المطعم بنجاح ✓");
                          }}
                          className="min-h-[38px] px-3 py-1.5 rounded-btn bg-bg-page hover:bg-border-subtle border border-border-subtle text-text-main text-xs font-bold shrink-0 flex items-center gap-1 transition-colors"
                          title="نسخ الرابط"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ</span>
                        </button>
                      </div>
                    </div>

                    {/* زر التحميل بجودة عالية */}
                    <button
                      type="button"
                      onClick={() => handleDownloadQR("qr-display-canvas", `qrcode-tables-display-${data.name}.png`)}
                      className="w-full min-h-[44px] py-2.5 px-4 rounded-btn bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل باركود الطاولات للطباعة (PNG)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* بطاقة إرشادية ونصائح للطباعة */}
              <div className="p-4 sm:p-5 rounded-card bg-primary-light/30 border border-primary/20 text-xs text-text-main space-y-1.5">
                <h4 className="font-bold flex items-center gap-1.5 text-primary text-sm">
                  <span>💡 نصائح وتوجيهات للطباعة واستخدام الباركود:</span>
                </h4>
                <ul className="list-disc list-inside space-y-1 text-text-muted">
                  <li>الصور المحملة بصيغة PNG بدقة عالية ومعدل تصحيح أخطاء مرتفع (High Level)، مما يجعلها واضحة حتى لو تعرض الملصق لخدوش أو إضاءة منخفضة.</li>
                  <li>المقاس المقترح لملصقات الطاولات داخل الصالة: 7 × 7 سم أو 8 × 8 سم.</li>
                  <li>المقاس المقترح للستاندات وواجهة الكاشير: 12 × 12 سم أو 15 × 15 سم.</li>
                </ul>
              </div>
            </div>
          );
        })()}

        {/* ============================================================
            التبويب 6: إدارة المناديب (Drivers Management)
           ============================================================ */}
        {activeTab === "drivers" && (
          <div className="space-y-6 animate-in fade-in">
            {/* بطاقة الترويسة وأزرار الإجراء */}
            <div className="bg-surface rounded-card p-5 sm:p-6 border border-border-subtle shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-primary-light text-primary">
                    <Bike className="w-5 h-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-text-main">
                    إدارة مناديب التوصيل
                  </h2>
                </div>
                <p className="text-xs text-text-muted mt-1 max-w-xl">
                  سجل مناديب المطعم لتوزيع الطلبات عليهم ومتابعة إنجازها في واجهة المندوب الخاصة بهواتفهم.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/driver"
                  target="_blank"
                  className="min-h-[42px] px-3.5 py-2 rounded-btn bg-bg-page hover:bg-surface-hover border border-border-subtle text-xs font-bold text-text-main flex items-center gap-1.5 transition-colors"
                  title="فتح واجهة المندوب في نافذة جديدة"
                >
                  <ExternalLink className="w-4 h-4 text-primary" />
                  <span>معاينة واجهة المندوب</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setDriverFormData({ name: "", phone: "", pin: "1234" });
                    setIsDriverModalOpen(true);
                  }}
                  className="min-h-[42px] px-4 py-2 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة مندوب جديد</span>
                </button>
              </div>
            </div>

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-surface rounded-card p-4 border border-border-subtle shadow-xs">
                <span className="text-xs text-text-muted font-medium">إجمالي المناديب</span>
                <p className="text-xl sm:text-2xl font-black text-text-main mt-1">{drivers.length}</p>
              </div>

              <div className="bg-surface rounded-card p-4 border border-border-subtle shadow-xs">
                <span className="text-xs text-text-muted font-medium">المناديب النشطين</span>
                <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                  {drivers.filter((d) => d.isActive).length}
                </p>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-surface rounded-card p-4 border border-border-subtle shadow-xs">
                <span className="text-xs text-text-muted font-medium">طلبات قيد التوصيل حالياً</span>
                <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
                  {orders.filter((o) => o.status === "out_for_delivery").length}
                </p>
              </div>
            </div>

            {/* قائمة المناديب */}
            <div className="bg-surface rounded-card border border-border-subtle shadow-xs overflow-hidden">
              <div className="p-4 border-b border-border-subtle flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-text-main">
                  قائمة المناديب المسجلين ({drivers.length})
                </h3>
                {driversLoading && (
                  <RefreshCw className="w-4 h-4 animate-spin text-text-muted" />
                )}
              </div>

              {drivers.length === 0 ? (
                <div className="py-12 text-center text-text-muted space-y-3">
                  <div className="w-12 h-12 rounded-full bg-bg-page mx-auto flex items-center justify-center">
                    <Bike className="w-6 h-6 text-text-muted" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold">لا يوجد مناديب مسجلين حالياً</p>
                  <p className="text-xs text-text-muted max-w-sm mx-auto">
                    اضغط على زر &quot;إضافة مندوب جديد&quot; أعلاه لتسجيل أول مندوب وتعيين الطلبات له.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border-subtle">
                  {drivers.map((driver) => {
                    const activeDeliveries = orders.filter(
                      (o) => o.assignedDriverId === driver.id && o.status === "out_for_delivery"
                    ).length;

                    return (
                      <div
                        key={driver.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-bg-page/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                              driver.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            <Bike className="w-5 h-5" />
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-text-main">
                                {driver.name}
                              </h4>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  driver.isActive
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                                }`}
                              >
                                {driver.isActive ? "نشط" : "معطل"}
                              </span>

                              {activeDeliveries > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                                  {activeDeliveries} طلب جاري
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-xs text-text-muted mt-1 font-mono">
                              <span className="flex items-center gap-1 dir-ltr">
                                <Phone className="w-3 h-3 text-text-muted" />
                                {driver.phone}
                              </span>

                              <span className="flex items-center gap-1 font-mono bg-bg-page px-2 py-0.5 rounded text-[11px] border border-border-subtle">
                                <Key className="w-3 h-3 text-text-muted" />
                                رمز الدخول: {driver.pin || "1234"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleShareDriver(driver)}
                            className="min-h-[36px] px-3 py-1.5 rounded-btn bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                            title="مشاركة رابط وبيانات الدخول مع المندوب"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>مشاركة الرابط</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleDriverStatus(driver)}
                            className={`min-h-[36px] px-3 py-1.5 rounded-btn text-xs font-bold border transition-colors ${
                              driver.isActive
                                ? "bg-bg-page text-text-muted border-border-subtle hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            }`}
                          >
                            {driver.isActive ? "تعطيل" : "تفعيل"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteDriver(driver.id, driver.name)}
                            className="min-h-[36px] p-2 rounded-btn text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="حذف المندوب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* نافذة منبثقة: إضافة أو تعديل صنف */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-surface rounded-card p-5 sm:p-6 shadow-2xl border border-border-subtle max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-black text-text-main mb-4">
              {editingItem ? "تعديل الصنف" : "إضافة صنف جديد للقائمة"}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-main mb-1">
                  اسم الوجبة
                </label>
                <input
                  type="text"
                  required
                  value={itemFormData.name}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, name: e.target.value })
                  }
                  placeholder="مثال: سلطان ترافل برجر"
                  className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main mb-1">
                  القسم التابع له
                </label>
                <select
                  value={itemFormData.categoryId}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none"
                >
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main mb-1">
                  الوصف والمكونات
                </label>
                <textarea
                  rows={2}
                  value={itemFormData.description}
                  onChange={(e) =>
                    setItemFormData({
                      ...itemFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="شريحة لحم طازجة، جبنة شيدر، صوص خاص..."
                  className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-text-main mb-1">
                    السعر ({data.currency})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={itemFormData.price}
                    onChange={(e) =>
                      setItemFormData({
                        ...itemFormData,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-main mb-1">
                    السعرات الحرارية
                  </label>
                  <input
                    type="number"
                    value={itemFormData.calories}
                    onChange={(e) =>
                      setItemFormData({
                        ...itemFormData,
                        calories: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main mb-1">
                  رابط صورة الصنف (URL)
                </label>
                <input
                  type="url"
                  required
                  value={itemFormData.image}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, image: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none dir-ltr text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main mb-1">
                  شارة مميزة (Badge اختياري)
                </label>
                <input
                  type="text"
                  value={itemFormData.badge}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, badge: e.target.value })
                  }
                  placeholder="مثال: الأكثر طلباً 🔥 أو جديد ⚡"
                  className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-btn bg-bg-page text-text-muted hover:text-text-main text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-xs"
                >
                  حفظ الصنف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة منبثقة: الخصم السريع */}
      {discountModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-sm bg-surface rounded-card p-5 shadow-2xl border border-border-subtle">
            <h3 className="text-sm font-black text-text-main mb-1 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-primary" />
              <span>إضافة خصم على ({discountModalItem.name})</span>
            </h3>
            <p className="text-xs text-text-muted mb-4">
              السعر الحالي: {discountModalItem.price} {data.currency}
            </p>

            <form onSubmit={handleSaveDiscount} className="space-y-3.5">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="discountActive"
                  checked={discountFormData.active}
                  onChange={(e) =>
                    setDiscountFormData({
                      ...discountFormData,
                      active: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-primary"
                />
                <label
                  htmlFor="discountActive"
                  className="text-xs font-bold text-text-main cursor-pointer"
                >
                  تفعيل الخصم على هذا الصنف
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label
                  onClick={() =>
                    setDiscountFormData({ ...discountFormData, type: "percentage" })
                  }
                  className={`p-2.5 rounded-btn border text-center text-xs font-bold cursor-pointer ${
                    discountFormData.type === "percentage"
                      ? "border-primary bg-primary-light text-primary"
                      : "border-border-subtle text-text-muted"
                  }`}
                >
                  نسبة مئوية (%)
                </label>

                <label
                  onClick={() =>
                    setDiscountFormData({ ...discountFormData, type: "fixed" })
                  }
                  className={`p-2.5 rounded-btn border text-center text-xs font-bold cursor-pointer ${
                    discountFormData.type === "fixed"
                      ? "border-primary bg-primary-light text-primary"
                      : "border-border-subtle text-text-muted"
                  }`}
                >
                  مبلغ ثابت ({data.currency})
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-muted mb-1">
                  قيمة الخصم
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={discountFormData.value}
                  onChange={(e) =>
                    setDiscountFormData({
                      ...discountFormData,
                      value: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none"
                />
              </div>

              {/* معاينة السعر بعد الخصم */}
              <div className="p-3 rounded-card bg-bg-page border border-border-subtle text-xs flex justify-between">
                <span className="text-text-muted">السعر بعد الخصم:</span>
                <span className="font-black text-primary">
                  {discountFormData.active
                    ? discountFormData.type === "percentage"
                      ? Math.max(
                          0,
                          Math.round(
                            discountModalItem.price *
                              (1 - discountFormData.value / 100) *
                              100
                          ) / 100
                        )
                      : Math.max(0, discountModalItem.price - discountFormData.value)
                    : discountModalItem.price}{" "}
                  {data.currency}
                </span>
              </div>

              <div className="pt-2 border-t border-border-subtle flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountModalItem(null)}
                  className="min-h-[40px] px-3.5 py-1.5 rounded-btn text-xs font-bold text-text-muted hover:text-text-main"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-4 py-1.5 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-bold"
                >
                  حفظ الخصم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة منبثقة: إضافة مندوب جديد */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md bg-surface rounded-card p-5 sm:p-6 shadow-2xl border border-border-subtle max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-black text-text-main mb-4 flex items-center gap-2">
              <Bike className="w-5 h-5 text-primary" />
              <span>إضافة مندوب توصيل جديد</span>
            </h3>

            <form onSubmit={handleSaveDriver} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-main mb-1">
                  اسم المندوب
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد علي"
                  value={driverFormData.name}
                  onChange={(e) =>
                    setDriverFormData({ ...driverFormData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main mb-1">
                  رقم هاتف المندوب
                </label>
                <input
                  type="tel"
                  required
                  placeholder="مثال: 07701234567"
                  value={driverFormData.phone}
                  onChange={(e) =>
                    setDriverFormData({ ...driverFormData, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none focus:border-primary font-mono dir-ltr text-end"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  يستخدمه المندوب لتسجيل الدخول في واجهة المندوب الخاصة به.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-main mb-1">
                  رمز الدخول السري (PIN)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="1234"
                  value={driverFormData.pin}
                  onChange={(e) =>
                    setDriverFormData({ ...driverFormData, pin: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none focus:border-primary font-mono text-center tracking-widest text-base font-bold"
                />
                <p className="text-[11px] text-text-muted mt-1">
                  رمز بسيط من 4 أرقام لتأمين دخول المندوب ومنع التلاعب.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="flex-1 min-h-[42px] px-4 rounded-btn bg-bg-page text-text-muted hover:text-text-main text-xs font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 min-h-[42px] px-4 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  حفظ وإضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة منبثقة: تعيين مندوب للطلب */}
      {assigningOrder && (() => {
        const activeDrivers = drivers.filter((d) => d.isActive);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-md bg-surface rounded-card p-5 sm:p-6 shadow-2xl border border-border-subtle max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
              {/* الرأس */}
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-text-main">
                      {assigningOrder.assignedDriverId ? "تغيير مندوب الطلب" : "تعيين مندوب للطلب"} #{assigningOrder.orderNumber}
                    </h3>
                    <p className="text-[11px] text-text-muted">
                      الزبون: {assigningOrder.customerName} ({formatPrice(assigningOrder.totalAmount, data.currency, data.currencyPosition)})
                      {assigningOrder.assignedDriverName && (
                        <span className="block text-amber-700 font-bold mt-0.5">
                          المندوب الحالي: {assigningOrder.assignedDriverName}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAssigningOrder(null)}
                  className="p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-bg-page transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* الحالة 1: يوجد مندوب واحد فقط نشط مسجل بالنظام */}
              {activeDrivers.length === 1 && (
                <div className="py-4 space-y-4 text-center">
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-text-main text-xs sm:text-sm leading-relaxed">
                    {assigningOrder.assignedDriverId === activeDrivers[0].id ? (
                      <>
                        الطلب معين حالياً للمندوب <strong className="text-primary font-black text-sm sm:text-base">[{activeDrivers[0].name}]</strong> وهو المندوب الوحيد النشط في النظام.
                      </>
                    ) : (
                      <>
                        هل تود تعيين المندوب <strong className="text-primary font-black text-sm sm:text-base">[{activeDrivers[0].name}]</strong> لتوصيل هذا الطلب؟
                      </>
                    )}
                  </div>

                  <div className="p-3 bg-bg-page rounded-xl border border-border-subtle text-xs text-text-muted flex items-center justify-around font-mono">
                    <span className="dir-ltr">{activeDrivers[0].phone}</span>
                    <span>رمز: {activeDrivers[0].pin || "1234"}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setAssigningOrder(null)}
                      className="flex-1 min-h-[42px] px-4 rounded-btn bg-bg-page text-text-muted hover:text-text-main text-xs font-bold transition-colors"
                    >
                      إلغاء
                    </button>
                    {assigningOrder.assignedDriverId !== activeDrivers[0].id && (
                      <button
                        type="button"
                        disabled={isAssigningLoading}
                        onClick={() => handleConfirmAssignDriver(assigningOrder.id, activeDrivers[0])}
                        className="flex-1 min-h-[42px] px-4 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isAssigningLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>نعم، تعيين</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* الحالة 2: يوجد أكثر من مندوب نشط مسجل بالنظام */}
              {activeDrivers.length > 1 && (
                <div className="py-3 space-y-3">
                  <p className="text-xs text-text-muted">
                    اختر المندوب المطلوب من القائمة لتحديث تعيين الطلب له فوراً:
                  </p>

                  <div className="space-y-2 max-h-64 overflow-y-auto divide-y divide-border-subtle">
                    {activeDrivers.map((d) => {
                      const isCurrent = assigningOrder.assignedDriverId === d.id;
                      const activeCount = orders.filter(
                        (o) => o.assignedDriverId === d.id && o.status === "out_for_delivery"
                      ).length;

                      return (
                        <div
                          key={d.id}
                          className={`pt-2.5 pb-1 flex items-center justify-between gap-3 p-2 rounded-xl transition-colors ${
                            isCurrent ? "bg-amber-500/10 border border-amber-500/20" : "hover:bg-bg-page/50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                              <Bike className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-xs sm:text-sm text-text-main">
                                  {d.name}
                                </h4>
                                {isCurrent && (
                                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                                    المعين حالياً
                                  </span>
                                )}
                                {activeCount > 0 && !isCurrent && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    {activeCount} طلب جاري
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-text-muted font-mono dir-ltr block text-start">
                                {d.phone}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isAssigningLoading || isCurrent}
                            onClick={() => handleConfirmAssignDriver(assigningOrder.id, d)}
                            className={`min-h-[36px] px-3.5 py-1.5 rounded-btn text-xs font-bold shadow-xs transition-colors shrink-0 ${
                              isCurrent
                                ? "bg-border-subtle text-text-muted cursor-not-allowed"
                                : "bg-primary hover:bg-primary-hover text-white cursor-pointer disabled:opacity-50"
                            }`}
                          >
                            {isCurrent ? "المعين حالياً" : assigningOrder.assignedDriverId ? "تغيير إليه" : "تعيين"}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-border-subtle flex justify-end">
                    <button
                      type="button"
                      onClick={() => setAssigningOrder(null)}
                      className="min-h-[38px] px-4 rounded-btn bg-bg-page text-text-muted hover:text-text-main text-xs font-bold transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}

              {/* الحالة 3: لا يوجد مناديب نشطين */}
              {activeDrivers.length === 0 && (
                <div className="py-6 text-center space-y-3">
                  <p className="text-xs text-text-muted">
                    لا يوجد أي مناديب نشطين حالياً. يرجى تفعيل أو إضافة مندوب جديد من قسم المناديب.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAssigningOrder(null);
                      setActiveTab("drivers");
                    }}
                    className="min-h-[38px] px-4 rounded-btn bg-primary text-white text-xs font-bold"
                  >
                    الانتقال لقسم المناديب
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* نافذة تأكيد تصفير ومسح جميع الطلبات */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-card max-w-md w-full p-6 border border-border-subtle shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base sm:text-lg font-black text-text-main">
                هل أنت متأكد من تصفير جميع الطلبات؟
              </h3>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                سيتم حذف جميع سجلات الطلبات السابقة ({orders.length} طلب) نهائياً من قاعدة البيانات والتخزين الداخلي لتخفيف الحمل على السيرفر. لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                disabled={isClearingOrders}
                className="flex-1 min-h-[44px] px-4 rounded-btn border border-border-subtle bg-bg-page hover:bg-border-subtle text-text-main text-xs sm:text-sm font-bold transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={handleClearOrders}
                disabled={isClearingOrders}
                className="flex-1 min-h-[44px] px-4 rounded-btn bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-50"
              >
                {isClearingOrders ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جارِ التصفير...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>تأكيد التصفير</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <RestaurantDataProvider>
      <AdminDashboardContent />
    </RestaurantDataProvider>
  );
}
