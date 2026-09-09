'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type SplitTextProps = {
  text: string
  className?: string
  delay?: number
  stagger?: number
  as?: 'h1' | 'h2' | 'span' | 'p'
}

export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.08,
  as = 'span',
}: SplitTextProps) {
  const words = text.split(' ')
  const MotionTag = motion[as] as typeof motion.span

  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block overflow-hidden pb-[0.12em] align-bottom"
          aria-hidden
        >
          <Word>{word}</Word>
          {i < words.length - 1 ? '\u00A0' : ''}
        </span>
      ))}
    </MotionTag>
  )
}

function Word({ children }: { children: ReactNode }) {
  return (
    <motion.span
      className="inline-block"
      variants={{
        hidden: { y: '110%', opacity: 0, rotate: 6 },
        visible: {
          y: '0%',
          opacity: 1,
          rotate: 0,
          transition: { type: 'spring', damping: 14, stiffness: 140 },
        },
      }}
    >
      {children}
    </motion.span>
  )
}
