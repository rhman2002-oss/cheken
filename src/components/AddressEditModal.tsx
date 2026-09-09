"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { useCustomer } from "@/context/CustomerContext";

const InteractiveMapPicker = dynamic(
  () => import("./InteractiveMapPicker").then((mod) => mod.InteractiveMapPicker),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 flex flex-col items-center justify-center bg-bg-page text-text-muted text-xs font-bold gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span>جاري تشغيل الخارطة...</span>
      </div>
    ),
  }
);

export const AddressEditModal: React.FC = () => {
  const { customer, isAddressModalOpen, closeAddressModal, updateLocation } = useCustomer();

  if (!isAddressModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-surface rounded-card shadow-2xl border border-border-subtle overflow-y-auto max-h-[92vh] animate-in zoom-in-95 duration-200">
        <InteractiveMapPicker
          key={customer?.location ? `${customer.location.lat}-${customer.location.lng}` : "new-location"}
          initialLocation={customer?.location}
          title="تعديل وتحديد موقع التوصيل"
          onCancel={closeAddressModal}
          onConfirm={(location, addressText) => {
            updateLocation(location, addressText);
          }}
        />
      </div>
    </div>
  );
};
