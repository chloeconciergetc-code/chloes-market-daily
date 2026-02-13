import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export function SectionWrapper({ id, children, className = '' }: {
  id: string
  children: ReactNode
  className?: string
}) {
  return (
    <motion.section
      id={id}
      className={`scroll-mt-14 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-5%' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.section>
  )
}
