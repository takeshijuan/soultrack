'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { SoultrackIcon } from '@/components/SoultrackLogo'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
}

const fadeBlur = {
  hidden: { opacity: 0, filter: 'blur(10px)' },
  show: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.9, ease: EASE } },
}

export default function EmptyLibrary() {
  const shouldReduceMotion = useReducedMotion()
  const t = useTranslations('library')

  return (
    <motion.div
      className="text-center py-24 flex flex-col items-center"
      variants={container}
      initial={shouldReduceMotion ? 'show' : 'hidden'}
      animate="show"
    >
      {/* S-wave icon with teal glow */}
      <motion.div variants={fadeBlur} className="mb-8 relative">
        <div className="absolute inset-0 rounded-full blur-2xl bg-[var(--accent-teal)] opacity-20" />
        <div
          className="relative w-20 h-20 rounded-full border border-white/10 flex items-center justify-center"
          style={{ background: 'var(--surface-1)' }}
        >
          <SoultrackIcon size={36} className="text-[var(--accent-teal)]" />
        </div>
      </motion.div>

      <motion.h2
        variants={fadeBlur}
        className="font-display font-bold text-2xl text-[var(--text-primary)] mb-3"
      >
        {t('emptyTitle')}
      </motion.h2>

      <motion.p
        variants={fadeBlur}
        className="text-[var(--text-muted)] text-sm max-w-xs mb-10 leading-relaxed"
      >
        {t('emptySubtext')}
      </motion.p>

      <motion.div variants={fadeBlur}>
        <Link
          href="/create"
          className="group inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm
                     bg-[var(--accent-teal)] text-black
                     transition-all duration-300
                     hover:bg-white hover:shadow-[0_0_50px_rgba(0,245,212,0.5)]"
        >
          <span>{t('emptyAction')}</span>
          <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
        </Link>
      </motion.div>
    </motion.div>
  )
}
