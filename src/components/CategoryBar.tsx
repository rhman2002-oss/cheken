"use client";

import React, { useRef } from "react";
import { Category } from "@/config/restaurant";
import { useRestaurant } from "@/context/RestaurantDataContext";

interface CategoryBarProps {
  categories: Category[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  categories,
  activeCategoryId,
  onSelectCategory,
}) => {
  const { data } = useRestaurant();
  const { uiTexts } = data;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (categoryId: string) => {
    onSelectCategory(categoryId);

    if (categoryId !== "all") {
      const element = document.getElementById(`category-${categoryId}`);
      if (element) {
        const offset = 130;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <div className="sticky top-16 z-30 w-full bg-surface/95 backdrop-blur-md border-b border-border-subtle shadow-xs py-2.5">
      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 overscroll-x-contain touch-pan-x"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* زر جميع الأصناف */}
          <button
            type="button"
            onClick={() => handleCategoryClick("all")}
            className={`min-h-[42px] whitespace-nowrap px-4 py-2 rounded-btn text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 flex items-center ${
              activeCategoryId === "all"
                ? "bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]"
                : "bg-bg-page text-text-muted hover:text-text-main hover:bg-border-subtle/50"
            }`}
          >
            {uiTexts.allCategories}
          </button>

          {/* أزرار الأقسام الفردية */}
          {categories.map((cat) => {
            const isActive = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id)}
                className={`min-h-[42px] inline-flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 rounded-btn text-xs sm:text-sm font-semibold transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]"
                    : "bg-bg-page text-text-muted hover:text-text-main hover:bg-border-subtle/50"
                }`}
              >
                {cat.icon && <span className="text-sm">{cat.icon}</span>}
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-border-subtle text-text-muted"
                  }`}
                >
                  {cat.items.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
