"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  type Variants,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ArrowDown,
  Sparkles,
  Smartphone,
  Zap,
  CheckCircle2,
  MessageCircle,
  ShoppingBag,
  Search,
  Eye,
  Star,
  Layers,
  ChevronDown,
} from "lucide-react";

export const ShowcaseHero: React.FC = () => {
  const { scrollY } = useScroll();

  // تأثيرات بارالاكس خفيفة لطبقات الخلفية والعناصر العائمة
  const yBgSlow = useTransform(scrollY, [0, 600], [0, 100]);
  const yFloating1 = useTransform(scrollY, [0, 600], [0, -60]);
  const yFloating2 = useTransform(scrollY, [0, 600], [0, 80]);

  // إعدادات حركة الدخول المتتابع للعنوان والنصوص
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  };

  const itemFadeUp: Variants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const titleWords = [
    "منيو",
    "رقمي",
    "احترافي",
    "لمطعمك",
    "خلال",
    "دقائق!",
  ];

  return (
    <section className="relative min-h-screen pt-28 pb-16 sm:pt-36 sm:pb-24 flex flex-col justify-between items-center overflow-hidden bg-[#0a0d12] text-white">
      {/* 1. خلفية متدرجة متحركة ولمسات إضاءة ناعمة (Mesh Animated Gradients) */}
      <motion.div
        style={{ y: yBgSlow }}
        className="absolute inset-0 pointer-events-none overflow-hidden z-0"
      >
        {/* بقعة إضاءة برتقالية دافئة علوية */}
        <div className="absolute top-[-10%] start-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-orange-600/25 via-amber-500/15 to-transparent rounded-full blur-[120px] animate-pulse" />

        {/* بقعة إضاءة زمردية هادئة تمثل واتساب وسرعة الطلب */}
        <div className="absolute top-[35%] end-[-10%] w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[130px]" />

        {/* بقعة إضاءة حمراء داكنة تمثل حيوية الوجبات السريعة */}
        <div className="absolute bottom-[5%] start-[-10%] w-[450px] h-[450px] bg-red-600/15 rounded-full blur-[130px]" />

        {/* شبكة نقاط تقنية دقيقة في الخلفية */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </motion.div>

      {/* عناصر طعام ديكورية عائمة خفيفة تسبح في الخلفية */}
      <motion.div
        style={{ y: yFloating1 }}
        animate={{ y: [0, -14, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="absolute top-36 start-[6%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl text-xs text-amber-200 z-10 pointer-events-none"
      >
        <span className="text-xl">🍗</span>
        <div>
          <p className="font-bold">دجاج مقرمش طازج</p>
          <p className="text-[10px] text-gray-400">طلب بضغطة واحدة</p>
        </div>
      </motion.div>

      <motion.div
        style={{ y: yFloating2 }}
        animate={{ y: [0, 16, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute top-52 end-[8%] hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl text-xs text-emerald-200 z-10 pointer-events-none"
      >
        <span className="text-xl">⚡</span>
        <div>
          <p className="font-bold">سرعة تحميل 0.4 ثانية</p>
          <p className="text-[10px] text-gray-400">تجربة زبون لا تقاوم</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
        className="absolute bottom-40 start-[10%] hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-[11px] text-orange-300 z-10 pointer-events-none"
      >
        <span className="text-lg">🍔</span>
        <span>تحديث الأسعار فوراً بدون طباعة</span>
      </motion.div>

      {/* 2. المحتوى الرئيسي للهيرو */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* الشارة الترويجية الذكية */}
          <motion.div
            variants={itemFadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500/15 via-amber-500/20 to-red-500/15 border border-orange-500/30 text-orange-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-orange-400 animate-spin-slow" />
            <span>نظام المنيو الرقمي الأكثر طلباً للمطاعم والكافيهات 2026</span>
          </motion.div>

          {/* العنوان الضخم بحركة Reveal كلمة بكلمة */}
          <motion.h1
            variants={itemFadeUp}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.2] mb-6 text-white max-w-4xl"
          >
            منيو رقمي احترافي لمطعمك{" "}
            <span className="block mt-2 bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-sm">
              خلال دقائق وبدون عمولات!
            </span>
          </motion.h1>

          {/* النص التسويقي المقنع والمباشر */}
          <motion.p
            variants={itemFadeUp}
            className="text-sm sm:text-lg text-gray-300 max-w-2xl font-normal leading-relaxed mb-8"
          >
            ودّع قوائم الـ PDF الباهتة وتكاليف الطباعة المتكررة. امنح زبائنك تجربة طلب
            تفاعلية فائقة السرعة، متوافقة 100% مع الجوال، وتحوّل الزائر إلى طلب واتساب
            جاهز بضغطة زر واحدة.
          </motion.p>

          {/* مميزات سريعة بنقاط لافتة */}
          <motion.div
            variants={itemFadeUp}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-300 mb-10"
          >
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>جاهز للإطلاق الفوري</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>طلب مباشر بواتساب</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>0% عمولة على المبيعات</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>تعديل وحيد بملف واحد</span>
            </div>
          </motion.div>

          {/* أزرار الدعوة للإجراء (CTAs) */}
          <motion.div
            variants={itemFadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            {/* الزر الرئيسي النابض (Pulse) */}
            <motion.a
              href="#features"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="relative group min-h-[52px] w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer will-change-transform overflow-hidden"
            >
              {/* تأثير النبض الضوئي خلف الزر */}
              <span className="absolute inset-0 w-full h-full bg-white/20 animate-ping opacity-25 rounded-xl pointer-events-none" />
              <Eye className="w-5 h-5" />
              <span>شاهد كيف يعمل النظام</span>
              <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </motion.a>

            {/* زر معاينة المنيو الحي (Demo) */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto"
            >
              <Link
                href="/"
                target="_blank"
                className="min-h-[52px] w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors backdrop-blur-md shadow-md"
              >
                <Smartphone className="w-5 h-5 text-orange-400" />
                <span>جرّب ديمو المطعم الحي</span>
              </Link>
            </motion.div>

            {/* زر تواصل مباشر وسريع */}
            <motion.a
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              href="https://wa.me/9647727177249?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%B7%D9%84%D8%A8%20%D9%86%D8%B3%D8%AE%D8%A9%20%D9%85%D9%86%20%D9%86%D8%B8%D8%A7%D9%85%20%D8%A7%D9%84%D9%85%D9%86%D9%8A%D9%88%20%D8%A7%D9%84%D8%B0%D9%83%D9%8A%20%D9%84%D9%85%D8%B7%D8%B9%D9%85%D9%8A"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[52px] w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 border border-emerald-500/40 shadow-lg shadow-emerald-600/20 transition-colors"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>احصل على نسختك الآن</span>
            </motion.a>
          </motion.div>
        </motion.div>

        {/* 3. مجسّم المعاينة الحية المصغّر (Interactive Floating Mockup) */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 sm:mt-16 w-full max-w-3xl relative"
        >
          {/* وهج لوني خلف جهاز المعاينة */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-red-500/20 rounded-3xl blur-2xl -z-10" />

          {/* إطار محاكاة الهاتف أو اللوحة الذكية */}
          <div className="relative bg-[#131822] border-2 border-white/15 rounded-3xl p-3 sm:p-5 shadow-2xl shadow-black/80 backdrop-blur-xl">
            {/* شريط الإشعارات العلوي للمحاكاة */}
            <div className="flex items-center justify-between px-3 py-2 bg-black/40 rounded-xl border border-white/5 mb-4 text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-gray-200">
                  تجربة حية تفاعلية
                </span>
              </div>
              <span className="text-orange-400 font-mono">menu-live-demo.online</span>
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <Zap className="w-3.5 h-3.5" />
                <span>60 FPS</span>
              </div>
            </div>

            {/* كارت محاكاة لمنيو متكامل ومقرمش */}
            <div className="bg-[#1a2130] rounded-2xl p-4 border border-white/10 text-start">
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white font-black text-sm shadow">
                    🍗
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">جكن اكسبريس</h4>
                    <p className="text-[11px] text-gray-400">سلسلة الوجبات السريعة</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  مفتوح الآن ويستقبل الطلبات
                </span>
              </div>

              {/* محاكاة شريط بحث فوري */}
              <div className="w-full py-2 px-3 rounded-lg bg-black/30 border border-white/10 flex items-center justify-between text-xs text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-orange-400" />
                  <span>ابحث عن وجبة، ساندويش، ريزو...</span>
                </div>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono">
                  بحث لحظي
                </span>
              </div>

              {/* عينات وجبات تفاعلية داخل المعاينة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-3 hover:border-orange-500/30 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-lg bg-orange-950/60 border border-orange-500/20 flex items-center justify-center text-xl shrink-0">
                      🥪
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-white">ساندويش فايرفايتر</h5>
                      <span className="text-[11px] font-black text-orange-400">
                        6,000 د.ع
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                    طلب بواتساب
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between gap-3 hover:border-orange-500/30 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-12 h-12 rounded-lg bg-orange-950/60 border border-orange-500/20 flex items-center justify-center text-xl shrink-0">
                      🍚
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-white">ريزو كرسبي حار</h5>
                      <span className="text-[11px] font-black text-orange-400">
                        6,500 د.ع
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-orange-600 text-white text-[10px] font-bold shadow-xs">
                    أضف للسلة
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 4. مؤشر التمرير للأسفل (Scroll Indicator) */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        className="relative z-10 pt-10 flex flex-col items-center gap-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
        onClick={() => {
          const el = document.getElementById("features");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <span className="text-[11px] font-medium tracking-wide">
          استكشف مميزات النظام
        </span>
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5 shadow-sm">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="w-1.5 h-1.5 rounded-full bg-orange-400"
          />
        </div>
      </motion.div>
    </section>
  );
};
