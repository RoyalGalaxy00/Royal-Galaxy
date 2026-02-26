"use client"
import React from 'react'
import Link from 'next/link'

// ── Types & Variants ───────────────────────────────────────────────────────
type BtnVariant = 'light' | 'solid' | 'outline'

interface HotelButtonProps {
  href: string
  children: React.ReactNode
  variant?: BtnVariant
  aosDir?: 'fade-up' | 'fade-right' | 'fade-left' | 'fade-down'
  aosDelay?: number
}

const variantStyles: Record<BtnVariant, { wrapper: string; arrow: string }> = {
  light: {
    wrapper: 'bg-[#f2ede1] text-[#0a7a7b] hover:bg-[#e8e0d0]',
    arrow: 'text-[#0a7a7b]',
  },
  solid: {
    wrapper: 'bg-[#0a7a7b] text-[#f2ede1] hover:bg-[#085e5f]',
    arrow: 'text-[#f2ede1]',
  },
  outline: {
    wrapper:
      'bg-transparent border border-[rgba(242,237,225,0.28)] text-[rgba(242,237,225,0.82)] hover:border-[rgba(242,237,225,0.65)] hover:bg-white/5',
    arrow: 'text-[rgba(242,237,225,0.82)]',
  },
}

// ── Shared Style Tokens ────────────────────────────────────────────────────
const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-exo2)',
  fontWeight: 500,
  letterSpacing: '0.32em',
  textTransform: 'uppercase',
  fontSize: '11px',
  lineHeight: '20px',
}

// ── HotelButton ────────────────────────────────────────────────────────────
function HotelButton({
  href,
  children,
  variant = 'solid',
  aosDir,
  aosDelay,
}: HotelButtonProps) {
  const v = variantStyles[variant]
  return (
    <div
      {...(aosDir ? { 'data-aos': aosDir } : {})}
      {...(aosDelay !== undefined ? { 'data-aos-delay': aosDelay } : {})}
    >
      <Link href={href}>
        <span
          className={`
            group
            inline-flex items-center gap-0
            px-9 py-3
            uppercase
            transition-all duration-300 ease-in-out
            cursor-pointer select-none
            ${v.wrapper}
          `}
          style={{
            fontFamily: 'var(--font-exo2)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.24em',
          }}
        >
          {/* Label — slides left slightly on hover to make room for arrow */}
          <span className="transition-transform duration-300 ease-in-out group-hover:-translate-x-1">
            {children}
          </span>

          {/* Arrow — hidden by default, slides in on hover */}
          <span
            className={`
              overflow-hidden
              w-0 opacity-0
              group-hover:w-5 group-hover:opacity-100 group-hover:ml-2
              transition-all duration-300 ease-in-out
              font-light
              ${v.arrow}
            `}
            style={{ fontSize: '15px', lineHeight: 1 }}
            aria-hidden="true"
          >
            ›
          </span>
        </span>
      </Link>
    </div>
  )
}

// ── CTA Component ──────────────────────────────────────────────────────────
const CTA = () => {
  return (
    <section className="bg-[#1a2e2e] px-4 sm:px-8 py-16 md:py-20 text-center">

      {/* Eyebrow */}
      <p
        data-aos="fade-down"
        style={{ ...eyebrow, color: 'rgba(221,211,188,0.60)' }}
        className="mb-4"
      >
        Reserve Your Stay
      </p>

      {/* Heading */}
      <h2
        data-aos="fade-up"
        data-aos-delay="100"
        style={{
          fontFamily: 'var(--font-exo2)',
          fontWeight: 300,
          fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
          color: 'rgb(221,211,188)',
          lineHeight: '1.3',
          letterSpacing: '0.04em',
        }}
        className="mb-10 mx-auto max-w-2xl"
      >
        Ready for an{' '}
        <span style={{ fontWeight: 600 }}>Unforgettable</span>{' '}
        Experience?
      </h2>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <HotelButton href="/book" variant="solid" aosDir="fade-right" aosDelay={200}>
          Book Your Room
        </HotelButton>
        <HotelButton href="/contact" variant="outline" aosDir="fade-left" aosDelay={200}>
          Ask Us Anything
        </HotelButton>
      </div>

    </section>
  )
}

export default CTA