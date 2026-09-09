"use client";

import { Order, OrderItem, OrderStatus, OrderSource, CustomerLocation } from "@/config/restaurant";
import { supabase, isSupabaseConfigured } from "./supabase";
import { getDrivers } from "./driversService";

const ORDERS_STORAGE_KEY = "restaurant_orders_v1";

// جلب كل الطلبات
export async function getOrders(): Promise<Order[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          orderNumber: row.order_number,
          createdAt: row.created_at,
          items: Array.isArray(row.items) ? row.items : JSON.parse(row.items || "[]"),
          totalAmount: Number(row.total_amount),
          customerName: row.customer_name,
          customerPhone: row.customer_phone,
          customerAddress: row.customer_address,
          customerLocation: row.customer_location ? (typeof row.customer_location === "string" ? JSON.parse(row.customer_location) : row.customer_location) : undefined,
          notes: row.notes,
          orderSource: row.order_source as OrderSource,
          status: row.status as OrderStatus,
          assignedDriverId: row.assigned_driver_id || undefined,
          assignedDriverName: row.assigned_driver_name || undefined,
          assignedAt: row.assigned_at || undefined,
        }));
      }
    } catch (err) {
      console.warn("Supabase getOrders error, using local fallback:", err);
    }
  }

  // Fallback محلي
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore
  }

  return [];
}

// إنشاء طلب جديد
export async function createOrder(orderData: {
  items: OrderItem[];
  totalAmount: number;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerLocation?: CustomerLocation;
  notes?: string;
  orderSource?: OrderSource;
}): Promise<Order> {
  const now = new Date().toISOString();
  const id = "ord_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const orderSource: OrderSource = orderData.orderSource || "طلب من الموقع";

  // حساب رقم الطلب المتزايد محلياً
  let orderNumber = 1001;
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (saved) {
      const existing: Order[] = JSON.parse(saved);
      if (existing.length > 0) {
        orderNumber = Math.max(...existing.map((o) => o.orderNumber || 1000)) + 1;
      }
    }
  } catch {
    // ignore
  }

  // تعيين تلقائي افتراضي للمندوب عند استلام طلب جديد
  let assignedDriverId: string | undefined = undefined;
  let assignedDriverName: string | undefined = undefined;
  let assignedAt: string | undefined = undefined;
  let status: OrderStatus = "pending";

  try {
    const allDrivers = await getDrivers();
    const activeDrivers = allDrivers.filter((d) => d.isActive);
    if (activeDrivers.length === 1) {
      // إذا كان يوجد مندوب واحد فقط مسجل بالنظام: عيّنه تلقائياً لكل طلب جديد
      assignedDriverId = activeDrivers[0].id;
      assignedDriverName = activeDrivers[0].name;
      assignedAt = now;
      status = "out_for_delivery";
    } else if (activeDrivers.length > 1) {
      // إذا كان يوجد أكثر من مندوب: توزيع دائري Round-Robin بالتناوب بينهم حسب رقم الطلب
      const chosenDriver = activeDrivers[orderNumber % activeDrivers.length];
      assignedDriverId = chosenDriver.id;
      assignedDriverName = chosenDriver.name;
      assignedAt = now;
      status = "out_for_delivery";
    }
  } catch (err) {
    console.warn("Auto-assignment of driver failed:", err);
  }

  const newOrder: Order = {
    id,
    orderNumber,
    createdAt: now,
    items: orderData.items,
    totalAmount: orderData.totalAmount,
    customerName: orderData.customerName,
    customerPhone: orderData.customerPhone,
    customerAddress: orderData.customerAddress,
    customerLocation: orderData.customerLocation,
    notes: orderData.notes,
    orderSource,
    status,
    assignedDriverId,
    assignedDriverName,
    assignedAt,
  };

  // حفظ محلي فوري
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    const existing: Order[] = saved ? JSON.parse(saved) : [];
    const updated = [newOrder, ...existing];
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

    // إطلاق حدث محلي للمزامنة الفورية عبر النوافذ والتابات
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("new-order-received", { detail: newOrder }));
      if (newOrder.status === "out_for_delivery") {
        window.dispatchEvent(
          new CustomEvent("order-status-changed", {
            detail: { orderId: newOrder.id, status: newOrder.status },
          })
        );
      }
      window.dispatchEvent(new Event("storage"));
    }
  } catch {
    // ignore
  }

  // حفظ في Supabase إن كان متوفراً
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert({
          id: newOrder.id,
          items: newOrder.items,
          total_amount: newOrder.totalAmount,
          customer_name: newOrder.customerName,
          customer_phone: newOrder.customerPhone,
          customer_address: newOrder.customerAddress || null,
          customer_location: newOrder.customerLocation || null,
          notes: newOrder.notes || null,
          order_source: newOrder.orderSource,
          status: newOrder.status,
          assigned_driver_id: newOrder.assignedDriverId || null,
          assigned_driver_name: newOrder.assignedDriverName || null,
          assigned_at: newOrder.assignedAt || null,
        })
        .select()
        .single();

      if (!error && data) {
        newOrder.orderNumber = data.order_number || newOrder.orderNumber;
      }
    } catch (err) {
      console.warn("Supabase createOrder error:", err);
    }
  }

  return newOrder;
}

// تحديث حالة الطلب
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  // تحديث محلي
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (saved) {
      const orders: Order[] = JSON.parse(saved);
      const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }
    }
  } catch {
    // ignore
  }

  // تحديث Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) {
        console.warn("Supabase updateOrderStatus error:", error);
        return false;
      }
    } catch (err) {
      console.warn("Supabase updateOrderStatus error:", err);
      return false;
    }
  }

  return true;
}

// تصفير ومسح جميع الطلبات بالكامل (من التخزين المحلي وقاعدة البيانات)
export async function clearAllOrders(): Promise<boolean> {
  // مسح محلي
  try {
    localStorage.removeItem(ORDERS_STORAGE_KEY);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("orders-cleared"));
      window.dispatchEvent(new Event("storage"));
    }
  } catch (err) {
    console.warn("Failed to clear local orders:", err);
  }

  // مسح من Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      // حذف كل السجلات التي لها id (أي مسح الجدول)
      const { error } = await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) {
        console.warn("Supabase clearAllOrders error:", error);
      }
    } catch (err) {
      console.warn("Supabase clearAllOrders error:", err);
    }
  }

  return true;
}

// تشغيل صوت تنبيه ناعم وأنيق عند وصول طلب جديد بدون ملفات خارجية (Web Audio API)
export function playNewOrderSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // نغمة رنين ثنائية لطيفة (Chime: D5 -> A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880.0, now + 0.12); // A5

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.6);
  } catch {
    // ignore audio block
  }
}
