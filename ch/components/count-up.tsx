'use client'

import { animate, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

type CountUpProps = {
  to: number
  duration?: number
  suffix?: string
  prefix?: string
}

export function CountUp({ to, duration = 2, suffix = '', prefix = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setValue(latest),
    })
    return () => controls.stop()
  }, [inView, to, duration])

  return (
    <span ref={ref}>
      {prefix}
      {Math.round(value).toLocaleString('en-US')}
      {suffix}
    </span>
  )
}
