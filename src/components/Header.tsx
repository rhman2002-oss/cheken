"use client";

import React from "react";
import Image from "next/image";
import { MapPin, ShoppingBag, LogOut, User, Edit3 } from "lucide-react";
import { useRestaurant, useOrderMode } from "@/context/RestaurantDataContext";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";

export const Header: React.FC = () => {
  const { data } = useRestaurant();
  const { isDelivery } = useOrderMode();
  const { totalItemsCount, openCart } = useCart();
  const { customer, openAddressModal, openLoginModal, logout } = useCustomer();
  const { name, logo, isOpenStatus, uiTexts, menuMode } = data;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-surface/95 border-b border-border-subtle transition-all duration-200">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between">
        {/* اللوجو واسم المطعم */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-sm bg-surface shrink-0">
            <Image
              src={logo}
              alt={name}
              fill
              className="object-cover"
              sizes="40px"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm sm:text-base leading-tight text-text-main truncate">
              {name}
            </span>
            {isOpenStatus.show && (
              <span className="text-[10px] sm:text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                {isOpenStatus.defaultStatus === "open"
                  ? isOpenStatus.textOpen
                  : isOpenStatus.textClosed}
              </span>
            )}
          </div>
        </div>

        {/* زر السلة (يظهر حصراً عند تفعيل نمط التوصيل والطلبات) */}
        {isDelivery && menuMode === "cart_orders" && (
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={openCart}
              title={uiTexts.viewCart}
              aria-label={uiTexts.viewCart}
              className="min-h-[44px] px-3.5 sm:px-4 rounded-btn bg-primary text-white hover:bg-primary-hover transition-colors duration-200 flex items-center gap-2 font-bold text-xs sm:text-sm shadow-xs relative"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden xs:inline">{uiTexts.viewCart}</span>
              {totalItemsCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-secondary text-text-main text-[10px] font-black flex items-center justify-center">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* شريط عنوان التوصيل للزبون - يظهر حصراً عند تفعيل نمط التوصيل والطلبات (cart_orders) */}
      {isDelivery && menuMode === "cart_orders" && (
        <div className="bg-primary-light/40 border-t border-primary/10 py-1.5 px-3 sm:px-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 text-xs">
            {customer ? (
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-[11px] text-text-muted shrink-0">التوصيل إلى:</span>
                <span className="font-bold text-text-main truncate text-[11px] sm:text-xs">
                  {customer.address}
                </span>
                <button
                  type="button"
                  onClick={openAddressModal}
                  className="ms-1 text-[11px] font-bold text-primary hover:underline shrink-0 flex items-center gap-0.5"
                  title="تعديل موقع التوصيل على الخارطة"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>تعديل الموقع</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={openLoginModal}
                className="flex items-center gap-1.5 text-primary font-bold hover:underline text-[11px] sm:text-xs"
              >
                <MapPin className="w-3.5 h-3.5 animate-bounce" />
                <span>📍 اضغط هنا لتحديد موقعك عبر GPS ورقم هاتفك</span>
              </button>
            )}

            {customer && (
              <div className="flex items-center gap-2.5 shrink-0 ps-2 border-s border-border-subtle">
                <span className="text-[11px] text-text-muted font-mono hidden md:inline dir-ltr">
                  {customer.phone}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 transition-colors"
                  title="تسجيل خروج من هذا الجهاز"
                >
                  <LogOut className="w-3 h-3" />
                  <span>خروج</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
