'use client'

import { motion } from 'framer-motion'
import { SplitText } from '@/components/split-text'

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
    </svg>
  )
}

export function FinalCta() {
  return (
    <section id="order" className="relative isolate overflow-hidden px-6 py-32">
      {/* Animated fire gradient full bleed */}
      <div className="animate-gradient absolute inset-0 -z-20 bg-gradient-to-tl from-fire-red via-fire-orange to-fire-yellow" />
      {/* Vignette: darkens edges for legibility, keeps the fire glowing at center */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, oklch(0.16 0.02 45 / 0.35) 55%, oklch(0.16 0.02 45 / 0.8) 100%)',
        }}
      />
      <div className="grid-overlay pointer-events-none absolute inset-0 -z-10 opacity-60" />

      {/* Light streaks */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <span className="animate-streak absolute top-1/4 h-40 w-24 bg-white/20 blur-2xl" />
        <span
          className="animate-streak absolute top-2/3 h-40 w-24 bg-white/15 blur-2xl"
          style={{ animationDelay: '3.5s' }}
        />
      </div>

      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 className="text-5xl font-black leading-tight text-foreground drop-shadow-lg sm:text-6xl md:text-7xl">
          <SplitText text="جوعان؟ اطلب الحين" stagger={0.1} />
        </h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 max-w-lg text-pretty text-lg font-medium text-foreground/80"
        >
          توصيل سريع لباب بيتك. اطلب عبر الواتساب ووجبتك في الطريق خلال دقائق.
        </motion.p>

        {/* Glowing rotating border button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="relative mt-12"
        >
          <div className="relative overflow-hidden rounded-full p-[3px]">
            <div className="animate-border-spin absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent,var(--fire-yellow),transparent_30%)]" />
            <motion.a
              href="https://wa.me/966500000000"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="relative flex items-center gap-3 rounded-full bg-background px-10 py-5 text-lg font-extrabold text-foreground"
            >
              <WhatsAppIcon className="h-6 w-6 text-fire-yellow" />
              اطلب عبر الواتساب
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
