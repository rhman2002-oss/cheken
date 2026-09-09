"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  RestaurantConfig,
  MenuItem,
  MenuMode,
  OrderMode,
  CheckoutMethod,
  SiteMode,
  Discount,
  restaurantData as initialData,
} from "@/config/restaurant";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface RestaurantDataContextType {
  data: RestaurantConfig;
  isLoading: boolean;
  updateMenuMode: (mode: MenuMode) => Promise<void>;
  updateOrderMode: (mode: "delivery" | "display") => Promise<void>;
  updateCheckoutMethod: (method: CheckoutMethod) => Promise<void>;
  updateSiteMode: (mode: SiteMode) => Promise<void>;
  toggleIsOpen: (isOpen: boolean) => Promise<void>;
  updateGeneralInfo: (info: Partial<RestaurantConfig>) => Promise<void>;
  addMenuItem: (item: Omit<MenuItem, "id">) => Promise<void>;
  updateMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (itemId: string) => Promise<void>;
  toggleItemAvailability: (itemId: string) => Promise<void>;
  updateItemDiscount: (itemId: string, discount?: Discount) => Promise<void>;
  resetToDefault: () => void;
  forceOrderMode?: "delivery" | "display";
}

const STORAGE_KEY = "restaurant_menu_data_v2";

const RestaurantDataContext = createContext<RestaurantDataContextType | undefined>(
  undefined
);

export const RestaurantDataProvider: React.FC<{
  children: React.ReactNode;
  forceOrderMode?: "delivery" | "display";
}> = ({ children, forceOrderMode }) => {
  const [data, setData] = useState<RestaurantConfig>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // تحميل البيانات الأولية
  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured && supabase) {
        try {
          // جلب إعدادات المطعم
          const { data: settings } = await supabase
            .from("restaurant_settings")
            .select("*")
            .eq("id", "default")
            .maybeSingle();

          // جلب الأقسام
          const { data: cats } = await supabase
            .from("categories")
            .select("*")
            .order("sort_order", { ascending: true });

          // جلب الأصناف
          const { data: items } = await supabase
            .from("menu_items")
            .select("*")
            .order("sort_order", { ascending: true });

          if (settings && cats && items) {
            const mappedCategories = cats.map((c) => ({
              id: c.id,
              name: c.name,
              icon: c.icon,
              items: items
                .filter((item) => item.category_id === c.id)
                .map((item) => ({
                  id: item.id,
                  categoryId: item.category_id,
                  name: item.name,
                  description: item.description,
                  price: Number(item.price),
                  image: item.image,
                  badge: item.badge,
                  calories: item.calories,
                  isAvailable: item.is_available,
                  discount: item.discount_active
                    ? {
                        type: item.discount_type as "percentage" | "fixed",
                        value: Number(item.discount_value),
                        active: Boolean(item.discount_active),
                      }
                    : undefined,
                })),
            }));

            setData((prev) => ({
              ...prev,
              name: settings.name || prev.name,
              tagline: settings.tagline || prev.tagline,
              description: settings.description || prev.description,
              logo: settings.logo || prev.logo,
              heroImage: settings.hero_image || prev.heroImage,
              currency: settings.currency || prev.currency,
              menuMode: (settings.menu_mode as MenuMode) || prev.menuMode,
              checkoutMethod: (settings.checkout_method as CheckoutMethod) || prev.checkoutMethod || "both",
              siteMode: (settings.site_mode as SiteMode) || prev.siteMode || "delivery",
              orderMode: settings.site_mode === "display" ? "display" : ((settings.order_mode as OrderMode) || prev.orderMode || "delivery"),
              isOpenStatus: {
                ...prev.isOpenStatus,
                defaultStatus: settings.is_open ? "open" : "closed",
              },
              contact: {
                ...prev.contact,
                phone: settings.phone || prev.contact.phone,
                whatsappNumber: settings.whatsapp_number || prev.contact.whatsappNumber,
              },
              categories: mappedCategories.length > 0 ? mappedCategories : prev.categories,
            }));
            setIsLoading(false);
            return;
          }
        } catch (err) {
          console.warn("Supabase fetch failed, using fallback:", err);
        }
      }

      // السقوط الآمن: فحص LocalStorage أو الاعتماد على initialData
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setData(JSON.parse(saved));
        }
      } catch {
        // لا مشكلة، نعتمد على initialData
      }
      setIsLoading(false);
    }

    loadData();
  }, []);

  // دالة لحفظ التعديلات محلياً وفي Supabase إن وُجد
  const persistData = useCallback(async (newData: RestaurantConfig) => {
    setData(newData);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    } catch {
      // ignore
    }
  }, []);

  // 1. تحديث نمط المنيو (عرض فقط / طلب مباشر / سلة)
  const updateMenuMode = async (mode: MenuMode) => {
    const updated = { ...data, menuMode: mode };
    await persistData(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("restaurant_settings")
        .update({ menu_mode: mode })
        .eq("id", "default");
    }
  };

  // 1.1 تحديث نمط الطلب الموحد ("delivery" للطلب أو "display" للعرض فقط)
  const updateOrderMode = async (mode: "delivery" | "display") => {
    const updated = { ...data, orderMode: mode };
    await persistData(updated);
  };

  // 1.2 تحديث طريقة إتمام الطلب ("website" | "whatsapp" | "both")
  const updateCheckoutMethod = async (method: CheckoutMethod) => {
    const updated = { ...data, checkoutMethod: method };
    await persistData(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("restaurant_settings")
        .update({ checkout_method: method })
        .eq("id", "default");
    }
  };

  // 1.3 تحديث نمط الموقع الشامل (siteMode: "display" | "delivery" | "both")
  const updateSiteMode = async (mode: SiteMode) => {
    const orderMode: OrderMode = mode === "display" ? "display" : "delivery";
    const menuMode: MenuMode = mode === "display" ? "display_only" : "cart_orders";
    const updated: RestaurantConfig = {
      ...data,
      siteMode: mode,
      orderMode,
      menuMode,
    };
    await persistData(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("restaurant_settings")
          .update({
            site_mode: mode,
            order_mode: orderMode,
            menu_mode: menuMode,
          })
          .eq("id", "default");
      } catch (err) {
        console.warn("Supabase update site_mode error:", err);
      }
    }
  };

  // 2. تبديل حالة المطعم (مفتوح / مغلق)
  const toggleIsOpen = async (isOpen: boolean) => {
    const updated: RestaurantConfig = {
      ...data,
      isOpenStatus: {
        ...data.isOpenStatus,
        defaultStatus: isOpen ? "open" : "closed",
      },
    };
    await persistData(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("restaurant_settings")
        .update({ is_open: isOpen })
        .eq("id", "default");
    }
  };

  // 3. تحديث البيانات العامة
  const updateGeneralInfo = async (info: Partial<RestaurantConfig>) => {
    const updated: RestaurantConfig = {
      ...data,
      ...info,
      contact: {
        ...data.contact,
        ...(info.contact || {}),
      },
      location: {
        ...data.location,
        ...(info.location || {}),
      },
    };
    await persistData(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("restaurant_settings")
        .update({
          name: updated.name,
          tagline: updated.tagline,
          description: updated.description,
          logo: updated.logo,
          hero_image: updated.heroImage,
          phone: updated.contact.phone,
          whatsapp_number: updated.contact.whatsappNumber,
          address: updated.location.address,
        })
        .eq("id", "default");
    }
  };

  // 4. إضافة وجبة جديدة
  const addMenuItem = async (newItemData: Omit<MenuItem, "id">) => {
    const newId = `item_${Date.now()}`;
    const newItem: MenuItem = { ...newItemData, id: newId };

    const updatedCategories = data.categories.map((cat) => {
      if (cat.id === newItem.categoryId) {
        return {
          ...cat,
          items: [newItem, ...cat.items],
        };
      }
      return cat;
    });

    const updated = { ...data, categories: updatedCategories };
    await persistData(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase.from("menu_items").insert({
        id: newId,
        category_id: newItem.categoryId,
        name: newItem.name,
        description: newItem.description,
        price: newItem.price,
        image: newItem.image,
        badge: newItem.badge,
        calories: newItem.calories,
        is_available: newItem.isAvailable ?? true,
        discount_type: newItem.discount?.type || null,
        discount_value: newItem.discount?.value || 0,
        discount_active: newItem.discount?.active || false,
      });
    }
  };

  // 5. تعديل وجبة
  const updateMenuItem = async (updatedItem: MenuItem) => {
    const updatedCategories = data.categories.map((cat) => ({
      ...cat,
      items: cat.items.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    }));

    const updated = { ...data, categories: updatedCategories };
    await persistData(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("menu_items")
        .update({
          name: updatedItem.name,
          description: updatedItem.description,
          price: updatedItem.price,
          image: updatedItem.image,
          badge: updatedItem.badge,
          calories: updatedItem.calories,
          is_available: updatedItem.isAvailable,
          discount_type: updatedItem.discount?.type || null,
          discount_value: updatedItem.discount?.value || 0,
          discount_active: updatedItem.discount?.active || false,
        })
        .eq("id", updatedItem.id);
    }
  };

  // 6. حذف وجبة
  const deleteMenuItem = async (itemId: string) => {
    const updatedCategories = data.categories.map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => item.id !== itemId),
    }));

    const updated = { ...data, categories: updatedCategories };
    await persistData(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase.from("menu_items").delete().eq("id", itemId);
    }
  };

  // 7. تبديل توفر الصنف بنقرة واحدة (isAvailable)
  const toggleItemAvailability = async (itemId: string) => {
    let newStatus = true;
    const updatedCategories = data.categories.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => {
        if (item.id === itemId) {
          newStatus = !item.isAvailable;
          return { ...item, isAvailable: newStatus };
        }
        return item;
      }),
    }));

    const updated = { ...data, categories: updatedCategories };
    await persistData(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("menu_items")
        .update({ is_available: newStatus })
        .eq("id", itemId);
    }
  };

  // 8. تعديل الخصم على الصنف
  const updateItemDiscount = async (itemId: string, discount?: Discount) => {
    const updatedCategories = data.categories.map((cat) => ({
      ...cat,
      items: cat.items.map((item) => {
        if (item.id === itemId) {
          return { ...item, discount };
        }
        return item;
      }),
    }));

    const updated = { ...data, categories: updatedCategories };
    await persistData(updated);

    if (isSupabaseConfigured && supabase) {
      await supabase
        .from("menu_items")
        .update({
          discount_type: discount?.type || null,
          discount_value: discount?.value || 0,
          discount_active: discount?.active || false,
        })
        .eq("id", itemId);
    }
  };

  const resetToDefault = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData(initialData);
  };

  return (
    <RestaurantDataContext.Provider
      value={{
        data,
        isLoading,
        updateMenuMode,
        updateOrderMode,
        updateCheckoutMethod,
        updateSiteMode,
        toggleIsOpen,
        updateGeneralInfo,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        updateItemDiscount,
        resetToDefault,
        forceOrderMode,
      }}
    >
      {children}
    </RestaurantDataContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantDataContext);
  if (!context) {
    throw new Error("useRestaurant must be used within a RestaurantDataProvider");
  }
  return context;
};

/**
 * هوك مخصص مركزي للتحقق من وضع الطلب (orderMode)
 * - isDelivery: الطلب مفعل ويظهر زر "اطلب الآن" عبر واتساب
 * - isDisplayOnly: عرض السعر فقط كنص عادي بدون أزرار طلب
 */
export const useOrderMode = () => {
  const { data, forceOrderMode } = useRestaurant();
  const siteMode = data.siteMode ?? "delivery";
  const rawOrderMode = siteMode === "display" ? "display" : (data.orderMode ?? "delivery");
  const orderMode = forceOrderMode || rawOrderMode;
  const isDelivery = orderMode === "delivery";
  const isDisplayOnly = orderMode === "display";

  return {
    orderMode,
    isDelivery,
    isDisplayOnly,
    siteMode,
  };
};
