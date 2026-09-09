"use client";

import React from "react";
import Image from "next/image";
import { MapPin, Clock } from "lucide-react";
import { useRestaurant } from "@/context/RestaurantDataContext";

export const Hero: React.FC = () => {
  const { data } = useRestaurant();

  const {
    name,
    logo,
    heroImage,
    location,
    workingHours,
    isOpenStatus,
  } = data;

  return (
    <div className="relative w-full overflow-hidden bg-text-main text-white select-none py-5 sm:py-6 border-b border-border-subtle">
      {/* خلفية صورة الغلاف مع تعتيم أنيق ومضغوط */}
      <div className="absolute inset-0 z-0 opacity-25">
        <Image
          src={heroImage}
          alt={name}
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black" />
      </div>

      {/* محتوى الهيرو المصغر والمرتب */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
        {/* صف الشعار واسم المطعم وحالة الفتح */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-primary shadow-md bg-surface shrink-0 ring-2 ring-white/10">
            <Image
              src={logo}
              alt={name}
              fill
              className="object-cover"
              sizes="64px"
              priority
            />
          </div>

          <div className="flex flex-col items-center sm:items-start text-center sm:text-start">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {name}
              </h1>
              {isOpenStatus?.show && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isOpenStatus.defaultStatus === "open"
                    ? isOpenStatus.textOpen
                    : isOpenStatus.textClosed}
                </span>
              )}
            </div>

            {/* سطر ساعات العمل والعنوان بشكل مدمج ومختصر */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs text-gray-300 mt-1">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                {location.city} - {location.address}
              </span>
              {workingHours.length > 0 && (
                <>
                  <span className="text-gray-500 hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                    {workingHours[0].hours}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

