"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { MenuItem } from "@/config/restaurant";
import { getDiscountedPrice } from "@/lib/utils";

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  getItemQuantity: (itemId: string) => number;
  totalItemsCount: number;
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
}

const CART_STORAGE_KEY = "restaurant_cart_v2";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // استرجاع السلة من التخزين المحلي
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  // حفظ السلة بالتخزين المحلي عند التعديل
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, isLoaded]);

  const addToCart = (item: MenuItem, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((ci) => ci.item.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.item.id === item.id
            ? { ...ci, quantity: ci.quantity + quantity }
            : ci
        );
      }
      return [...prev, { item, quantity }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((ci) => ci.item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((ci) =>
        ci.item.id === itemId ? { ...ci, quantity } : ci
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (itemId: string): number => {
    const found = items.find((ci) => ci.item.id === itemId);
    return found ? found.quantity : 0;
  };

  // إجمالي عدد العناصر
  const totalItemsCount = useMemo(() => {
    return items.reduce((sum, ci) => sum + ci.quantity, 0);
  }, [items]);

  // المجموع الفرعي (الأسعار الأصلية)
  const subtotal = useMemo(() => {
    const total = items.reduce(
      (sum, ci) => sum + ci.item.price * ci.quantity,
      0
    );
    return Math.round(total * 100) / 100;
  }, [items]);

  // إجمالي الخصم
  const totalDiscount = useMemo(() => {
    const total = items.reduce((sum, ci) => {
      const unitDiscounted = getDiscountedPrice(ci.item);
      const diff = ci.item.price - unitDiscounted;
      return sum + diff * ci.quantity;
    }, 0);
    return Math.round(total * 100) / 100;
  }, [items]);

  // المجموع النهائي
  const finalTotal = useMemo(() => {
    return Math.max(0, Math.round((subtotal - totalDiscount) * 100) / 100);
  }, [subtotal, totalDiscount]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        getItemQuantity,
        totalItemsCount,
        subtotal,
        totalDiscount,
        finalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
