"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { useRestaurant } from "@/context/RestaurantDataContext";
import { Sparkles } from "lucide-react";

export const ShowcaseSection: React.FC = () => {
  const { data } = useRestaurant();
  const showcase = data.showcaseSection;
  const { uiTexts } = data;

  if (!showcase || !showcase.items || showcase.items.length === 0) {
    return null;
  }

  const title = uiTexts.whyUsTitle || showcase.title;
  const subtitle = uiTexts.whyUsSubtitle || showcase.subtitle;

  // إعدادات الحركات المتتابعة عند الوصول إلى السكشن بالسكرول
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.08,
      },
    },
  };

  const itemFadeUp: Variants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const cardHover = {
    scale: 1.03,
    y: -6,
    transition: {
      type: "spring" as const,
      stiffness: 350,
      damping: 20,
    },
  };

  return (
    <section id="why-us" className="relative w-full py-14 sm:py-20 bg-surface/70 border-y border-border-subtle/70 overflow-hidden">
      {/* خلفية ضوئية جمالية خافتة بطابع الفاست فود */}
      <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        {/* العنوان والبادج الترويجي مع أنميشن الدخول */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={containerVariants}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
        >
          {showcase.badge && (
            <motion.div
              variants={itemFadeUp}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-badge bg-primary-light text-primary text-xs font-bold mb-3.5 shadow-xs border border-primary/15"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showcase.badge}</span>
            </motion.div>
          )}

          <motion.h2
            variants={itemFadeUp}
            className="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight mb-3"
          >
            {title}
          </motion.h2>

          <motion.p
            variants={itemFadeUp}
            className="text-xs sm:text-base text-text-muted leading-relaxed font-normal"
          >
            {subtitle}
          </motion.p>
        </motion.div>

        {/* شبكة بطاقات المميزات الـ 4 مع Staggering و Hover ناعم */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {showcase.items.map((item) => (
            <motion.div
              key={item.id}
              variants={itemFadeUp}
              whileHover={cardHover}
              className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-card bg-surface border border-border-subtle shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 will-change-transform cursor-default"
            >
              <div>
                {/* رأس البطاقة: الأيقونة والرقم الإحصائي */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  {item.icon && (
                    <div className="w-13 h-13 rounded-2xl bg-primary-light/90 text-primary flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <span>{item.icon}</span>
                    </div>
                  )}

                  {item.stat && (
                    <div className="text-end">
                      <span className="block text-xl sm:text-2xl font-black text-primary leading-none">
                        {item.stat}
                      </span>
                      {item.statLabel && (
                        <span className="text-[10px] text-text-muted font-bold mt-1 block">
                          {item.statLabel}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* عنوان ونبذة الميزة */}
                <h3 className="font-extrabold text-base sm:text-lg text-text-main mb-2 group-hover:text-primary transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>

              {/* خط ديكوري ملون أسفل البطاقة ينشط عند Hover */}
              <div className="mt-5 pt-3 border-t border-border-subtle/60 flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-muted group-hover:text-primary transition-colors">
                  جكن اكسبريس
                </span>
                <div className="w-2.5 h-2.5 rounded-full bg-primary/20 group-hover:bg-primary group-hover:scale-125 transition-all duration-300" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
