"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Download, X, Share, PlusSquare, Monitor, Smartphone } from "lucide-react";

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // معالجة حدث التثبيت لجميع متصفحات Chromium (ويندوز Chrome/Edge وأندرويد)
  const handlePromptReady = useCallback((e: any) => {
    console.log("🎉 [PWA] beforeinstallprompt event intercepted successfully!", e);
    setDeferredPrompt(e);

    // فحص ما إذا كان التطبيق مثبتاً أو أغلقه المستخدم
    const dismissed = typeof window !== "undefined" ? localStorage.getItem("jkn_pwa_dismissed") : null;
    if (dismissed === "installed") {
      console.log("ℹ️ [PWA] App is already marked as installed in localStorage.");
      return;
    }

    if (dismissed === "true") {
      console.log("ℹ️ [PWA] beforeinstallprompt is ready, but banner was previously dismissed. Type window.__pwa_open_banner() in console to view it.");
      return;
    }

    setShowInstallPrompt(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    console.log("🚀 [PWA] Initializing Chicken Express PWA module...");

    // 1) ضمان وجود وسم manifest في head برمجياً
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/manifest.json";
      document.head.appendChild(link);
      console.log("🔗 [PWA] Injected manifest link into head dynamically");
    }

    // 2) تسجيل Service Worker للوفاء بمتطلبات PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("✅ [PWA] Service Worker registered successfully! Scope:", reg.scope);
        })
        .catch((err) => {
          console.error("❌ [PWA] Service Worker registration failed:", err);
        });
    } else {
      console.warn("⚠️ [PWA] Service Worker is not supported in this browser environment.");
    }

    // 3) التحقق مما إذا كان التطبيق يعمل بالفعل بوضع Standalone
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      console.log("ℹ️ [PWA] App is running in standalone mode (installed).");
      return;
    }

    // تحديد نوع الجهاز (كمبيوتر أم هاتف) لتكييف العرض
    const ua = window.navigator.userAgent.toLowerCase();
    const isMobile = /android|iphone|ipad|ipod|mobile/.test(ua);
    setIsDesktop(!isMobile);

    // 4) فحص نظام iOS Safari
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isSafari =
      /safari/.test(ua) &&
      !/chrome|crios|crmo|firefox|fxios|edg|opr|opera/.test(ua);

    const dismissed = localStorage.getItem("jkn_pwa_dismissed");

    if (isIOS && isSafari) {
      if (dismissed !== "true" && dismissed !== "installed") {
        console.log("🍎 [PWA] iOS Safari detected - preparing manual installation guidance banner.");
        const timer = setTimeout(() => {
          setShowIOSPrompt(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
      return;
    }

    // 5) الاستماع لحدث beforeinstallprompt (شغال على ويندوز وأندرويد عبر Chromium)
    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      (window as any).__pwa_deferred_prompt = e;
      handlePromptReady(e);
    };

    // الاستماع لحدث مخصص من سكربت الهيد في حال وصل الحدث قبل تحميل ريأكت
    const onPromptReadyCustom = (e: any) => {
      handlePromptReady(e.detail || (window as any).__pwa_deferred_prompt);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("pwa_prompt_ready", onPromptReadyCustom);

    // فحص ما إذا كان الحدث قد التُقط مسبقاً بواسطة الـ head script
    if ((window as any).__pwa_deferred_prompt) {
      console.log("⚡ [PWA] Found early captured beforeinstallprompt from head script!");
      handlePromptReady((window as any).__pwa_deferred_prompt);
    }

    // توفير دوال مساعدة في نافذة المتصفح لتسهيل الفحص والتجربة
    (window as any).__pwa_open_banner = () => {
      localStorage.removeItem("jkn_pwa_dismissed");
      setShowInstallPrompt(true);
      console.log("✅ [PWA] Install prompt opened manually.");
    };

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("pwa_prompt_ready", onPromptReadyCustom);
    };
  }, [handlePromptReady]);

  // عند ضغط زر التثبيت
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.warn("⚠️ [PWA] No deferredPrompt available to trigger native prompt.");
      return;
    }

    try {
      console.log("🚀 [PWA] Calling deferredPrompt.prompt()...");
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      console.log("👉 [PWA] User choice outcome:", choiceResult?.outcome);

      if (choiceResult?.outcome === "accepted") {
        localStorage.setItem("jkn_pwa_dismissed", "installed");
      } else {
        localStorage.setItem("jkn_pwa_dismissed", "dismissed_once");
      }
    } catch (err) {
      console.error("❌ [PWA] Error during prompt execution:", err);
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // إغلاق البانر
  const handleDismiss = () => {
    localStorage.setItem("jkn_pwa_dismissed", "true");
    setShowInstallPrompt(false);
    setShowIOSPrompt(false);
    console.log("ℹ️ [PWA] Banner dismissed by user (saved to localStorage).");
  };

  if (!showInstallPrompt && !showIOSPrompt) {
    return null;
  }

  return (
    <>
      {/* 1. بانر التثبيت الفعلي لمتصفحات كروم/إيدج على ويندوز وأندرويد */}
      {showInstallPrompt && (
        <aside
          aria-label="تثبيت تطبيق جكن اكسبريس"
          className="fixed bottom-20 sm:bottom-6 start-3 end-3 sm:start-auto sm:end-6 sm:w-96 sm:max-w-md z-50 bg-surface text-text-main p-4 rounded-2xl shadow-2xl border border-border-subtle animate-in fade-in slide-in-from-bottom-5 duration-300 ring-1 ring-black/5"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md bg-white border border-border-subtle shrink-0">
              <Image
                src="/icon-192.png"
                alt="شعار جكن اكسبريس"
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-black text-xs sm:text-sm text-text-main truncate">
                  تطبيق جكن اكسبريس
                </h4>
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary shrink-0">
                  {isDesktop ? (
                    <>
                      <Monitor className="w-2.5 h-2.5 inline" />
                      <span>كمبيوتر</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-2.5 h-2.5 inline" />
                      <span>تطبيق</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-text-muted mt-0.5 leading-tight">
                ثبّت التطبيق لوصول سريع وتجربة تصفح وطلب سلسة
              </p>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="إغلاق"
              className="p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-bg-page transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-border-subtle">
            <button
              type="button"
              onClick={handleDismiss}
              className="min-h-[36px] px-3 rounded-btn text-xs font-bold text-text-muted hover:text-text-main transition-colors"
            >
              لاحقاً
            </button>

            <button
              type="button"
              onClick={handleInstallClick}
              className="flex-1 min-h-[38px] px-4 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>تثبيت التطبيق الآن</span>
            </button>
          </div>
        </aside>
      )}

      {/* 2. بانر أجهزة iOS (Safari) - إرشادات واضحة بالعربي */}
      {showIOSPrompt && (
        <aside
          aria-label="إضافة تطبيق جكن اكسبريس للشاشة الرئيسية"
          className="fixed bottom-20 sm:bottom-6 start-3 end-3 sm:start-auto sm:end-6 sm:max-w-sm z-50 bg-surface text-text-main p-4 rounded-2xl shadow-2xl border border-border-subtle animate-in fade-in slide-in-from-bottom-5 duration-300 ring-1 ring-black/5"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-md bg-white border border-border-subtle shrink-0">
                <Image
                  src="/icon-192.png"
                  alt="شعار جكن اكسبريس"
                  fill
                  className="object-cover"
                  sizes="44px"
                />
              </div>
              <div>
                <h4 className="font-black text-xs sm:text-sm text-text-main">
                  تطبيق جكن اكسبريس
                </h4>
                <span className="text-[10px] font-bold text-primary">
                  إضافة للشاشة الرئيسية
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="إغلاق"
              className="p-1 rounded-full text-text-muted hover:text-text-main hover:bg-bg-page transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 text-[11px] text-text-muted space-y-1.5 bg-bg-page p-2.5 rounded-xl border border-border-subtle leading-relaxed">
            <div className="flex items-center gap-1.5 text-text-main font-semibold">
              <Share className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>1. اضغط على زر المشاركة أسفل الشاشة</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-main font-semibold">
              <PlusSquare className="w-3.5 h-3.5 text-primary shrink-0" />
              <span>2. اختر &quot;إضافة إلى الصفحة الرئيسية&quot;</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-main font-semibold">
              <span className="text-primary font-black">✓</span>
              <span>3. اضغط على &quot;إضافة&quot; لتأكيد التثبيت</span>
            </div>
          </div>

          <div className="mt-2.5 flex justify-end">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-text-muted hover:text-primary font-bold py-1 px-2"
            >
              حسناً، فهمت
            </button>
          </div>
        </aside>
      )}
    </>
  );
};