'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Particles } from '@/components/particles'

export function Spotlight() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [80, -80])
  const rotate = useTransform(scrollYProgress, [0, 1], [-8, 8])

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden px-6 py-28"
    >
      <Particles count={26} />

      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        {/* Text - slide + blur to focus */}
        <motion.div
          initial={{ opacity: 0, x: 60, filter: 'blur(14px)' }}
          whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="order-2 text-center md:order-1 md:text-right"
        >
          <span className="inline-block rounded-full bg-fire-red/15 px-4 py-1.5 text-sm font-bold text-fire-red">
            الأكثر طلباً · رقم ١
          </span>
          <h2 className="mt-5 text-4xl font-black leading-tight text-foreground sm:text-5xl md:text-6xl">
            برجر الوحش
            <span className="block bg-gradient-to-l from-fire-yellow to-fire-red bg-clip-text text-transparent">
              المقرمش
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-md text-pretty leading-relaxed text-muted-foreground md:mx-0">
            طبقتين من الدجاج المقلي المقرمش، جبن ذائب، وصوصنا السري الحار.
            لقمة واحدة وبتفهم ليش هو نجم المنيو بلا منافس.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 md:justify-start">
            <span className="text-4xl font-black text-fire-orange">38 ريال</span>
            <motion.a
              href="#order"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-full border border-fire-orange/40 bg-fire-orange/10 px-6 py-3 font-bold text-fire-orange"
            >
              جربه الحين
            </motion.a>
          </div>
        </motion.div>

        {/* Floating rotating image */}
        <div className="order-1 flex items-center justify-center md:order-2">
          <motion.img
            src="/spotlight-burger.png"
            alt="برجر الوحش المقرمش — الأكثر طلباً"
            style={{ y, rotate }}
            className="w-72 max-w-full drop-shadow-[0_40px_70px_oklch(0.62_0.23_25_/_0.5)] sm:w-96"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </section>
  )
}
