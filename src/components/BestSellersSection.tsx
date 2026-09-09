"use client";

import React from "react";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";
import { MessageCircle, Flame, Sparkles, Tag, Eye } from "lucide-react";
import { MenuItem } from "@/config/restaurant";
import { useRestaurant, useOrderMode } from "@/context/RestaurantDataContext";
import {
  formatPrice,
  createItemWhatsAppUrl,
  getDiscountedPrice,
  formatDiscountLabel,
} from "@/lib/utils";

interface BestSellersSectionProps {
  onSelectItem?: (item: MenuItem) => void;
}

export const BestSellersSection: React.FC<BestSellersSectionProps> = ({
  onSelectItem,
}) => {
  const { data } = useRestaurant();
  const { isDelivery } = useOrderMode();
  const { categories, currency, currencyPosition, contact, uiTexts } = data;

  // جلب الأصناف المميزة (isFeatured = true)، وفي حال عدم وجودها نأخذ أول صنف من كل قسم
  const featuredItems: MenuItem[] = React.useMemo(() => {
    const allItems: MenuItem[] = [];
    categories.forEach((cat) => allItems.push(...cat.items));

    const marked = allItems.filter((item) => item.isFeatured === true);
    if (marked.length >= 3) {
      return marked.slice(0, 4);
    }

    // بديل ذكي: أخذ أول صنف من كل قسم متاح
    const fallback: MenuItem[] = [];
    categories.forEach((cat) => {
      const firstAvailable = cat.items.find((it) => it.isAvailable !== false);
      if (firstAvailable && !fallback.some((f) => f.id === firstAvailable.id)) {
        fallback.push(firstAvailable);
      }
    });

    return fallback.slice(0, 4);
  }, [categories]);

  if (featuredItems.length === 0) {
    return null;
  }

  const title = uiTexts.bestSellersTitle || "الأكثر طلباً 🔥";
  const subtitle =
    uiTexts.bestSellersSubtitle ||
    "أشهى وجباتنا المفضلة التي يعشقها زبائننا يومياً بنكهة وقرمشة لا تُقاوم";

  // إعدادات الحركات المتتابعة
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
    scale: 1.025,
    y: -6,
    transition: {
      type: "spring" as const,
      stiffness: 350,
      damping: 20,
    },
  };

  return (
    <section id="best-sellers" className="relative w-full py-14 sm:py-20 bg-bg-page overflow-hidden">
      {/* لمسة إضاءة دافئة خلفية */}
      <div className="absolute top-1/3 start-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        {/* رأس السكشن مع العنوان والوصف */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={containerVariants}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-14"
        >
          <motion.div
            variants={itemFadeUp}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-badge bg-primary-light text-primary text-xs font-bold mb-3 shadow-xs border border-primary/15"
          >
            <Flame className="w-3.5 h-3.5 text-secondary" />
            <span>مختارات الزبائن اليومية</span>
          </motion.div>

          <motion.h2
            variants={itemFadeUp}
            className="text-2xl sm:text-4xl font-extrabold text-text-main tracking-tight mb-2.5"
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

        {/* شبكة بطاقات الأكثر طلباً */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-40px" }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {featuredItems.map((item) => {
            const hasDiscount = item.discount?.active && item.discount.value > 0;
            const discountedPrice = getDiscountedPrice(item);
            const formattedFinalPrice = formatPrice(
              discountedPrice,
              currency,
              currencyPosition
            );
            const formattedOriginalPrice = formatPrice(
              item.price,
              currency,
              currencyPosition
            );

            // رابط طلب مباشر عبر واتساب
            const orderWhatsAppUrl = createItemWhatsAppUrl(
              contact.whatsappNumber,
              contact.whatsappMessagePrefix,
              item.name,
              discountedPrice,
              currency
            );

            return (
              <motion.div
                key={item.id}
                variants={itemFadeUp}
                whileHover={cardHover}
                className="group relative flex flex-col justify-between bg-surface rounded-card border border-border-subtle shadow-xs hover:shadow-xl hover:border-primary/40 transition-all duration-300 overflow-hidden will-change-transform"
              >
                {/* صورة الصنف مع الشارات */}
                <div className="relative w-full h-44 sm:h-48 bg-bg-page overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    loading="lazy"
                    className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* شارة التميز أو الخصم */}
                  <div className="absolute top-2.5 start-2.5 z-10 flex flex-col gap-1.5 items-start">
                    {item.badge ? (
                      <span className="px-2.5 py-1 rounded-badge text-[11px] font-black bg-primary text-white shadow-md">
                        {item.badge}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-badge text-[10px] font-black bg-secondary text-text-main shadow-md">
                        مميز ⭐
                      </span>
                    )}

                    {hasDiscount && item.discount && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-badge text-[10px] font-black bg-red-600 text-white shadow-md">
                        <Tag className="w-3 h-3" />
                        <span>{formatDiscountLabel(item.discount, currency)}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* تفاصيل الصنف */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-text-main group-hover:text-primary transition-colors duration-200 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed font-normal">
                      {item.description}
                    </p>
                  </div>

                  {/* السعر وزر الطلب حسب orderMode */}
                  <div className="pt-3 border-t border-border-subtle/80 flex items-center justify-between gap-2">
                    {/* عرض السعر */}
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-black text-primary">
                          {formattedFinalPrice}
                        </span>
                        {hasDiscount && (
                          <span className="text-[11px] text-text-muted line-through">
                            {formattedOriginalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* زر الطلب المباشر عبر واتساب: يخضع لـ orderMode */}
                    {isDelivery ? (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={orderWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-h-[42px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-btn bg-whatsapp hover:bg-whatsapp-hover text-white text-xs font-black shadow-xs transition-colors will-change-transform cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 fill-current" />
                        <span>{uiTexts.orderOnWhatsApp || "اطلب الآن"}</span>
                      </motion.a>
                    ) : null /* في نمط العرض فقط: يظهر السعر فقط كمعلومة */}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
