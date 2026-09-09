'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type Particle = {
  id: number
  left: number
  size: number
  delay: number
  duration: number
  drift: number
}

export function Particles({ count = 24 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    setParticles(
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 3 + Math.random() * 6,
        delay: Math.random() * 6,
        duration: 6 + Math.random() * 8,
        drift: (Math.random() - 0.5) * 60,
      })),
    )
  }, [count])

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-fire-orange/70 blur-[1px]"
          style={{
            left: `${p.left}%`,
            bottom: -20,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -320 - Math.random() * 160],
            x: [0, p.drift],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}
