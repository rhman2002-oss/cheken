import React from "react";
import type { Metadata } from "next";
import { ShowcaseNav } from "@/components/showcase/ShowcaseNav";
import { ShowcaseHero } from "@/components/showcase/ShowcaseHero";

export const metadata: Metadata = {
  title: "MenuPro | نظام المنيو الرقمي الذكي للمطاعم والكافيهات 2026",
  description:
    "احصل على منيو رقمي تفاعلي متكامل لمطعمك فائق السرعة، بطلب مباشر عبر واتساب، وبدون أي عمولات على المبيعات.",
};

export default function ShowcasePage() {
  return (
    <main className="min-h-screen bg-[#0a0d12] text-white flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* شريط التنقل التسويقي العلوي */}
      <ShowcaseNav />

      {/* 1. قسم الـ Hero الافتتاحي المبهر */}
      <ShowcaseHero />

      {/* علامات إرساء مؤقتة للسكشنات اللاحقة لضمان عمل روابط التمرير بسلاسة */}
      <div id="features" />
      <div id="comparison" />
      <div id="stats" />
      <div id="how-it-works" />
    </main>
  );
}
