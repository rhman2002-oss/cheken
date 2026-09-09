import React from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MenuSection } from "@/components/MenuSection";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { Providers } from "@/components/Providers";

export default function InStoreMenuDisplayPage() {
  return (
    <Providers forceOrderMode="display">
      <PWAInstallPrompt />
      <main className="min-h-screen flex flex-col justify-between bg-bg-page text-text-main relative">
        {/* رأس الصفحة الثابت (يعرض اللوجو وبيانات المطعم دون أزرار سلة أو عنوان توصيل) */}
        <Header />

        {/* قسم الغلاف والهوية الترحيبية للمطعم */}
        <Hero />

        {/* قائمة الطعام الرقمية: استعراض الأصناف والأسعار بدون أزرار طلب أو سلة */}
        <MenuSection />

        {/* تذييل الصفحة وساعات العمل ومعلومات التواصل */}
        <Footer />

        {/* زر الواتساب العائم للتواصل المباشر مع الإدارة */}
        <FloatingWhatsApp />
      </main>
    </Providers>
  );
}
