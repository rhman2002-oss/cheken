"use client";

import React, { useState, useMemo } from "react";
import { MenuItem } from "@/config/restaurant";
import { useRestaurant } from "@/context/RestaurantDataContext";
import { CategoryBar } from "./CategoryBar";
import { SearchBar } from "./SearchBar";
import { MenuItemCard } from "./MenuItemCard";
import { ItemModal } from "./ItemModal";
import { Utensils, SearchX } from "lucide-react";
import { motion } from "framer-motion";

export const MenuSection: React.FC = () => {
  const { data } = useRestaurant();
  const { categories, uiTexts } = data;

  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalItem, setModalItem] = useState<MenuItem | null>(null);

  // تصفية العناصر بناءً على البحث والقسم المختار
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categories
      .map((category) => {
        if (activeCategoryId !== "all" && category.id !== activeCategoryId) {
          return null;
        }

        const matchingItems = category.items.filter((item) => {
          if (!query) return true;
          return (
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
          );
        });

        if (matchingItems.length === 0) return null;

        return {
          ...category,
          items: matchingItems,
        };
      })
      .filter(Boolean) as typeof categories;
  }, [categories, activeCategoryId, searchQuery]);

  return (
    <section className="w-full relative">
      {/* شريط الأقسام اللاصق */}
      <CategoryBar
        categories={categories}
        activeCategoryId={activeCategoryId}
        onSelectCategory={(id) => setActiveCategoryId(id)}
      />

      <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-5 pb-10">
        {/* مربع البحث وعنوان القائمة */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3.5 mb-7">
          <div className="text-center md:text-start w-full md:w-auto">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center justify-center md:justify-start gap-2.5">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary flex items-center justify-center shadow-xs">
                <Utensils className="w-5 h-5 sm:w-6 sm:h-6" />
              </span>
              <span className="tracking-tight">{uiTexts.menuSectionTitle}</span>
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-gray-600 mt-1">
              {uiTexts.menuSectionSubtitle}
            </p>
          </div>

          <div className="w-full md:w-80">
            <SearchBar
              query={searchQuery}
              onQueryChange={(q) => setSearchQuery(q)}
            />
          </div>
        </div>

        {/* عرض الأقسام والأصناف */}
        {filteredCategories.length > 0 ? (
          <div className="space-y-10 sm:space-y-12">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                id={`category-${category.id}`}
                className="scroll-mt-32"
              >
                {/* عنوان القسم وشعاره */}
                <motion.div
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center justify-between mb-3.5 pb-2 border-b-2 border-primary/20"
                >
                  <div className="flex items-center gap-2">
                    {category.icon && (
                      <span className="text-xl sm:text-2xl">{category.icon}</span>
                    )}
                    <h3 className="text-base sm:text-xl font-bold text-text-main">
                      {category.name}
                    </h3>
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-badge bg-primary-light text-primary">
                    {category.items.length} {uiTexts.categoryItemCountSuffix}
                  </span>
                </motion.div>

                {/* شبكة بطاقات الأطعمة (Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                  {category.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onViewDetails={(selected) => setModalItem(selected)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* حالة عدم وجود نتائج (Empty State) */
          <div className="py-12 px-4 text-center flex flex-col items-center justify-center bg-surface rounded-card border border-border-subtle my-6">
            <div className="p-3.5 rounded-full bg-primary-light text-primary mb-3">
              <SearchX className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-text-main mb-1">
              {uiTexts.noResultsFound}
            </h3>
            <p className="text-xs text-text-muted max-w-sm mb-5">
              {uiTexts.noResultsDesc}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategoryId("all");
              }}
              className="min-h-[44px] px-5 py-2.5 rounded-btn bg-primary text-white text-xs sm:text-sm font-bold shadow-xs hover:bg-primary-hover transition-colors"
            >
              {uiTexts.allCategories}
            </button>
          </div>
        )}
      </div>

      {/* نافذة تفاصيل الوجبة المنبثقة */}
      <ItemModal item={modalItem} onClose={() => setModalItem(null)} />
    </section>
  );
};
