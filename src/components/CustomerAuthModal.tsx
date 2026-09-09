"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X, MapPin, Phone, User, CheckCircle, ArrowLeft, Loader2, ArrowRight } from "lucide-react";
import { useCustomer } from "@/context/CustomerContext";
import { useRestaurant } from "@/context/RestaurantDataContext";
import { CustomerLocation } from "@/config/restaurant";

const InteractiveMapPicker = dynamic(
  () => import("./InteractiveMapPicker").then((mod) => mod.InteractiveMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 flex flex-col items-center justify-center bg-bg-page text-text-muted text-xs font-bold gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span>جاري تشغيل الخارطة...</span>
      </div>
    ),
  }
);

export const CustomerAuthModal: React.FC = () => {
  const { customer, isLoginModalOpen, openLoginModal, closeLoginModal, login, checkExistingCustomer } = useCustomer();
  const { data } = useRestaurant();
  const { menuMode } = data;

  const [step, setStep] = useState<"phone" | "map">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [existingLocation, setExistingLocation] = useState<CustomerLocation | null>(null);
  const [existingAddress, setExistingAddress] = useState<string>("");
  const [isSearchingExisting, setIsSearchingExisting] = useState(false);
  const [existingFoundMessage, setExistingFoundMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // فتح تسجيل الدخول الخفيف تلقائياً عند أول زيارة لصفحة المنيو في نمط التوصيل
  useEffect(() => {
    if (menuMode !== "cart_orders") return;
    const hasPrompted = sessionStorage.getItem("customer_login_prompted");
    if (!hasPrompted && !customer) {
      const timer = setTimeout(() => {
        openLoginModal();
        sessionStorage.setItem("customer_login_prompted", "true");
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [menuMode, customer, openLoginModal]);

  // فحص الهاتف تلقائياً عند كتابة 8 أرقام أو أكثر لسحب موقع الزبون السابق
  useEffect(() => {
    const clean = phone.replace(/[^0-9]/g, "");
    if (clean.length >= 8) {
      let active = true;
      setIsSearchingExisting(true);
      checkExistingCustomer(clean).then((found) => {
        if (!active) return;
        setIsSearchingExisting(false);
        if (found) {
          if (!name && found.name) setName(found.name);
          if (found.location) setExistingLocation(found.location);
          if (found.address) setExistingAddress(found.address);
          setExistingFoundMessage("✓ مرحباً بك مجدداً! تم استرجاع موقعك المحفوظ تلقائياً.");
        } else {
          setExistingFoundMessage(null);
          setExistingLocation(null);
          setExistingAddress("");
        }
      });
      return () => {
        active = false;
      };
    } else {
      setExistingFoundMessage(null);
      setIsSearchingExisting(false);
      setExistingLocation(null);
      setExistingAddress("");
    }
  }, [phone, checkExistingCustomer]);

  // إعادة ضبط الخطوة عند فتح أو إغلاق المودال
  useEffect(() => {
    if (isLoginModalOpen) {
      setStep("phone");
      setErrorMsg("");
    }
  }, [isLoginModalOpen]);

  if (menuMode !== "cart_orders" || !isLoginModalOpen) {
    return null;
  }

  // الانتقال لخطوة الخريطة
  const handleProceedToMap = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, "").length < 6) {
      setErrorMsg("يرجى إدخال رقم هاتف صحيح للتواصل");
      return;
    }

    setStep("map");
  };

  // تأكيد سريع بنفس الموقع السابق دون فتح الخريطة إن رغب العميل
  const handleConfirmExisting = async () => {
    const cleanPhone = phone.trim();
    setIsSubmitting(true);
    try {
      await login(cleanPhone, existingAddress, name.trim() || undefined, existingLocation || undefined);
    } catch {
      setErrorMsg("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setIsSubmitting(false);
    }
  };

  // عند تأكيد الموقع من الخريطة
  const handleMapConfirm = async (location: CustomerLocation, addressText?: string) => {
    const cleanPhone = phone.trim();
    setIsSubmitting(true);
    try {
      await login(cleanPhone, addressText, name.trim() || undefined, location);
    } catch {
      setErrorMsg("حدث خطأ أثناء حفظ بيانات الموقع");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface rounded-card shadow-2xl border border-border-subtle overflow-y-auto max-h-[92vh] animate-in zoom-in-95 duration-200">
        {step === "phone" ? (
          <div className="p-5 sm:p-6">
            {/* زر الإغلاق */}
            <button
              type="button"
              onClick={closeLoginModal}
              className="absolute top-4 start-4 p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-bg-page transition-colors"
              title="إغلاق وتصفح المنيو"
            >
              <X className="w-5 h-5" />
            </button>

            {/* رأس النافذة */}
            <div className="text-center pt-2 pb-4">
              <div className="w-12 h-12 rounded-full bg-primary-light text-primary mx-auto flex items-center justify-center mb-3">
                <MapPin className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-text-main">
                تحديد موقع التوصيل ورقم الهاتف
              </h3>
              <p className="text-xs text-text-muted mt-1 max-w-xs mx-auto">
                أدخل رقم هاتفك لتحديد موقعك الجغرافي بدقة على الخارطة وربطه بطلباتك.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-btn bg-red-50 border border-red-200 text-red-700 text-xs font-bold text-center">
                {errorMsg}
              </div>
            )}

            {existingFoundMessage && (
              <div className="mb-3.5 p-3 rounded-card bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{existingFoundMessage}</span>
                </div>
                {existingAddress && (
                  <p className="text-[11px] text-emerald-700 ps-5">
                    الموقع: {existingAddress}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1 ps-5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleConfirmExisting}
                    className="min-h-[34px] px-3.5 rounded-btn bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    متابعة بنفس الموقع ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep("map")}
                    className="text-xs font-semibold text-emerald-800 hover:underline"
                  >
                    تعديل الموقع على الخارطة 🗺️
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleProceedToMap} className="space-y-3.5">
              {/* رقم الهاتف */}
              <div>
                <label className="block text-xs font-bold text-text-main mb-1">
                  رقم الهاتف <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07XXXXXXXXX"
                    className="w-full ps-3 pe-9 py-2.5 rounded-input bg-bg-page border border-border-subtle text-xs sm:text-sm text-text-main outline-none focus:border-primary transition-all dir-ltr text-right"
                  />
                  <div className="absolute end-3 top-1/2 -translate-y-1/2 text-text-muted">
                    {isSearchingExisting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* الاسم الكريم */}
              <div>
                <label className="block text-xs font-bold text-text-main mb-1">
                  الاسم الكريم <span className="text-text-muted font-normal text-[11px]">(اختياري)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: علي محمد"
                    className="w-full ps-3 pe-9 py-2.5 rounded-input bg-bg-page border border-border-subtle text-xs text-text-main outline-none focus:border-primary transition-all"
                  />
                  <User className="w-4 h-4 text-text-muted absolute end-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* زر الانتقال لتحديد الموقع بالخريطة */}
              <button
                type="submit"
                className="w-full min-h-[46px] mt-3 py-2.5 px-4 rounded-btn bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>تحديد موقعي على الخارطة عبر GPS</span>
                <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
              </button>

              <button
                type="button"
                onClick={closeLoginModal}
                className="w-full py-2 text-center text-xs text-text-muted hover:text-text-main transition-colors font-semibold"
              >
                تصفح المنيو أولاً
              </button>
            </form>
          </div>
        ) : (
          /* الخطوة 2: الخارطة التفاعلية */
          <div>
            <div className="p-3 bg-bg-page/80 border-b border-border-subtle flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                <span>العودة لرقم الهاتف</span>
              </button>

              <span className="text-xs text-text-muted font-bold">
                خطوة 2 من 2: حدد موقعك
              </span>
            </div>

            <InteractiveMapPicker
              initialLocation={existingLocation}
              title="حدد موقع بيتك أو عملك بدقة"
              onCancel={closeLoginModal}
              onConfirm={handleMapConfirm}
            />
          </div>
        )}
      </div>
    </div>
  );
};
