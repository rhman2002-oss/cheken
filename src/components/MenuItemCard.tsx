"use client";

import React from "react";
import Image from "next/image";
import { MessageCircle, Flame, Eye, Plus, Minus, ShoppingBag, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { MenuItem } from "@/config/restaurant";
import { useRestaurant, useOrderMode } from "@/context/RestaurantDataContext";
import { useCart } from "@/context/CartContext";
import {
  formatPrice,
  createItemWhatsAppUrl,
  getDiscountedPrice,
  formatDiscountLabel,
} from "@/lib/utils";

interface MenuItemCardProps {
  item: MenuItem;
  onViewDetails: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onViewDetails,
}) => {
  const { data } = useRestaurant();
  const { isDelivery } = useOrderMode();
  const { currency, currencyPosition, contact, uiTexts, menuMode } = data;

  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const currentQuantity = getItemQuantity(item.id);

  const isAvailable = item.isAvailable !== false;
  const hasDiscount = item.discount?.active && item.discount.value > 0;
  const discountedPrice = getDiscountedPrice(item);

  const formattedOriginalPrice = formatPrice(
    item.price,
    currency,
    currencyPosition
  );
  const formattedFinalPrice = formatPrice(
    discountedPrice,
    currency,
    currencyPosition
  );

  const orderWhatsAppUrl = createItemWhatsAppUrl(
    contact.whatsappNumber,
    contact.whatsappMessagePrefix,
    item.name,
    discountedPrice,
    currency
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
      whileHover={{
        y: -5,
        boxShadow: "0 14px 28px -6px rgba(0, 0, 0, 0.12)",
      }}
      className="group relative flex flex-col justify-between bg-surface rounded-card border border-border-subtle shadow-xs hover:border-primary/30 transition-colors duration-300 overflow-hidden will-change-transform"
    >
      {/* قسم الصورة والشارات */}
      <div
        onClick={() => onViewDetails(item)}
        className="relative w-full h-44 sm:h-52 bg-bg-page overflow-hidden cursor-pointer"
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          loading="lazy"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* بادجات التميز والخصم */}
        <div className="absolute top-2.5 start-2.5 z-10 flex flex-col gap-1.5 items-start">
          {item.badge && (
            <span className="px-2.5 py-1 rounded-badge text-[11px] sm:text-xs font-bold bg-primary text-white shadow-md backdrop-blur-sm">
              {item.badge}
            </span>
          )}
          {hasDiscount && item.discount && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-badge text-[11px] font-black bg-secondary text-text-main shadow-md">
              <Tag className="w-3 h-3" />
              <span>{formatDiscountLabel(item.discount, currency)}</span>
            </span>
          )}
        </div>

        {/* شارة السعرات الحرارية */}
        {item.calories !== undefined && (
          <div className="absolute bottom-2.5 end-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-badge text-[10px] sm:text-[11px] font-semibold bg-black/60 text-white backdrop-blur-md">
              <Flame className="w-3 h-3 text-secondary" />
              <span>
                {item.calories} {uiTexts.caloriesLabel}
              </span>
            </span>
          </div>
        )}

        {/* شارة غير متوفر إن وجدت */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="px-3.5 py-1.5 rounded-badge bg-red-600 text-white font-bold text-xs shadow-lg">
              {uiTexts.unavailableBadge}
            </span>
          </div>
        )}
      </div>

      {/* قسم تفاصيل الصنف */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3
            onClick={() => onViewDetails(item)}
            className="font-bold text-sm sm:text-base text-text-main hover:text-primary cursor-pointer transition-colors duration-200 line-clamp-1"
          >
            {item.name}
          </h3>
          <p className="text-xs text-text-muted mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* السعر وأزرار التحكم */}
        <div className="pt-2.5 border-t border-border-subtle/80 flex items-center justify-between gap-2">
          {/* عرض السعر (مع الخصم إذا وجد) */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-primary">
                {formattedFinalPrice}
              </span>
              {hasDiscount && (
                <span className="text-[11px] text-text-muted line-through font-normal">
                  {formattedOriginalPrice}
                </span>
              )}
            </div>
          </div>

          {/* أزرار الإجراءات بحسب orderMode و MenuMode */}
          <div className="flex items-center gap-1.5">
            {/* زر معاينة الصنف */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              type="button"
              onClick={() => onViewDetails(item)}
              title={uiTexts.viewDetails}
              aria-label={uiTexts.viewDetails}
              className="min-h-[44px] min-w-[44px] rounded-btn bg-bg-page hover:bg-border-subtle text-text-muted hover:text-text-main transition-colors flex items-center justify-center cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </motion.button>

            {/* إذا كان الصنف غير متوفر */}
            {!isAvailable ? (
              <span className="text-[11px] text-red-500 font-bold px-2 py-1 bg-red-50 rounded-btn">
                {uiTexts.unavailableBadge}
              </span>
            ) : isDelivery ? (
              /* في نمط الطلب (orderMode: delivery): إتاحة أزرار الطلب بحسب menuMode */
              <>
                {/* 1. نمط السلة والطلبات (cart_orders) */}
                {menuMode === "cart_orders" && (
                  <div>
                    {currentQuantity > 0 ? (
                      <div className="flex items-center bg-primary text-white rounded-btn p-0.5 shadow-xs">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, currentQuantity - 1)
                          }
                          className="min-h-[40px] min-w-[36px] flex items-center justify-center hover:bg-black/10 rounded-full transition-colors cursor-pointer"
                          aria-label="تقليل"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </motion.button>
                        <span className="w-5 text-center text-xs font-black">
                          {currentQuantity}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, currentQuantity + 1)
                          }
                          className="min-h-[40px] min-w-[36px] flex items-center justify-center hover:bg-black/10 rounded-full transition-colors cursor-pointer"
                          aria-label="زيادة"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => addToCart(item)}
                        className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-btn bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{uiTexts.addToCart}</span>
                      </motion.button>
                    )}
                  </div>
                )}

                {/* 2. نمط الطلب المباشر بالواتساب (direct_whatsapp) */}
                {menuMode === "direct_whatsapp" && (
                  <motion.a
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    href={orderWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 rounded-btn bg-whatsapp hover:bg-whatsapp-hover text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>{uiTexts.orderOnWhatsApp}</span>
                  </motion.a>
                )}
              </>
            ) : null /* في نمط العرض فقط (orderMode: display): يظهر السعر فقط كمعلومة بدون أي زر طلب */}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
