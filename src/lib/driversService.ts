"use client";

import { Driver } from "@/config/restaurant";
import { supabase, isSupabaseConfigured } from "./supabase";

const DRIVERS_STORAGE_KEY = "restaurant_drivers_v1";

// جلب قائمة المناديب
export async function getDrivers(): Promise<Driver[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          name: row.name,
          phone: row.phone,
          pin: row.pin,
          isActive: row.is_active ?? true,
          createdAt: row.created_at,
        }));
      }
    } catch (err) {
      console.warn("Supabase getDrivers error, using local storage fallback:", err);
    }
  }

  // تخزين محلي
  try {
    const saved = localStorage.getItem(DRIVERS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }

  return [];
}

// جلب مندوب بواسطة المعرف
export async function getDriverById(id: string): Promise<Driver | null> {
  const drivers = await getDrivers();
  return drivers.find((d) => d.id === id) || null;
}

// إضافة مندوب جديد
export async function createDriver(data: {
  name: string;
  phone: string;
  pin?: string;
  isActive?: boolean;
}): Promise<Driver> {
  const cleanPhone = data.phone.trim();
  const id = "drv_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
  const now = new Date().toISOString();

  const newDriver: Driver = {
    id,
    name: data.name.trim(),
    phone: cleanPhone,
    pin: data.pin?.trim() || "1234",
    isActive: data.isActive ?? true,
    createdAt: now,
  };

  // حفظ محلي
  try {
    const existing = await getDrivers();
    const updated = [newDriver, ...existing];
    localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("drivers-updated"));
      window.dispatchEvent(new Event("storage"));
    }
  } catch {
    // ignore
  }

  // حفظ في Supabase إن توفر
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("drivers").insert({
        id: newDriver.id,
        name: newDriver.name,
        phone: newDriver.phone,
        pin: newDriver.pin,
        is_active: newDriver.isActive,
      });
    } catch (err) {
      console.warn("Supabase insert driver error:", err);
    }
  }

  return newDriver;
}

// تعديل بيانات مندوب
export async function updateDriver(id: string, updates: Partial<Driver>): Promise<boolean> {
  try {
    const existing = await getDrivers();
    const updated = existing.map((d) => (d.id === id ? { ...d, ...updates } : d));
    localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("drivers-updated"));
      window.dispatchEvent(new Event("storage"));
    }
  } catch {
    return false;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.pin !== undefined) payload.pin = updates.pin;
      if (updates.isActive !== undefined) payload.is_active = updates.isActive;

      await supabase.from("drivers").update(payload).eq("id", id);
    } catch (err) {
      console.warn("Supabase update driver error:", err);
    }
  }

  return true;
}

// حذف مندوب
export async function deleteDriver(id: string): Promise<boolean> {
  try {
    const existing = await getDrivers();
    const updated = existing.filter((d) => d.id !== id);
    localStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(updated));

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("drivers-updated"));
      window.dispatchEvent(new Event("storage"));
    }
  } catch {
    return false;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("drivers").delete().eq("id", id);
    } catch (err) {
      console.warn("Supabase delete driver error:", err);
    }
  }

  return true;
}

// التحقق من تسجيل دخول المندوب (رقم الهاتف + الرمز)
export async function verifyDriverLogin(phone: string, pin: string): Promise<Driver | null> {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const cleanPin = pin.trim();

  const drivers = await getDrivers();
  const matched = drivers.find((d) => {
    const dPhone = d.phone.replace(/[^0-9]/g, "");
    const dPin = d.pin || "1234";
    return dPhone === cleanPhone && dPin === cleanPin && d.isActive;
  });

  return matched || null;
}

// تعيين طلب لمندوب وتغيير حالته إلى "قيد التوصيل"
export async function assignDriverToOrder(
  orderId: string,
  driverId: string,
  driverName: string
): Promise<boolean> {
  const ORDERS_STORAGE_KEY = "restaurant_orders_v1";

  // تحديث محلي فوري
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (saved) {
      const orders = JSON.parse(saved);
      const updated = orders.map((o: any) =>
        o.id === orderId
          ? {
              ...o,
              status: "out_for_delivery",
              assignedDriverId: driverId,
              assignedDriverName: driverName,
              assignedAt: new Date().toISOString(),
            }
          : o
      );
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("order-status-changed", { detail: { orderId, status: "out_for_delivery" } }));
        window.dispatchEvent(new Event("storage"));
      }
    }
  } catch {
    // ignore
  }

  // تحديث Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from("orders")
        .update({
          status: "out_for_delivery",
          assigned_driver_id: driverId,
          assigned_driver_name: driverName,
        })
        .eq("id", orderId);
    } catch (err) {
      console.warn("Supabase assign driver error:", err);
    }
  }

  return true;
}
