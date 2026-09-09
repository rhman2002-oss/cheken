import React from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { MenuSection } from "@/components/MenuSection";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { FloatingCartBar } from "@/components/FloatingCartBar";
import { CartModal } from "@/components/CartModal";
import { CustomerAuthModal } from "@/components/CustomerAuthModal";
import { AddressEditModal } from "@/components/AddressEditModal";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { Providers } from "@/components/Providers";

export default function MenuPage() {
  return (
    <Providers>
      <PWAInstallPrompt />
      <main className="min-h-screen flex flex-col justify-between bg-bg-page text-text-main relative">
        {/* رأس الصفحة الثابت */}
        <Header />

        {/* قسم الغلاف والهوية الترحيبية */}
        <Hero />

        {/* قائمة الطعام التفاعلية مع البحث والأقسام والخصومات */}
        <MenuSection />

        {/* تذييل الصفحة وساعات الدوام والتواصل */}
        <Footer />

        {/* زر الواتساب العائم للتواصل السريع */}
        <FloatingWhatsApp />

        {/* شريط السلة العائم للطلبات */}
        <FloatingCartBar />

        {/* نافذة السلة والطلب بواتساب */}
        <CartModal />

        {/* نافذة تسجيل الدخول البسيط ورقم الهاتف للتوصيل */}
        <CustomerAuthModal />

        {/* نافذة تعديل موقع وعنوان التوصيل */}
        <AddressEditModal />
      </main>
    </Providers>
  );
}
