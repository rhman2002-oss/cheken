"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { X, MessageCircle, Flame, ShoppingBag, Tag } from "lucide-react";
import { MenuItem } from "@/config/restaurant";
import { useRestaurant, useOrderMode } from "@/context/RestaurantDataContext";
import { useCart } from "@/context/CartContext";
import {
  formatPrice,
  createItemWhatsAppUrl,
  getDiscountedPrice,
  formatDiscountLabel,
} from "@/lib/utils";

interface ItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({ item, onClose }) => {
  const { data } = useRestaurant();
  const { isDelivery } = useOrderMode();
  const { currency, currencyPosition, contact, uiTexts, menuMode } = data;
  const { addToCart } = useCart();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (item) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  if (!item) return null;

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

  const orderWhatsAppUrl = createItemWhatsAppUrl(
    contact.whatsappNumber,
    contact.whatsappMessagePrefix,
    item.name,
    discountedPrice,
    currency
  );

  const isAvailable = item.isAvailable !== false;

  const handleAddToCart = () => {
    addToCart(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      {/* خلفية الإغلاق */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* محتوى النافذة */}
      <div className="relative w-full max-w-lg bg-surface rounded-card shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col">
        {/* زر الإغلاق 48px touch friendly */}
        <button
          type="button"
          onClick={onClose}
          aria-label={uiTexts.closeModal}
          className="absolute top-3 end-3 z-20 min-w-[44px] min-h-[44px] rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* صورة الوجبة */}
        <div className="relative w-full h-56 sm:h-72 bg-bg-page shrink-0">
          <Image
            src={item.image}
            alt={item.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 512px"
          />
          <div className="absolute top-3 start-3 flex flex-col gap-1.5">
            {item.badge && (
              <span className="px-3 py-1 rounded-badge text-xs font-bold bg-primary text-white shadow-md">
                {item.badge}
              </span>
            )}
            {hasDiscount && item.discount && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-badge text-xs font-black bg-secondary text-text-main shadow-md">
                <Tag className="w-3.5 h-3.5" />
                <span>{formatDiscountLabel(item.discount, currency)}</span>
              </span>
            )}
          </div>
        </div>

        {/* تفاصيل الصنف */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h2 className="text-lg sm:text-2xl font-bold text-text-main">
                {item.name}
              </h2>
              <div className="text-end shrink-0">
                <span className="text-xl sm:text-2xl font-black text-primary block">
                  {formattedFinalPrice}
                </span>
                {hasDiscount && (
                  <span className="text-xs text-text-muted line-through">
                    {formattedOriginalPrice}
                  </span>
                )}
              </div>
            </div>

            {/* السعرات الحرارية */}
            {item.calories !== undefined && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-badge bg-primary-light text-primary text-xs font-semibold mb-3">
                <Flame className="w-3.5 h-3.5 text-secondary" />
                <span>
                  {item.calories} {uiTexts.caloriesLabel}
                </span>
              </div>
            )}

            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* أزرار الإجراءات السفلية بارتفاع 48px للمس المريح */}
          <div className="pt-4 border-t border-border-subtle flex items-center gap-2.5">
            {!isAvailable ? (
              <div className="flex-1 min-h-[48px] rounded-btn bg-gray-100 text-gray-400 font-bold text-sm flex items-center justify-center">
                {uiTexts.unavailableBadge}
              </div>
            ) : isDelivery ? (
              <>
                {menuMode === "cart_orders" && (
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    className="flex-1 min-h-[48px] px-4 rounded-btn bg-primary hover:bg-primary-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{uiTexts.addToCart}</span>
                  </button>
                )}

                {menuMode === "direct_whatsapp" && (
                  <a
                    href={orderWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-h-[48px] px-4 rounded-btn bg-whatsapp hover:bg-whatsapp-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>{uiTexts.orderOnWhatsApp}</span>
                  </a>
                )}
              </>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] px-5 rounded-btn bg-bg-page hover:bg-border-subtle text-text-main font-semibold text-xs sm:text-sm transition-colors"
            >
              {uiTexts.closeModal}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
