"use client";

import React from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { MessageCircle, Sparkles, Flame, Check, Star } from "lucide-react";
import { MenuItem } from "@/config/restaurant";
import { useRestaurant, useOrderMode } from "@/context/RestaurantDataContext";
import {
  formatPrice,
  createItemWhatsAppUrl,
  getDiscountedPrice,
} from "@/lib/utils";

export const SpotlightProduct: React.FC = () => {
  const { data } = useRestaurant();
  const { isDelivery } = useOrderMode();
  const {
    categories,
    spotlightItemId,
    currency,
    currencyPosition,
    contact,
    uiTexts,
  } = data;

  // جلب صنف السبوتلايت المحدد بـ spotlightItemId، أو أول صنف مميز
  const spotlightItem: MenuItem | undefined = React.useMemo(() => {
    const allItems: MenuItem[] = [];
    categories.forEach((c) => allItems.push(...c.items));

    if (spotlightItemId) {
      const found = allItems.find((i) => i.id === spotlightItemId);
      if (found) return found;
    }

    // بديل: أول صنف يحمل isFeatured
    const featured = allItems.find((i) => i.isFeatured === true);
    if (featured) return featured;

    return allItems[0];
  }, [categories, spotlightItemId]);

  if (!spotlightItem) {
    return null;
  }

  const discountedPrice = getDiscountedPrice(spotlightItem);
  const formattedPrice = formatPrice(
    discountedPrice,
    currency,
    currencyPosition
  );

  const orderWhatsAppUrl = createItemWhatsAppUrl(
    contact.whatsappNumber,
    contact.whatsappMessagePrefix,
    spotlightItem.name,
    discountedPrice,
    currency
  );

  // إعدادات الحركات
  const textVariants: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as const,
      },
    },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, scale: 0.84, rotate: -4 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 220,
        damping: 18,
      },
    },
  };

  return (
    <section className="relative w-full py-16 sm:py-24 bg-[#111622] text-white overflow-hidden border-y border-white/10">
      {/* لمسات إضاءة خلفية دافئة */}
      <div className="absolute top-1/2 start-1/4 -translate-y-1/2 w-[500px] h-[350px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 end-1/4 w-[400px] h-[300px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-3xl bg-gradient-to-b from-surface/80 to-surface/40 border border-white/15 p-6 sm:p-10 lg:p-14 shadow-2xl backdrop-blur-md overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* العمود النصي (يمين في RTL) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={textVariants}
            className="lg:col-span-7 flex flex-col items-start text-start"
          >
            {/* شارة الوجبة المميزة */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-badge bg-primary/95 text-white text-xs font-black mb-4 shadow-md shadow-primary/30 border border-white/10">
              <Sparkles className="w-4 h-4 text-secondary animate-pulse" />
              <span>{uiTexts.spotlightBadge || "وجبة الأسبوع الخاصة ⭐"}</span>
            </div>

            {/* اسم الوجبة الرئيسي */}
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3 drop-shadow-sm">
              {spotlightItem.name}
            </h2>

            {/* الوصف الشهي */}
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal mb-6 max-w-lg">
              {spotlightItem.description}
            </p>

            {/* نقاط القوة والخلطة الخاصة */}
            <div className="grid grid-cols-2 gap-3 mb-8 w-full max-w-md">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-200">
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>أرز مبهر بخلطة سرية</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-200">
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>قطع دجاج كرسبي مقرمشة</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-200">
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>صوص غني وخاص</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-gray-200">
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>تجهيز طازج وفوري</span>
              </div>
            </div>

            {/* السعر وزر الطلب المباشر */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 border-t border-white/10 w-full">
              <div>
                <span className="text-xs text-gray-400 block font-medium">
                  السعر
                </span>
                <span className="text-2xl sm:text-3xl font-black text-secondary">
                  {formattedPrice}
                </span>
              </div>

              {isDelivery ? (
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={orderWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] inline-flex items-center gap-2 px-7 py-3 rounded-btn bg-whatsapp hover:bg-whatsapp-hover text-white font-extrabold text-sm sm:text-base shadow-lg shadow-whatsapp/30 transition-colors will-change-transform cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>اطلب الوجبة الآن عبر واتساب</span>
                </motion.a>
              ) : null}
            </div>
          </motion.div>

          {/* العمود البصري: صورة الوجبة ثلاثية الأبعاد بتأثير عائم (يسار في RTL) */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={imageVariants}
            className="lg:col-span-5 flex items-center justify-center relative"
          >
            {/* توهج لوني خلف الوجبة */}
            <div className="absolute inset-0 w-72 h-72 sm:w-80 sm:h-80 mx-auto bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-full blur-2xl pointer-events-none" />

            {/* حاوية الصورة بتأثير الطفو المستمر */}
            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl shadow-black/80 will-change-transform group cursor-pointer"
            >
              <Image
                src={spotlightItem.image}
                alt={spotlightItem.name}
                fill
                priority
                className="object-cover group-hover:scale-106 transition-transform duration-500 ease-out"
                sizes="(max-width: 640px) 256px, 320px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              {/* شارة مميزة عائمة فوق الصورة */}
              <div className="absolute bottom-3 start-3 px-3 py-1.5 rounded-badge bg-black/70 backdrop-blur-md border border-white/15 flex items-center gap-1.5 text-xs text-white font-bold">
                <Star className="w-3.5 h-3.5 fill-secondary text-secondary" />
                <span>الأعلى تقييماً من زبائننا</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
