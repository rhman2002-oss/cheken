"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  Customer,
  getActiveCustomer,
  saveCustomer,
  clearActiveCustomer,
  updateCustomerAddress as serviceUpdateAddress,
  updateCustomerLocation as serviceUpdateLocation,
  findCustomerByPhone,
} from "@/lib/customerService";
import { CustomerLocation } from "@/config/restaurant";

interface CustomerContextType {
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoginModalOpen: boolean;
  isAddressModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  openAddressModal: () => void;
  closeAddressModal: () => void;
  login: (phone: string, address?: string, name?: string, location?: CustomerLocation) => Promise<Customer>;
  logout: () => void;
  updateAddress: (newAddress: string) => Promise<Customer | null>;
  updateLocation: (location: CustomerLocation, addressText?: string) => Promise<Customer | null>;
  checkExistingCustomer: (phone: string) => Promise<Customer | null>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // تحميل بيانات الزبون النشط عند بدء التشغيل
  useEffect(() => {
    const current = getActiveCustomer();
    setCustomer(current);

    const handleAuthChange = (e: any) => {
      setCustomer(e.detail !== undefined ? e.detail : getActiveCustomer());
    };

    window.addEventListener("customer-auth-changed", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("customer-auth-changed", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);
  const openAddressModal = useCallback(() => setIsAddressModalOpen(true), []);
  const closeAddressModal = useCallback(() => setIsAddressModalOpen(false), []);

  const login = useCallback(async (phone: string, address?: string, name?: string, location?: CustomerLocation) => {
    const saved = await saveCustomer({ phone, address, name, location });
    setCustomer(saved);
    setIsLoginModalOpen(false);
    return saved;
  }, []);

  const logout = useCallback(() => {
    clearActiveCustomer();
    setCustomer(null);
  }, []);

  const updateAddress = useCallback(async (newAddress: string) => {
    const updated = await serviceUpdateAddress(newAddress);
    if (updated) {
      setCustomer(updated);
    }
    setIsAddressModalOpen(false);
    return updated;
  }, []);

  const updateLocation = useCallback(async (location: CustomerLocation, addressText?: string) => {
    const updated = await serviceUpdateLocation(location, addressText);
    if (updated) {
      setCustomer(updated);
    }
    setIsAddressModalOpen(false);
    return updated;
  }, []);

  const checkExistingCustomer = useCallback(async (phone: string) => {
    return await findCustomerByPhone(phone);
  }, []);

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isAuthenticated: !!customer,
        isLoginModalOpen,
        isAddressModalOpen,
        openLoginModal,
        closeLoginModal,
        openAddressModal,
        closeAddressModal,
        login,
        logout,
        updateAddress,
        updateLocation,
        checkExistingCustomer,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const ctx = useContext(CustomerContext);
  if (!ctx) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return ctx;
};
