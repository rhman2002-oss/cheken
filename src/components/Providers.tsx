"use client";

import React from "react";
import { RestaurantDataProvider } from "@/context/RestaurantDataContext";
import { CustomerProvider } from "@/context/CustomerContext";
import { CartProvider } from "@/context/CartContext";

export const Providers: React.FC<{
  children: React.ReactNode;
  forceOrderMode?: "delivery" | "display";
}> = ({ children, forceOrderMode }) => {
  return (
    <RestaurantDataProvider forceOrderMode={forceOrderMode}>
      <CustomerProvider>
        <CartProvider>{children}</CartProvider>
      </CustomerProvider>
    </RestaurantDataProvider>
  );
};
