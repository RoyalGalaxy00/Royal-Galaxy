"use client"
import React from 'react'
import { Exo_2 } from 'next/font/google'
import AOSInit from '@/components/ui/AOS'
import Link from 'next/link'
import Image from 'next/image'
import CTA from '@/components/ui/CTA'
import { Nearby } from '@/components/ui/nearby'
import HotelButton from '@/components/ui/HotelButton'
// ── Font ───────────────────────────────────────────────────────────────────
const exo2 = Exo_2({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-exo2',
})

// ── Shared style tokens ────────────────────────────────────────────────────
const body = {
  fontFamily: 'var(--font-exo2)',
  fontWeight: 400,
  color: 'rgb(39, 39, 39)',
} as const

const eyebrow: React.CSSProperties = {
  fontFamily: 'var(--font-exo2)',
  fontWeight: 500,
  letterSpacing: '0.32em',
  textTransform: 'uppercase',
  fontSize: '11px',
  lineHeight: '20px',
}



// ── Component ──────────────────────────────────────────────────────────────
const RoyalGalaxy = () => {
  return (
    <>
      <AOSInit />
      <main className={`${exo2.variable} bg-[#f2ede1] min-h-screen flex flex-col`}>

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section
          className="relative bg-[#0a7a7b] flex flex-col items-center justify-center text-center text-white px-4 sm:px-8 overflow-hidden"
          style={{ minHeight: '110vh' }}
        >
          {/* Subtle line texture */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,1) 3px,rgba(255,255,255,1) 4px)',
            }}
          />

          {/* Top ornament */}
          <div data-aos="fade-down" data-aos-delay="0" className="flex flex-col items-center mb-7">
            <div className="w-px h-10 bg-white/25 mb-3" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-white/35" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/55" />
              <div className="w-8 h-px bg-white/35" />
            </div>
          </div>

          {/* Eyebrow */}
          <p
            data-aos="fade-down"
            data-aos-delay="100"
            style={{ ...eyebrow, color: 'rgba(255,255,255,0.60)' }}
            className="mb-5"
          >
            The Hotel
          </p>

          {/* Main title — single h1 */}
          <h1
            data-aos="fade-down"
            data-aos-delay="200"
            className="px-4 mb-1"
            style={{
              fontFamily: 'var(--font-exo2)',
              fontWeight: 300,
              fontSize: 'clamp(2.6rem, 6.5vw, 78px)',
              lineHeight: 'clamp(3rem, 7.5vw, 90px)',
              color: 'rgb(230, 221, 202)',
              letterSpacing: '0.06em',
            }}
          >
            The Royal Galaxy Hotel
          </h1>

          {/* & Lodge */}
          <p
            data-aos="fade-down"
            data-aos-delay="260"
            style={{
              fontFamily: 'var(--font-exo2)',
              fontWeight: 300,
              fontStyle: 'italic',
              fontSize: 'clamp(1.8rem, 4.5vw, 56px)',
              lineHeight: 'clamp(2.4rem, 5.5vw, 68px)',
              color: 'rgba(230,221,202,0.72)',
              letterSpacing: '0.06em',
            }}
            className="px-4 mb-0"
          >
            &amp; Lodge
          </p>

          {/* Divider */}
          <div
            data-aos="fade-down"
            data-aos-delay="320"
            className="flex items-center gap-4 my-7"
          >
            <div className="w-14 h-px bg-white/25" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/45" />
            <div className="w-14 h-px bg-white/25" />
          </div>

          {/* Subheading */}
          <p
            data-aos="fade-up"
            data-aos-delay="360"
            className="max-w-xs sm:max-w-md lg:max-w-lg mb-10 px-4"
            style={{
              ...body,
              color: 'rgba(255,255,255,0.75)',
              fontSize: 'clamp(14px, 1.6vw, 16px)',
              lineHeight: '1.85',
              letterSpacing: '0.02em',
            }}
          >
            A unique hotel experience in the heart of Chitwan
          </p>

          {/* CTA */}
          <HotelButton href="/book" variant="light" aosDir="fade-up" aosDelay={440}>
            Book a Stay
          </HotelButton>

          {/* Bottom Curve */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg
              viewBox="0 0 1440 80"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f2ede1" />
            </svg>
          </div>
        </section>

        {/* ── ABOUT ─────────────────────────────────────────────────────── */}
        <section className="bg-white w-[95%] sm:w-[90%] mx-auto my-10 md:my-16 px-6 sm:px-12 py-14 md:py-20 shadow-sm">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">

            <div data-aos="fade-right" data-aos-delay="0">
              <p style={{ ...eyebrow, color: '#0a7a7b' }} className="mb-3">About Us</p>
              <h2
                style={{
                  fontFamily: 'var(--font-exo2)',
                  fontWeight: 300,
                  fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                  lineHeight: '1.25',
                  letterSpacing: '0.04em',
                  color: '#1a2e2e',
                }}
                className="mb-5"
              >
                The Hotel{' '}
                <span style={{ color: '#0a7a7b', fontWeight: 600 }}>Royal Galaxy</span>
              </h2>
              <p
                style={{
                  ...body,
                  fontSize: 'clamp(14px, 1.5vw, 16px)',
                  lineHeight: '1.85',
                  color: 'rgb(75,75,75)',
                }}
              >
                Nestled in the heart of Sauraha, our hotel is your gateway to Chitwan National Park and
                the rich traditions of the Tharu community. Discover adventure, culture, and tranquility all in one place.
              </p>
            </div>

            <div
              data-aos="fade-left"
              data-aos-delay="150"
              className="relative w-full h-72 sm:h-80 md:h-[420px] overflow-hidden shadow-lg"
            >
              <Image
                src="/HotelBuilding.jpg"
                alt="The Royal Galaxy Hotel Building"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* ── SERVICES ──────────────────────────────────────────────────── */}
        <section className="bg-white w-[95%] sm:w-[90%] mx-auto my-10 md:my-16 px-6 sm:px-12 py-14 md:py-20 shadow-sm">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">

            <div
              data-aos="fade-right"
              data-aos-delay="0"
              className="relative w-full h-72 sm:h-80 md:h-[420px] overflow-hidden shadow-lg order-2 md:order-1"
            >
              <Image
                src="/swimmingpool.jpg"
                alt="Hotel Amenities"
                fill
                className="object-cover"
              />
            </div>

            <div data-aos="fade-left" data-aos-delay="150" className="order-1 md:order-2">
              <p style={{ ...eyebrow, color: '#0a7a7b' }} className="mb-3">What We Offer</p>
              <h2
                style={{
                  fontFamily: 'var(--font-exo2)',
                  fontWeight: 300,
                  fontSize: 'clamp(1.8rem, 3vw, 2.6rem)',
                  lineHeight: '1.25',
                  letterSpacing: '0.04em',
                  color: '#1a2e2e',
                }}
                className="mb-5"
              >
                Amenities &amp;{' '}
                <span style={{ color: '#0a7a7b', fontWeight: 600 }}>Services</span>
              </h2>
              <p
                className="mb-6"
                style={{
                  ...body,
                  fontSize: 'clamp(14px, 1.5vw, 16px)',
                  lineHeight: '1.85',
                  color: 'rgb(75,75,75)',
                }}
              >
                From guided Jungle Safaris and Boating to Jeep Safaris and Elephant Riding,
                we craft every adventure for you. Unwind at our restaurant, enjoy free WiFi, and park with ease.
              </p>

              <div className="flex flex-wrap gap-2">
                {['Jungle Safari', 'Boating', 'Jeep Safari', 'Elephant Riding', 'Restaurant', 'Free WiFi', 'Parking', '24hr Service'].map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 border border-[#0a7a7b]/30 text-[#0a7a7b] hover:bg-[#0a7a7b] hover:text-white transition-all duration-200 cursor-default"
                    style={{
                      fontFamily: 'var(--font-exo2)',
                      fontSize: '11px',
                      letterSpacing: '0.10em',
                      fontWeight: 500,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── BLOG ──────────────────────────────────────────────────────── */}
        <section className="bg-[#1a2e2e] px-4 sm:px-8 py-16 md:py-24 text-center">
          <p
            data-aos="fade-down"
            style={{ ...eyebrow, color: 'rgba(221,211,188,0.60)' }}
            className="mb-4"
          >
            Latest Updates
          </p>
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
            className="mb-5 mx-auto max-w-2xl"
          >
            What&apos;s New at{' '}
            <span style={{ fontWeight: 600 }}>Royal Galaxy?</span>
          </h2>
          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="mb-10 mx-auto max-w-xl"
            style={{
              ...body,
              color: 'rgba(255,255,255,0.60)',
              fontSize: 'clamp(14px, 1.5vw, 16px)',
              lineHeight: '1.85',
            }}
          >
            At Royal Galaxy Hotel &amp; Lodge, we believe the best experiences are just around the corner.
            While we take care of your comfort, let us inspire your itinerary. Our latest blog posts are packed
            with insider recommendations on events, dining, and attractions you won&apos;t want to miss.
          </p>
          <HotelButton href="/blog" variant="solid" aosDir="fade-up" aosDelay={300}>
            See What&apos;s Happening
          </HotelButton>
        </section>

        {/* ── EXPLORE NEARBY ────────────────────────────────────────────── */}
<Nearby/>
        {/* ── CTA BANNER ────────────────────────────────────────────────── */}
        <CTA/>

      </main>
    </>
  )
}

export default RoyalGalaxy