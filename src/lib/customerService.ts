"use client";

import { supabase, isSupabaseConfigured } from "./supabase";
import { CustomerLocation } from "@/config/restaurant";

export interface Customer {
  phone: string;
  address: string;
  name?: string;
  location?: CustomerLocation;
  updatedAt?: string;
}

const ACTIVE_CUSTOMER_KEY = "restaurant_customer_session";
const CUSTOMERS_DB_KEY = "restaurant_customers_db";

// تنظيف وتوحيد رقم الهاتف
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9+]/g, "").trim();
}

// جلب الزبون النشط حالياً من المتصفح
export function getActiveCustomer(): Customer | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_CUSTOMER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed to read active customer:", e);
  }
  return null;
}

// حفظ الزبون كجلسة نشطة في المتصفح
export function saveActiveCustomer(customer: Customer): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_CUSTOMER_KEY, JSON.stringify(customer));
    window.dispatchEvent(new CustomEvent("customer-auth-changed", { detail: customer }));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.warn("Failed to save active customer:", e);
  }
}

// تسجيل خروج الزبون (مسح الجلسة المحلية فقط بدون حذف البيانات من قاعدة البيانات)
export function clearActiveCustomer(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACTIVE_CUSTOMER_KEY);
    window.dispatchEvent(new CustomEvent("customer-auth-changed", { detail: null }));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.warn("Failed to clear active customer:", e);
  }
}

// البحث عن زبون موجود مسبقاً برقم الهاتف لسحب عنوانه وموقعه تلقائياً
export async function findCustomerByPhone(phone: string): Promise<Customer | null> {
  const cleanPhone = sanitizePhone(phone);
  if (!cleanPhone || cleanPhone.length < 5) return null;

  // 1. فحص في Supabase إن كان مفعلاً
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (!error && data) {
        return {
          phone: data.phone,
          address: data.address,
          name: data.name || "",
          location: data.location || (data.lat && data.lng ? {
            lat: Number(data.lat),
            lng: Number(data.lng),
            mapsUrl: `https://www.google.com/maps?q=${data.lat},${data.lng}`,
            notes: data.location_notes || "",
          } : undefined),
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn("Supabase findCustomerByPhone error:", err);
    }
  }

  // 2. فحص في قاعدة البيانات المحلية (LocalStorage Fallback)
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(CUSTOMERS_DB_KEY);
      if (raw) {
        const db: Record<string, Customer> = JSON.parse(raw);
        if (db[cleanPhone]) {
          return db[cleanPhone];
        }
      }
    } catch {
      // ignore
    }
  }

  return null;
}

// حفظ أو تحديث بيانات الزبون (الرقم + الموقع + العنوان + الاسم)
export async function saveCustomer(data: {
  phone: string;
  address?: string;
  name?: string;
  location?: CustomerLocation;
}): Promise<Customer> {
  const cleanPhone = sanitizePhone(data.phone);
  const displayAddress = data.address?.trim() || 
    (data.location?.notes ? `${data.location.addressTitle || "موقع محدد على الخريطة"} (${data.location.notes})` : (data.location?.addressTitle || "موقع محدد على الخريطة"));

  const updatedCustomer: Customer = {
    phone: cleanPhone,
    address: displayAddress,
    name: data.name?.trim() || "",
    location: data.location,
    updatedAt: new Date().toISOString(),
  };

  // 1. حفظ في قاعدة البيانات المحلية
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(CUSTOMERS_DB_KEY);
      const db: Record<string, Customer> = raw ? JSON.parse(raw) : {};
      db[cleanPhone] = updatedCustomer;
      localStorage.setItem(CUSTOMERS_DB_KEY, JSON.stringify(db));
    } catch {
      // ignore
    }
  }

  // 2. تعيين كجلسة نشطة محلياً
  saveActiveCustomer(updatedCustomer);

  // 3. حفظ/تحديث في Supabase إن كان مفعلاً
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("customers").upsert(
        {
          phone: cleanPhone,
          address: updatedCustomer.address,
          name: updatedCustomer.name || null,
          location: updatedCustomer.location || null,
          updated_at: updatedCustomer.updatedAt,
        },
        { onConflict: "phone" }
      );
    } catch (err) {
      console.warn("Supabase saveCustomer upsert error:", err);
    }
  }

  return updatedCustomer;
}

// تحديث موقع الزبون الحالي وحفظه
export async function updateCustomerLocation(location: CustomerLocation, addressText?: string): Promise<Customer | null> {
  const current = getActiveCustomer();
  if (!current) return null;

  return await saveCustomer({
    phone: current.phone,
    name: current.name,
    address: addressText,
    location,
  });
}

// تحديث العنوان النصي للزبون الحالي
export async function updateCustomerAddress(newAddress: string): Promise<Customer | null> {
  const current = getActiveCustomer();
  if (!current) return null;

  return await saveCustomer({
    phone: current.phone,
    address: newAddress,
    name: current.name,
    location: current.location ? { ...current.location, notes: newAddress } : undefined,
  });
}
