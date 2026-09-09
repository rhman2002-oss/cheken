'use client'

import { motion } from 'framer-motion'

type Blob = {
  className: string
  color: string
  x: number[]
  y: number[]
  scale: number[]
  duration: number
}

const blobs: Blob[] = [
  {
    className: 'top-[-10%] right-[-5%] h-[38rem] w-[38rem]',
    color: 'var(--fire-red)',
    x: [0, -40, 20, 0],
    y: [0, 30, -20, 0],
    scale: [1, 1.15, 0.95, 1],
    duration: 16,
  },
  {
    className: 'bottom-[-15%] left-[-8%] h-[34rem] w-[34rem]',
    color: 'var(--fire-orange)',
    x: [0, 50, -30, 0],
    y: [0, -40, 25, 0],
    scale: [1, 0.9, 1.2, 1],
    duration: 20,
  },
  {
    className: 'top-[30%] left-[35%] h-[26rem] w-[26rem]',
    color: 'var(--fire-yellow)',
    x: [0, -30, 40, 0],
    y: [0, 40, -30, 0],
    scale: [1, 1.1, 0.85, 1],
    duration: 24,
  },
]

export function AnimatedBlobs({ opacity = 0.45 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full blur-[120px] ${blob.className}`}
          style={{ backgroundColor: blob.color, opacity }}
          animate={{ x: blob.x, y: blob.y, scale: blob.scale }}
          transition={{
            duration: blob.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}
