"use client";

import React, { useState, useEffect } from "react";
import {
  RestaurantDataProvider,
  useRestaurant,
} from "@/context/RestaurantDataContext";
import { SiteMode } from "@/config/restaurant";
import { verifySuperPassword } from "./actions";
import {
  Lock,
  Key,
  ShieldAlert,
  Eye,
  Truck,
  Layers,
  CheckCircle2,
  ExternalLink,
  LogOut,
  RefreshCw,
  Sparkles,
  Check,
} from "lucide-react";

const SUPER_AUTH_SESSION_KEY = "super_config_authed_x7k2";

function SuperControlContent() {
  const { data, updateSiteMode, isLoading } = useRestaurant();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // استرجاع جلسة الدخول في نفس التبويب
  useEffect(() => {
    try {
      const savedAuth = sessionStorage.getItem(SUPER_AUTH_SESSION_KEY);
      if (savedAuth === "true") {
        setIsAuthenticated(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    setIsVerifying(true);
    setPasswordError(null);

    try {
      const isValid = await verifySuperPassword(passwordInput);
      if (isValid) {
        setIsAuthenticated(true);
        sessionStorage.setItem(SUPER_AUTH_SESSION_KEY, "true");
        setPasswordInput("");
      } else {
        setPasswordError("كلمة السر غير صحيحة، يرجى التحقق وإعادة المحاولة.");
      }
    } catch {
      setPasswordError("حدث خطأ أثناء فحص كلمة السر، حاول ثانية.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SUPER_AUTH_SESSION_KEY);
    setIsAuthenticated(false);
    setPasswordInput("");
  };

  const handleSelectSiteMode = async (mode: SiteMode) => {
    if (data.siteMode === mode || isUpdating) return;
    setIsUpdating(true);
    try {
      await updateSiteMode(mode);
      const label =
        mode === "display"
          ? "عرض فقط (Display Only)"
          : mode === "delivery"
          ? "توصيل فقط (Delivery Only)"
          : "كلاهما (Both - صفحتين منفصلتين)";
      showToast(`تم تطبيق وحفظ نمط الموقع: [${label}] بنجاح ✓`);
    } catch {
      showToast("حدث خطأ أثناء حفظ الإعداد، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsUpdating(false);
    }
  };

  // شاشة تسجيل الدخول المحمية بكلمة السر
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans dir-rtl">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-white">
              بوابة التحكم المركزية الفائقة
            </h1>
            <p className="text-xs text-slate-400">
              صفحة محجوبة ومحمية مخصصة لإعدادات النظام المركزية.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>أدخل كلمة السر الخاصة بالإعدادات:</span>
              </label>
              <input
                type="password"
                required
                autoFocus
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(null);
                }}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors font-mono tracking-wider"
              />
            </div>

            {passwordError && (
              <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>{passwordError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Key className="w-4 h-4" />
              )}
              <span>دخول للوحة التحكم الفائقة</span>
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-slate-500 font-mono">
            System Control • Protected Access
          </div>
        </div>
      </div>
    );
  }

  const currentMode = data.siteMode || "delivery";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans dir-rtl">
      {/* التنبيه العائم */}
      {toastMessage && (
        <div className="fixed top-5 start-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* الشريط العلوي */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>لوحة التحكم الفائقة</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-amber-500/30">
                  Super Config
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                إعدادات نمط الموقع الشامل (siteMode)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>معاينة الموقع</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-red-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="قفل وتسجيل الخروج"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>قفل</span>
            </button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* صندوق تعريفي بالإعداد */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <span>إعداد نمط الموقع الرئيسي (siteMode)</span>
            </h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-bold">
              الوضع الفعّال حالياً:{" "}
              {currentMode === "display"
                ? "عرض فقط"
                : currentMode === "delivery"
                ? "توصيل فقط"
                : "كلاهما (صفحتين)"}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            اختر أحد الأوضاع الثلاثة أدناه. يتم تطبيق التغيير فوراً وحفظه في قاعدة البيانات والموقع بدون أي حاجة لإعادة نشر الموقع (No Redeploy needed).
          </p>
        </div>

        {/* شبكة الخيارات الثلاثة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* الخيار الأول: عرض فقط */}
          <div
            onClick={() => handleSelectSiteMode("display")}
            className={`relative rounded-2xl p-5 sm:p-6 border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
              currentMode === "display"
                ? "bg-slate-900/90 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/20"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70"
            }`}
          >
            {currentMode === "display" && (
              <span className="absolute -top-3 start-4 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                <Check className="w-3 h-3" />
                <span>الوضع النشط حالياً</span>
              </span>
            )}

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Eye className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-black text-white">
                  1. عرض فقط (Display Only)
                </h3>
                <span className="inline-block text-[11px] font-semibold text-blue-400 mt-0.5">
                  منيو رقمي للعرض داخل المطعم
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                يُطبَّق هذا الوضع على كامل الموقع الرئيسي، حيث يظهر المنيو لاستعراض الأسعار والوجبات فقط بدون أي سلة أو أزرار طلب.
              </p>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>تعطيل السلة وأزرار الطلب بالكامل.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>إخفاء إعدادات checkoutMethod من لوحة الإدارة.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>مناسب للمطاعم التي لا توفر خدمة التوصيل.</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={currentMode === "display" || isUpdating}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                currentMode === "display"
                  ? "bg-amber-500 text-slate-950 cursor-default font-black"
                  : "bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
              }`}
            >
              {currentMode === "display" ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>الوضع مفعّل</span>
                </>
              ) : (
                <span>تفعيل وضع العرض فقط</span>
              )}
            </button>
          </div>

          {/* الخيار الثاني: توصيل */}
          <div
            onClick={() => handleSelectSiteMode("delivery")}
            className={`relative rounded-2xl p-5 sm:p-6 border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
              currentMode === "delivery"
                ? "bg-slate-900/90 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/20"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70"
            }`}
          >
            {currentMode === "delivery" && (
              <span className="absolute -top-3 start-4 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                <Check className="w-3 h-3" />
                <span>الوضع النشط حالياً</span>
              </span>
            )}

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Truck className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-black text-white">
                  2. توصيل (Delivery Only)
                </h3>
                <span className="inline-block text-[11px] font-semibold text-emerald-400 mt-0.5">
                  متجر وسلة وطلبات كاملة
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                يُفعَّل نظام التوصيل والسلة في كامل الموقع الرئيسي مع إمكانية تحكم المدير بطريقة الطلب (الموقع / واتساب / كلاهما).
              </p>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>تفعيل السلة ونظام إضافة الوجبات.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>ظهور خيارات checkoutMethod في لوحة الإدارة.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>توجيه كافة الباركودات العامة لصفحة الطلب.</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={currentMode === "delivery" || isUpdating}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                currentMode === "delivery"
                  ? "bg-amber-500 text-slate-950 cursor-default font-black"
                  : "bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
              }`}
            >
              {currentMode === "delivery" ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>الوضع مفعّل</span>
                </>
              ) : (
                <span>تفعيل وضع التوصيل</span>
              )}
            </button>
          </div>

          {/* الخيار الثالث: كلاهما (Both) */}
          <div
            onClick={() => handleSelectSiteMode("both")}
            className={`relative rounded-2xl p-5 sm:p-6 border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
              currentMode === "both"
                ? "bg-slate-900/90 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/20"
                : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/70"
            }`}
          >
            {currentMode === "both" && (
              <span className="absolute -top-3 start-4 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                <Check className="w-3 h-3" />
                <span>الوضع النشط حالياً</span>
              </span>
            )}

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Layers className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-black text-white">
                  3. كلاهما (Both - صفحتين)
                </h3>
                <span className="inline-block text-[11px] font-semibold text-purple-400 mt-0.5">
                  نظام الصفحتين المتطابقتين
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                صفحة مخصصة للطاولات داخل الصالة للعرض فقط (/menu/display) + صفحة التوصيل العامة مع السلة والطلب (/menu).
              </p>

              <div className="pt-2 border-t border-slate-800/80 space-y-1.5 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>مسار /menu/display للطاولات داخل المطعم.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>مسار /menu لطلبات التوصيل للجمهور.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>ظهور باركود ثالث مخصص للطاولات في لوحة الإدارة.</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={currentMode === "both" || isUpdating}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                currentMode === "both"
                  ? "bg-amber-500 text-slate-950 cursor-default font-black"
                  : "bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
              }`}
            >
              {currentMode === "both" ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>الوضع مفعّل</span>
                </>
              ) : (
                <span>تفعيل وضع كلاهما</span>
              )}
            </button>
          </div>
        </div>

        {/* بطاقة معلومات تقنية توضيحية */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-2">
          <h4 className="font-bold text-slate-200 flex items-center gap-2">
            <span>ملاحظات تشغيلية هامة:</span>
          </h4>
          <ul className="list-disc list-inside space-y-1 leading-relaxed text-slate-400">
            <li>
              عند اختيار <b>&quot;عرض فقط&quot;</b>، يتم ضبط `orderMode = &quot;display&quot;` وتختفي لوحة اختيار `checkoutMethod` من لوحة تحكم صاحب المطعم العادية تلقائياً.
            </li>
            <li>
              عند اختيار <b>&quot;توصيل&quot;</b>، يتم ضبط `orderMode = &quot;delivery&quot;` وتتاح خيارات إتمام الطلب كالمعتاد في لوحة تحكم صاحب المطعم.
            </li>
            <li>
              عند اختيار <b>&quot;كلاهما&quot;</b>، يظهر باركود ثالث في قسم الباركودات في لوحة تحكم صاحب المطعم يوجه الزبون داخل الصالة إلى صفحة العرض الخاصة بالطاولات (`/menu/display`).
            </li>
            <li>
              كافة التغييرات يتم تطبيقها فورياً ومزامنتها محلياً وفي قاعدة البيانات.
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default function SuperControlPage() {
  return (
    <RestaurantDataProvider>
      <SuperControlContent />
    </RestaurantDataProvider>
  );
}
