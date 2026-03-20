'use client'
import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

const EASE = [0.25, 0.46, 0.45, 0.94] as const

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
}

const fadeBlur = {
  hidden: { opacity: 0, filter: 'blur(10px)' },
  show: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.9, ease: EASE } }
}

const titleVariant = {
  hidden: { opacity: 0, scale: 0.96, filter: 'blur(6px)' },
  show: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE } }
}

export default function HeroContent() {
  const shouldReduceMotion = useReducedMotion()
  const t = useTranslations('hero')

  return (
    <motion.div
      className="ambient-content text-center w-full max-w-2xl mx-auto"
      variants={container}
      initial={shouldReduceMotion ? 'show' : 'hidden'}
      animate="show"
    >
      <motion.p
        variants={fadeBlur}
        className="text-xs tracking-[0.3em] text-[var(--text-muted)] uppercase mb-8 font-medium"
      >
        {t('eyebrow')}
      </motion.p>

      <motion.h1
        variants={titleVariant}
        className="font-display font-bold leading-[0.88] tracking-tight text-[var(--text-primary)] mb-8"
        style={{ fontSize: 'clamp(5rem, 16vw, 10rem)' }}
      >
        SOUL<br />TRACK
      </motion.h1>

      <motion.p
        variants={fadeBlur}
        className="text-[var(--text-muted)] text-xl font-light mb-14 tracking-wide"
      >
        {t('tagline')}
      </motion.p>

      <motion.div variants={fadeBlur}>
        <Link
          href="/create"
          className="group inline-flex items-center gap-3 px-10 py-4 rounded-full font-semibold text-base
                     bg-[var(--accent-teal)] text-black
                     transition-all duration-300
                     hover:bg-white hover:shadow-[0_0_50px_rgba(0,245,212,0.5)]"
        >
          <span>{t('cta')}</span>
          <span className="group-hover:translate-x-1.5 transition-transform duration-200 text-lg">→</span>
        </Link>
      </motion.div>

      <motion.p
        variants={fadeBlur}
        className="mt-6 text-[var(--text-muted)] text-sm tracking-widest"
      >
        {t('hint')}
      </motion.p>
    </motion.div>
  )
}
