"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Plus,
  Minus,
  Trash2,
  MessageCircle,
  ShoppingBag,
  Tag,
  User,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRestaurant } from "@/context/RestaurantDataContext";
import { useCustomer } from "@/context/CustomerContext";
import {
  formatPrice,
  getDiscountedPrice,
  createCartWhatsAppReceipt,
} from "@/lib/utils";
import { createOrder } from "@/lib/ordersService";
import { Order } from "@/config/restaurant";
import { CheckCircle2, Globe } from "lucide-react";

export const CartModal: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalDiscount,
    finalTotal,
  } = useCart();

  const { data } = useRestaurant();
  const { name: restaurantName, currency, currencyPosition, contact, uiTexts, checkoutMethod = "both" } = data;
  const { customer, login, updateAddress, openAddressModal } = useCustomer();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // مزامنة بيانات الزبون المسجل تلقائياً عند فتح السلة
  useEffect(() => {
    if (customer) {
      if (customer.phone) setCustomerPhone(customer.phone);
      if (customer.address) setCustomerAddress(customer.address);
      if (customer.name && !customerName) setCustomerName(customer.name);
    }
  }, [customer, isCartOpen]);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setSubmittedOrder(null);
      setErrorMessage("");
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleWhatsAppCheckout = () => {
    // حفظ أو تحديث بيانات الزبون تلقائياً
    if (customerPhone.trim() && customerAddress.trim()) {
      if (!customer || customer.phone !== customerPhone.trim() || customer.address !== customerAddress.trim()) {
        login(customerPhone.trim(), customerAddress.trim(), customerName.trim());
      }
    }

    const url = createCartWhatsAppReceipt(contact.whatsappNumber, {
      items,
      customerName,
      customerPhone,
      customerAddress,
      mapsUrl: customer?.location?.mapsUrl,
      notes,
      currency,
      subtotal,
      totalDiscount,
      finalTotal,
      restaurantName,
    });
    window.open(url, "_blank");
  };

  const handleWebsiteCheckout = async () => {
    setErrorMessage("");
    if (!customerName.trim()) {
      setErrorMessage("يرجى كتابة اسمك للمتابعة");
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage("يرجى كتابة رقم هاتفك لتأكيد الطلب");
      return;
    }
    if (!customerAddress.trim() && !customer?.location) {
      setErrorMessage("يرجى تحديد موقع التوصيل على الخريطة لنتمكن من إيصال طلبك بدقة");
      return;
    }

    // حفظ أو تحديث بيانات الزبون تلقائياً
    if (customerPhone.trim() && customerAddress.trim()) {
      if (!customer || customer.phone !== customerPhone.trim() || customer.address !== customerAddress.trim()) {
        login(customerPhone.trim(), customerAddress.trim(), customerName.trim(), customer?.location);
      }
    }

    setIsSubmitting(true);
    try {
      const orderItems = items.map(({ item, quantity }) => ({
        id: item.id,
        name: item.name,
        quantity,
        price: getDiscountedPrice(item),
      }));

      const newOrder = await createOrder({
        items: orderItems,
        totalAmount: finalTotal,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim() || customer?.address || undefined,
        customerLocation: customer?.location || undefined,
        notes: notes.trim() || undefined,
        orderSource: "طلب من الموقع",
      });

      setSubmittedOrder(newOrder);
      clearCart();
    } catch {
      setErrorMessage("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* خلفية الإغلاق عند النقر بالخارج */}
      <div className="absolute inset-0" onClick={closeCart} />

      {/* لوحة السلة المنزلقة */}
      <div className="relative w-full max-w-md bg-surface h-full shadow-2xl z-10 flex flex-col justify-between overflow-hidden animate-in slide-in-from-left rtl:slide-in-from-right duration-300">
        {/* رأس السلة */}
        <div className="p-4 sm:p-5 border-b border-border-subtle flex items-center justify-between bg-surface/95 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-full bg-primary-light text-primary">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-text-main">
                {uiTexts.cartTitle}
              </h2>
              <span className="text-xs text-text-muted">
                {items.length} {uiTexts.itemsCount}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                title={uiTexts.clearCart}
                className="p-2 rounded-btn text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors text-xs flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">{uiTexts.clearCart}</span>
              </button>
            )}
            <button
              type="button"
              onClick={closeCart}
              aria-label={uiTexts.closeModal}
              className="p-2 rounded-full bg-bg-page hover:bg-border-subtle text-text-main transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* محتوى السلة وقائمة الأصناف */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {submittedOrder ? (
            /* شاشة نجاح إرسال الطلب عبر الموقع */
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-2 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-md">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary-light text-primary mb-2">
                تم استلام طلبك بنجاح 🎉
              </span>

              <h3 className="text-xl sm:text-2xl font-black text-text-main mb-1">
                رقم الطلب: #{submittedOrder.orderNumber}
              </h3>

              <p className="text-xs sm:text-sm text-text-muted max-w-xs mt-2 leading-relaxed">
                شكراً لك يا <b>{submittedOrder.customerName || customerName}</b>، تم إرسال طلبك مباشرة للمطبخ وجاري مراجعته وتجهيزه.
              </p>

              <div className="mt-6 w-full max-w-xs p-3.5 rounded-card bg-bg-page border border-border-subtle text-xs text-text-muted space-y-1 text-start">
                <div className="flex justify-between">
                  <span>المبلغ الإجمالي:</span>
                  <span className="font-bold text-text-main">
                    {formatPrice(submittedOrder.totalAmount, currency, currencyPosition)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>طريقة الطلب:</span>
                  <span className="font-semibold text-primary">{submittedOrder.orderSource || "طلب مباشر من الموقع 🌐"}</span>
                </div>
                {(submittedOrder.customerAddress || customerAddress) && (
                  <div className="flex justify-between pt-1 border-t border-border-subtle">
                    <span>العنوان:</span>
                    <span className="font-medium text-text-main">{submittedOrder.customerAddress || customerAddress}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmittedOrder(null);
                  closeCart();
                }}
                className="mt-6 w-full max-w-xs min-h-[44px] px-6 py-2.5 rounded-btn bg-primary text-white text-xs sm:text-sm font-bold shadow-md hover:bg-primary-hover transition-colors"
              >
                حسناً، متابعة التصفح
              </button>
            </div>
          ) : items.length > 0 ? (
            <>
              {/* قائمة وجبات السلة */}
              <div className="space-y-3">
                {items.map(({ item, quantity }) => {
                  const unitPrice = getDiscountedPrice(item);
                  const itemTotal = unitPrice * quantity;
                  const hasDiscount = item.discount?.active && item.discount.value > 0;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-card bg-bg-page border border-border-subtle/80"
                    >
                      {/* صورة الصنف المصغرة */}
                      <div className="relative w-16 h-16 rounded-badge overflow-hidden shrink-0 bg-surface">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>

                      {/* معلومات الصنف والكمية */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-text-main truncate">
                          {item.name}
                        </h4>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-extrabold text-primary">
                            {formatPrice(unitPrice, currency, currencyPosition)}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] text-text-muted line-through">
                              {formatPrice(item.price, currency, currencyPosition)}
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-text-muted mt-1">
                          الإجمالي: {formatPrice(itemTotal, currency, currencyPosition)}
                        </div>
                      </div>

                      {/* أزرار زيادة ونقصان الكمية */}
                      <div className="flex items-center gap-1 bg-surface p-1 rounded-btn border border-border-subtle shrink-0">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg-page text-text-main transition-colors"
                          aria-label="نقصان الكمية"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <span className="w-6 text-center text-xs font-bold text-text-main">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-bg-page text-text-main transition-colors"
                          aria-label="زيادة الكمية"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* بيانات العميل لتأكيد الطلب */}
              <div className="pt-3 border-t border-border-subtle space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-text-main">بيانات التوصيل والتواصل:</h4>
                  {customer && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span>✓ تم استرجاع بياناتك تلقائياً</span>
                    </span>
                  )}
                </div>

                <div className="space-y-2.5">
                  {/* الاسم */}
                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted mb-1">
                      {uiTexts.customerNameLabel} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute start-3 text-text-muted pointer-events-none">
                        <User className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={uiTexts.customerNamePlaceholder}
                        className="w-full ps-9 pe-3 py-2.5 rounded-input bg-surface border border-border-subtle text-xs text-text-main focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>

                  {/* الهاتف */}
                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted mb-1">
                      {uiTexts.customerPhoneLabel} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute start-3 text-text-muted pointer-events-none">
                        <Phone className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder={uiTexts.customerPhonePlaceholder}
                        className="w-full ps-9 pe-3 py-2.5 rounded-input bg-surface border border-border-subtle text-xs text-text-main focus:ring-2 focus:ring-primary/20 outline-none dir-ltr text-right"
                      />
                    </div>
                  </div>

                  {/* العنوان أو رقم الطاولة */}
                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted mb-1">
                      {uiTexts.customerAddressLabel}
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute start-3 text-text-muted pointer-events-none">
                        <MapPin className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="text"
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder={uiTexts.customerAddressPlaceholder}
                        className="w-full ps-9 pe-3 py-2.5 rounded-input bg-surface border border-border-subtle text-xs text-text-main focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={openAddressModal}
                      className="mt-1.5 w-full py-1.5 px-3 rounded-btn bg-primary-light text-primary hover:bg-primary hover:text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors border border-primary/20"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{customer?.location ? "تعديل موقع التوصيل على الخريطة 🗺️" : "تحديد الموقع بدقة عبر الخارطة وGPS 📍"}</span>
                    </button>
                  </div>

                  {/* الملاحظات */}
                  <div>
                    <label className="block text-[11px] font-semibold text-text-muted mb-1">
                      {uiTexts.notesLabel}
                    </label>
                    <div className="relative flex items-start">
                      <span className="absolute start-3 top-3 text-text-muted pointer-events-none">
                        <FileText className="w-3.5 h-3.5" />
                      </span>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={uiTexts.notesPlaceholder}
                        className="w-full ps-9 pe-3 py-2 rounded-input bg-surface border border-border-subtle text-xs text-text-main focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* السلة فارغة */
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="p-4 rounded-full bg-primary-light text-primary mb-3">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h3 className="font-bold text-base text-text-main mb-1">
                {uiTexts.emptyCart}
              </h3>
              <p className="text-xs text-text-muted max-w-xs mb-6">
                {uiTexts.emptyCartDesc}
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="px-6 py-2.5 rounded-btn bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary-hover transition-colors"
              >
                تصفح قائمة الطعام
              </button>
            </div>
          )}
        </div>

        {/* ملخص الفاتورة وأزرار إتمام الطلب بناءً على checkoutMethod */}
        {items.length > 0 && !submittedOrder && (
          <div className="p-4 sm:p-5 border-t border-border-subtle bg-surface shadow-lg space-y-3 shrink-0">
            {/* تفصيل الحساب */}
            <div className="space-y-1.5 text-xs text-text-muted">
              <div className="flex justify-between">
                <span>{uiTexts.subtotal}</span>
                <span className="font-semibold text-text-main">
                  {formatPrice(subtotal, currency, currencyPosition)}
                </span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{uiTexts.totalDiscount}</span>
                  </span>
                  <span>
                    -{formatPrice(totalDiscount, currency, currencyPosition)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm sm:text-base font-black text-text-main pt-2 border-t border-border-subtle">
                <span>{uiTexts.totalPrice}</span>
                <span className="text-primary text-base sm:text-lg">
                  {formatPrice(finalTotal, currency, currencyPosition)}
                </span>
              </div>
            </div>

            {/* رسالة تنبيه الخطأ إن وُجدت */}
            {errorMessage && (
              <div className="p-2 rounded-btn bg-red-50 text-red-600 border border-red-200 text-xs text-center font-bold animate-in fade-in">
                {errorMessage}
              </div>
            )}

            {/* أزرار الطلب بناءً على checkoutMethod */}
            <div className="space-y-2 pt-1">
              {/* 1. عند اختيار website فقط */}
              {checkoutMethod === "website" && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleWebsiteCheckout}
                  className="w-full min-h-[52px] py-3.5 px-4 rounded-btn bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Globe className="w-5 h-5 shrink-0" />
                  <span>{isSubmitting ? "جاري إرسال الطلب..." : "إتمام الطلب الآن (عبر الموقع)"}</span>
                </button>
              )}

              {/* 2. عند اختيار whatsapp فقط */}
              {checkoutMethod === "whatsapp" && (
                <button
                  type="button"
                  onClick={handleWhatsAppCheckout}
                  className="w-full min-h-[52px] py-3.5 px-4 rounded-btn bg-whatsapp hover:bg-whatsapp-hover text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current shrink-0" />
                  <span>{uiTexts.checkoutViaWhatsApp}</span>
                </button>
              )}

              {/* 3. عند اختيار both (الخياران متاحان معاً للزبون) */}
              {(!checkoutMethod || checkoutMethod === "both") && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleWebsiteCheckout}
                    className="flex-1 min-h-[48px] py-3 px-3 rounded-btn bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <span>{isSubmitting ? "جاري الإرسال..." : "اطلب عبر الموقع"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsAppCheckout}
                    className="flex-1 min-h-[48px] py-3 px-3 rounded-btn bg-whatsapp hover:bg-whatsapp-hover text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current shrink-0" />
                    <span>اطلب عبر واتساب</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
