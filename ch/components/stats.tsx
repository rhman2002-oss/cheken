'use client'

import { motion } from 'framer-motion'
import { Drumstick, Smile, Star, Timer } from 'lucide-react'
import { CountUp } from '@/components/count-up'

const stats = [
  { icon: Drumstick, to: 120, suffix: 'K+', label: 'وجبة تم تقديمها' },
  { icon: Smile, to: 45, suffix: 'K+', label: 'عميل سعيد' },
  { icon: Star, to: 4, suffix: '.9', label: 'تقييم العملاء' },
  { icon: Timer, to: 20, suffix: ' دق', label: 'متوسط التوصيل' },
]

export function Stats() {
  return (
    <section className="relative px-6 py-24">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{
                  duration: 2.4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'easeInOut',
                  delay: i * 0.2,
                }}
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-fire-orange/15 text-fire-orange"
              >
                <Icon className="h-7 w-7" />
              </motion.div>
              <div className="text-4xl font-black text-foreground drop-shadow-[0_0_20px_oklch(0.74_0.19_55_/_0.5)] sm:text-5xl">
                <CountUp to={stat.to} suffix={stat.suffix} />
              </div>
              <div className="mt-2 text-sm font-medium text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
