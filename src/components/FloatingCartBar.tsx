"use client";

import React from "react";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRestaurant, useOrderMode } from "@/context/RestaurantDataContext";
import { formatPrice } from "@/lib/utils";

export const FloatingCartBar: React.FC = () => {
  const { totalItemsCount, finalTotal, openCart } = useCart();
  const { data } = useRestaurant();
  const { isDelivery } = useOrderMode();
  const { currency, currencyPosition, uiTexts, menuMode } = data;

  // لا يظهر الشريط إذا لم يكن نظام الطلب مفعلاً أو لم يكن النمط "cart_orders" أو السلة فارغة
  if (!isDelivery || menuMode !== "cart_orders" || totalItemsCount === 0) {
    return null;
  }

  const formattedTotal = formatPrice(finalTotal, currency, currencyPosition);

  return (
    <aside
      aria-label="شريط السلة العائم"
      className="fixed bottom-4 inset-x-4 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom-6 duration-300"
    >
      <button
        type="button"
        onClick={openCart}
        className="w-full min-h-[56px] px-4 py-3 bg-text-main hover:bg-black text-white rounded-btn shadow-2xl flex items-center justify-between gap-3 border border-white/10 active:scale-[0.98] transition-all duration-200"
      >
        {/* أيقونة السلة والعدد */}
        <div className="flex items-center gap-3">
          <div className="relative p-2 rounded-full bg-primary text-white shrink-0">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -end-1.5 w-5 h-5 rounded-full bg-secondary text-text-main text-[11px] font-black flex items-center justify-center border-2 border-text-main animate-bounce">
              {totalItemsCount}
            </span>
          </div>

          <div className="text-start flex flex-col">
            <span className="text-xs text-gray-300 font-medium">
              {totalItemsCount} {uiTexts.itemsCount}
            </span>
            <span className="text-sm font-extrabold text-white">
              {formattedTotal}
            </span>
          </div>
        </div>

        {/* زر التوجه للسلة */}
        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-white/15 px-3.5 py-2 rounded-btn">
          <span>{uiTexts.viewCart}</span>
          <ArrowLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
        </div>
      </button>
    </aside>
  );
};
