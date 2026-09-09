"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { useRestaurant } from "@/context/RestaurantDataContext";
import { createWhatsAppUrl } from "@/lib/utils";

export const FloatingWhatsApp: React.FC = () => {
  const { data } = useRestaurant();
  const { contact, uiTexts, menuMode } = data;

  // إخفاء الزر العائم في نمط "عرض فقط"
  if (menuMode === "display_only") {
    return null;
  }

  const url = createWhatsAppUrl(
    contact.whatsappNumber,
    `${contact.whatsappMessagePrefix}\nأود الاستفسار والطلب مباشرة.`
  );

  return (
    <aside
      aria-label="طلب عبر واتساب"
      className="fixed bottom-6 end-6 z-40 flex items-center group"
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={uiTexts.generalOrderWhatsApp}
        className="relative min-w-[52px] min-h-[52px] flex items-center justify-center p-3.5 sm:p-4 rounded-full bg-whatsapp text-white shadow-xl hover:bg-whatsapp-hover hover:scale-105 active:scale-95 transition-all duration-300"
      >
        {/* نبض متحرك */}
        <span className="absolute -inset-1 rounded-full bg-whatsapp opacity-35 animate-ping pointer-events-none" />

        <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />

        <span className="hidden sm:inline-block max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ms-2 transition-all duration-300 whitespace-nowrap text-xs font-bold">
          {uiTexts.generalOrderWhatsApp}
        </span>
      </a>
    </aside>
  );
};
