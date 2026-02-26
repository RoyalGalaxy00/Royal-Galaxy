"use client"
import React, { useState } from 'react';
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from 'next/link';
import AOSInit from '@/components/ui/AOS'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar, User, ArrowRight } from 'lucide-react';
import HotelButton from '@/components/ui/HotelButton'
import Image from 'next/image';
import { Exo_2 } from 'next/font/google'
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
const BlogComponent = () => {


  return (
    <>
  <AOSInit />
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
          </section></>
  )
}

export default BlogComponent
