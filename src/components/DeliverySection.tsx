"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import { Clock, MapPin, ShoppingBag, ShieldCheck } from "lucide-react";
import { useRestaurant, useOrderMode } from "@/context/RestaurantDataContext";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export const DeliverySection: React.FC = () => {
  const { data } = useRestaurant();
  const { isDelivery } = useOrderMode();
  const info = data.deliveryInfo;

  if (!isDelivery || !info) return null;

  const title = data.uiTexts.deliveryTitle || "توصيل سريع وساخن حتى باب بيتك";
  const subtitle =
    data.uiTexts.deliverySubtitle ||
    "نضمن لك وصول وجباتك المفضلة طازجة وبأعلى درجات القرمشة والحرارة أينما كنت";

  const features = [
    {
      id: "time",
      icon: <Clock className="w-8 h-8 text-primary" />,
      label: "الوقت التقديري للتوصيل",
      value: info.estimatedTime,
      tag: "سرعة فائقة ⚡",
    },
    {
      id: "coverage",
      icon: <MapPin className="w-8 h-8 text-primary" />,
      label: "مناطق التغطية",
      value: info.coverage,
      tag: "تغطية شاملة 📍",
    },
    {
      id: "minOrder",
      icon: <ShoppingBag className="w-8 h-8 text-primary" />,
      label: "الحد الأدنى للطلب",
      value: info.minOrder || "لا يوجد حد أدنى",
      tag: "مرونة كاملة 🛍️",
    },
  ];

  return (
    <section className="py-20 px-4 relative overflow-hidden bg-bg-surface/50 border-y border-border-card/60">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-3.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            خدمة التوصيل السريع
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-main tracking-tight leading-tight mb-4">
            {title}
          </h2>
          <p className="text-text-muted text-sm sm:text-base leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feat) => (
            <motion.div
              key={feat.id}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="group relative p-6 sm:p-7 rounded-2xl bg-bg-card border border-border-card/70 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="w-16 h-16 rounded-2xl bg-bg-surface border border-border-card flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
                {feat.icon}
              </div>

              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-bg-surface text-primary border border-primary/15 mb-2">
                {feat.tag}
              </span>

              <p className="text-xs font-semibold text-text-muted mb-1">
                {feat.label}
              </p>

              <h3 className="text-lg sm:text-xl font-black text-text-main group-hover:text-primary transition-colors">
                {feat.value}
              </h3>
            </motion.div>
          ))}
        </motion.div>

        {info.note && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 p-4 sm:p-5 rounded-2xl bg-primary/10 border border-primary/25 flex flex-col sm:flex-row items-center justify-center gap-3.5 text-center sm:text-right"
          >
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-text-main leading-relaxed">
              <span className="text-primary font-black ml-1">ملاحظة مهمة:</span>
              {info.note}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};
