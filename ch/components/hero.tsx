'use client'

import { motion } from 'framer-motion'
import { ArrowDown, Flame } from 'lucide-react'
import { AnimatedBlobs } from '@/components/animated-blobs'
import { SplitText } from '@/components/split-text'

export function Hero() {
  return (
    <section className="relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-28">
      <AnimatedBlobs opacity={0.5} />
      <div className="grid-overlay pointer-events-none absolute inset-0 -z-10 opacity-40" />

      {/* Brand pill */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 flex items-center gap-2 rounded-full border border-fire-orange/30 bg-fire-orange/10 px-5 py-2 text-sm font-semibold text-fire-orange backdrop-blur-sm"
      >
        <Flame className="h-4 w-4" />
        <span>مقرمش • طازج • نار</span>
      </motion.div>

      {/* Massive title */}
      <h1 className="text-center text-6xl font-black leading-[0.95] tracking-tight sm:text-7xl md:text-8xl lg:text-9xl">
        <SplitText
          text="جكن اكسبريس"
          as="span"
          className="block bg-gradient-to-b from-fire-yellow via-fire-orange to-fire-red bg-clip-text text-transparent drop-shadow-[0_0_40px_oklch(0.7_0.2_45_/_0.4)]"
          stagger={0.12}
        />
      </h1>

      <SplitText
        text="طعم يستاهل السهرة"
        as="p"
        delay={0.5}
        stagger={0.06}
        className="mt-6 block text-center text-xl font-semibold text-muted-foreground sm:text-2xl md:text-3xl"
      />

      {/* Floating hero image with dynamic shadow */}
      <div className="relative mt-10 flex items-center justify-center">
        <motion.div
          aria-hidden
          className="absolute bottom-2 h-6 w-52 rounded-[100%] bg-black/60 blur-2xl sm:w-72"
          animate={{ scaleX: [1, 0.8, 1], opacity: [0.6, 0.35, 0.6] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        />
        <motion.img
          src="/hero-chicken.png"
          alt="وجبة دجاج مقلي مقرمش من جكن اكسبريس"
          className="relative w-64 max-w-full drop-shadow-[0_30px_60px_oklch(0.62_0.23_25_/_0.5)] sm:w-80 md:w-[26rem]"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1, y: [0, -18, 0] }}
          transition={{
            opacity: { duration: 0.8, delay: 0.4 },
            scale: { duration: 0.8, delay: 0.4 },
            y: { duration: 5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' },
          }}
        />
      </div>

      {/* Pulsing glow CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="relative mt-10"
      >
        <motion.span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full bg-fire-orange blur-2xl"
          animate={{ opacity: [0.4, 0.85, 0.4], scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        />
        <motion.a
          href="#menu"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-3 rounded-full bg-gradient-to-l from-fire-red via-fire-orange to-fire-yellow px-10 py-5 text-lg font-extrabold text-background shadow-lg transition-colors"
        >
          <Flame className="h-5 w-5" />
          اطلب الآن
        </motion.a>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        className="mt-16 flex flex-col items-center gap-2 text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
      >
        <span className="text-sm font-medium">مرر للأسفل</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
        >
          <ArrowDown className="h-5 w-5 text-fire-orange" />
        </motion.div>
      </motion.div>
    </section>
  )
}
