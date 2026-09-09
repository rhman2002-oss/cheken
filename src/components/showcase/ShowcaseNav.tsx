"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Utensils, MessageCircle, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export const ShowcaseNav: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0d1117]/85 backdrop-blur-md border-b border-white/10 shadow-lg py-3"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* الشعار واسم النظام */}
        <Link href="/showcase" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg sm:text-xl text-white tracking-tight">
                Menu<span className="text-orange-400">Pro</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                2026
              </span>
            </div>
            <span className="text-[11px] text-gray-400 block -mt-1">
              نظام المنيو الرقمي الذكي
            </span>
          </div>
        </Link>

        {/* روابط التنقل السريعة للديسكتوب */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium text-gray-300">
          <a
            href="#features"
            className="hover:text-orange-400 transition-colors cursor-pointer"
          >
            المميزات الحية
          </a>
          <a
            href="#comparison"
            className="hover:text-orange-400 transition-colors cursor-pointer"
          >
            مقارنة قبل وبعد
          </a>
          <a
            href="#stats"
            className="hover:text-orange-400 transition-colors cursor-pointer"
          >
            الأرقام والسرعة
          </a>
          <a
            href="#how-it-works"
            className="hover:text-orange-400 transition-colors cursor-pointer"
          >
            كيف تحصل عليه؟
          </a>
        </nav>

        {/* أزرار الإجراءات في الهيدر */}
        <div className="flex items-center gap-2.5">
          {/* رابط تجربة المنيو الحي الحالي */}
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-gray-200 text-xs sm:text-sm font-semibold border border-white/10 transition-colors"
          >
            <span>الديمو المباشر</span>
            <ExternalLink className="w-3.5 h-3.5 text-orange-400" />
          </Link>

          {/* زر تواصل واتساب لشراء النظام */}
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="https://wa.me/9647727177249?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%86%D8%B8%D8%A7%D9%85%20%D8%A7%D9%84%D9%85%D9%86%D9%8A%D9%88%20%D8%A7%D9%84%D8%B0%D9%83%D9%8A%20%D9%84%D9%85%D8%B7%D8%B9%D9%85%D9%8A"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            <span className="hidden sm:inline">احجز نسختك</span>
            <span className="sm:hidden">واتساب</span>
          </motion.a>
        </div>
      </div>
    </header>
  );
};
