import { Discount, MenuItem } from "@/config/restaurant";

/**
 * دوال مساعدة عامة وثابتة لنظام المنيو والسلة والطلبات
 */

export function formatPrice(
  price: number,
  currency: string,
  position: "before" | "after" = "after"
): string {
  const rounded = Math.round(price * 100) / 100;
  if (position === "before") {
    return `${currency} ${rounded}`;
  }
  return `${rounded} ${currency}`;
}

/**
 * فحص ما إذا كان نظام الطلب مفعل (delivery) أو عرض فقط (display)
 */
export function isOrderDelivery(orderMode?: string): boolean {
  return orderMode !== "display";
}

/**
 * حساب السعر بعد الخصم إن وجد
 */
export function getDiscountedPrice(item: MenuItem): number {
  if (!item.discount || !item.discount.active) {
    return item.price;
  }
  if (item.discount.type === "percentage") {
    const discounted = item.price * (1 - item.discount.value / 100);
    return Math.max(0, Math.round(discounted * 100) / 100);
  }
  if (item.discount.type === "fixed") {
    return Math.max(0, item.price - item.discount.value);
  }
  return item.price;
}

export function formatDiscountLabel(
  discount: Discount,
  currency: string
): string {
  if (discount.type === "percentage") {
    return `-${discount.value}%`;
  }
  return `-${discount.value} ${currency}`;
}

export function createWhatsAppUrl(
  phoneNumber: string,
  message: string
): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function createItemWhatsAppUrl(
  phoneNumber: string,
  prefix: string,
  itemName: string,
  price: number,
  currency: string
): string {
  const itemMessage = `${prefix}\n- *${itemName}*\n- السعر: ${price} ${currency}\n\nيرجى تأكيد استلام الطلب وتزويدي بالوقت المتوقع.`;
  return createWhatsAppUrl(phoneNumber, itemMessage);
}

export interface CartCheckoutData {
  items: { item: MenuItem; quantity: number }[];
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  mapsUrl?: string;
  notes?: string;
  currency: string;
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  restaurantName: string;
}

/**
 * توليد رسالة فاتورة واتساب متكاملة ومنسقة جداً لكامل السلة
 */
export function createCartWhatsAppReceipt(
  phoneNumber: string,
  data: CartCheckoutData
): string {
  const itemsText = data.items
    .map((cartItem) => {
      const unitPrice = getDiscountedPrice(cartItem.item);
      const itemTotal = unitPrice * cartItem.quantity;
      const discountNote =
        cartItem.item.discount?.active && cartItem.item.discount.value > 0
          ? ` (خصم ${
              cartItem.item.discount.type === "percentage"
                ? `${cartItem.item.discount.value}%`
                : `${cartItem.item.discount.value} ${data.currency}`
            })`
          : "";

      return `▫️ *${cartItem.quantity}x* ${cartItem.item.name}${discountNote} \n    = *${itemTotal} ${data.currency}*`;
    })
    .join("\n\n");

  const locationLine = data.mapsUrl ? `• موقع الخريطة (GPS): ${data.mapsUrl}\n` : "";

  const message = `🧾 *طلب جديد من المنيو الإلكتروني*
مطعم: *${data.restaurantName}*
---------------------------------------
👤 *بيانات العميل:*
• الاسم: ${data.customerName || "غير محدد"}
• الهاتف: ${data.customerPhone || "غير محدد"}
• العنوان: ${data.customerAddress || "غير محدد"}
${locationLine}---------------------------------------
📋 *تفاصيل الطلبات:*
${itemsText}
---------------------------------------
💵 *المجموع الفرعي:* ${data.subtotal} ${data.currency}
${
  data.totalDiscount > 0
    ? `🎉 *إجمالي الخصم:* -${data.totalDiscount} ${data.currency}\n`
    : ""
}💰 *المجموع النهائي المطلوب:* *${data.finalTotal} ${data.currency}*
---------------------------------------
${data.notes ? `📝 *ملاحظات إضافية:*\n${data.notes}\n---------------------------------------\n` : ""}يرجى تأكيد استلام الطلب وبدء التحضير. شكراً لكم!`;

  return createWhatsAppUrl(phoneNumber, message);
}

/**
 * إضافة بصمة زمنية (Cache Buster) لرابط الصورة لضمان تحديثها فورياً عبر جميع الأجهزة والمتصفحات والـ CDN
 */
export function withCacheBuster(url: string, customTimestamp?: number): string {
  if (!url || typeof url !== "string") return url;

  // إذا كانت الصورة بتنسيق Base64 أو Blob، فلا تحتاج إلى Cache Buster
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }

  const timestamp = customTimestamp || Date.now();

  try {
    // إزالة أي بصمة سابقة v=... أو _t=...
    const cleanUrl = url
      .replace(/([?&])(v|_t)=\d+(&?)/, (match, prefix, param, suffix) => {
        return suffix ? prefix : "";
      })
      .replace(/[?&]$/, "");

    const separator = cleanUrl.includes("?") ? "&" : "?";
    return `${cleanUrl}${separator}v=${timestamp}`;
  } catch {
    return url;
  }
}
