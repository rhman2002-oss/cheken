'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'

type TiltCardProps = {
  name: string
  desc: string
  price: string
  image: string
  index: number
}

export function TiltCard({ name, desc, price, image, index }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(my, [0, 1], [10, -10]), {
    stiffness: 150,
    damping: 15,
  })
  const rotateY = useSpring(useTransform(mx, [0, 1], [-10, 10]), {
    stiffness: 150,
    damping: 15,
  })

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set((e.clientX - rect.left) / rect.width)
    my.set((e.clientY - rect.top) / rect.height)
  }

  function handleLeave() {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 40 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: 'easeOut' }}
      style={{ perspective: 1000 }}
      className="group"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-xl"
      >
        {/* glow on hover */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60"
          style={{ background: 'radial-gradient(circle at 50% 30%, var(--fire-orange), transparent 65%)' }}
        />

        <div
          style={{ transform: 'translateZ(50px)' }}
          className="relative mx-auto flex h-44 items-center justify-center"
        >
          <img
            src={image || '/placeholder.svg'}
            alt={name}
            className="h-44 w-auto object-contain drop-shadow-[0_18px_30px_oklch(0.62_0.23_25_/_0.45)] transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div style={{ transform: 'translateZ(35px)' }} className="mt-6 text-center">
          <h3 className="text-2xl font-extrabold text-foreground">{name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{desc}</p>
          <motion.div
            className="mt-4 inline-flex items-baseline gap-1 rounded-full bg-fire-orange/15 px-4 py-1.5 text-fire-orange transition-transform duration-300 group-hover:scale-110"
          >
            <span className="text-2xl font-black">{price}</span>
            <span className="text-sm font-bold">ريال</span>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
