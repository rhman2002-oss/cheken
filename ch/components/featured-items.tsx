'use client'

import { motion } from 'framer-motion'
import { TiltCard } from '@/components/tilt-card'

const items = [
  {
    name: 'أجنحة نارية',
    desc: 'أجنحة دجاج متبلة بصلصة حارة تلمع، تشعل حماس السهرة من أول قضمة.',
    price: '24',
    image: '/item-wings.png',
  },
  {
    name: 'ستربس مقرمشة',
    desc: 'قطع صدر دجاج طرية من الداخل، مقرمشة ذهبية من الخارج مع صوص خاص.',
    price: '19',
    image: '/item-tenders.png',
  },
  {
    name: 'وجبة الكومبو',
    desc: 'دجاج مقلي + بطاطس مقرمشة + مشروب، وجبة كاملة تكفي جوعك وتزيد.',
    price: '32',
    image: '/item-meal.png',
  },
]

export function FeaturedItems() {
  return (
    <section id="menu" className="relative px-6 py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-fire-orange">
            المنيو
          </span>
          <h2 className="mt-3 text-4xl font-black text-foreground sm:text-5xl md:text-6xl">
            الأصناف المميزة
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
            كل صنف محضّر طازج على الطلب — حرّك الماوس فوق البطاقات وشوف الفرق.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item, i) => (
            <TiltCard key={item.name} index={i} {...item} />
          ))}
        </div>
      </div>
    </section>
  )
}
