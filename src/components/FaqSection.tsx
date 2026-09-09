"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useRestaurant } from "@/context/RestaurantDataContext";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export const FaqSection: React.FC = () => {
  const { data } = useRestaurant();
  const faqList = data.faq;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqList || faqList.length === 0) return null;

  const title = data.uiTexts.faqTitle || "الأسئلة الشائعة";
  const subtitle =
    data.uiTexts.faqSubtitle ||
    "كل ما تود معرفته عن خدماتنا، طرق الطلب، وجودة الدجاج الطازج";

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden bg-bg-page border-b border-border-card/60">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 mb-3.5">
            <HelpCircle className="w-3.5 h-3.5" />
            إجابات لاستفساراتكم
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text-main tracking-tight leading-tight mb-4">
            {title}
          </h2>
          <p className="text-text-muted text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="space-y-4"
        >
          {faqList.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className={"rounded-2xl border transition-all duration-300 overflow-hidden " + (
                  isOpen
                    ? "bg-bg-card border-primary/40 shadow-lg shadow-primary/5"
                    : "bg-bg-surface/60 border-border-card hover:border-border-card/90"
                )}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(index)}
                  className="w-full py-5 px-6 flex items-center justify-between text-right gap-4 select-none focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={"w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs transition-colors shrink-0 " + (
                        isOpen
                          ? "bg-primary text-white shadow-sm shadow-primary/20"
                          : "bg-bg-card border border-border-card text-text-muted"
                      )}
                    >
                      {index + 1}
                    </div>
                    <span className="font-bold text-sm sm:text-base text-text-main leading-snug">
                      {item.question}
                    </span>
                  </div>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className={"w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors " + (
                      isOpen
                        ? "bg-primary/10 text-primary"
                        : "bg-bg-card text-text-muted"
                    )}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-1 text-sm text-text-muted leading-relaxed border-t border-border-card/40 mt-1">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};
