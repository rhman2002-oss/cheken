"use client";

import React from "react";
import { Clock, MapPin, Phone, Heart, Shield } from "lucide-react";
import Link from "next/link";
import { useRestaurant } from "@/context/RestaurantDataContext";

export const Footer: React.FC = () => {
  const { data } = useRestaurant();
  const {
    name,
    tagline,
    contact,
    location,
    workingHours,
    socialLinks,
    uiTexts,
  } = data;

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-surface border-t border-border-subtle mt-12 pt-10 pb-28 sm:pb-12 text-text-main">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-border-subtle/80">
          {/* العمود الأول: الهوية والموقع */}
          <div className="flex flex-col gap-3">
            <h3 className="font-bold text-base sm:text-lg text-primary">{name}</h3>
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
              {tagline}
            </p>
            <div className="mt-2 flex flex-col gap-2 text-xs text-text-muted">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>
                  {location.city} - {location.address}
                </span>
              </div>
              {/* العنوان والمدينة بدون روابط خارجية */}
            </div>
          </div>

          {/* العمود الثاني: ساعات العمل */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-xs sm:text-sm text-text-main flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>{uiTexts.workingHoursTitle}</span>
            </h4>
            <ul className="flex flex-col gap-2 text-xs sm:text-sm text-text-muted">
              {workingHours.map((wh, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between border-b border-border-subtle/40 pb-1.5"
                >
                  <span className="font-medium">{wh.days}</span>
                  <span className="text-text-main font-semibold dir-ltr">
                    {wh.hours}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* العمود الثالث: التواصل وخدمة الزبائن */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-xs sm:text-sm text-text-main">
              {uiTexts.contactTitle}
            </h4>
            <div className="flex flex-col gap-2 text-xs text-text-muted">
              {contact.phone && (
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="dir-ltr font-bold text-text-main text-sm">{contact.phone}</span>
                </div>
              )}
              <p className="text-xs text-text-muted leading-relaxed mt-1">
                خدمة الزبائن وتجهيز الطلبات متوفرة طوال أوقات العمل الرسمية.
              </p>
            </div>
          </div>
        </div>

        {/* حقوق النشر ورابط لوحة التحكم */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
          <p>
            © {currentYear} {name}. {uiTexts.rightsReserved}.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-text-muted hover:text-primary transition-colors py-1 px-2 rounded-btn bg-bg-page"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>لوحة الإدارة</span>
            </Link>
            <span className="inline-flex items-center gap-1">
              <span>{uiTexts.poweredBy}</span>
              <Heart className="w-3 h-3 text-red-500 fill-current inline" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
