"use client";

import React, { useState } from "react";
import { Exo_2 } from "next/font/google";
import AOSInit from "@/components/ui/AOS";
import Image from "next/image";
import CTA from "@/components/ui/CTA";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";

// ── Font ───────────────────────────────────────────────────────────────────
const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-exo2",
});

// ── Shared style tokens ────────────────────────────────────────────────────
const body = {
  fontFamily: "var(--font-exo2)",
  fontWeight: 400,
  color: "rgb(39, 39, 39)",
} as const;

const eyebrow: React.CSSProperties = {
  fontFamily: "var(--font-exo2)",
  fontWeight: 500,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  fontSize: "11px",
  lineHeight: "20px",
};

// ── Gallery Images ─────────────────────────────────────────────────────────
interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: string;
  caption: string;
  span?: "wide" | "tall" | "normal";
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    alt: "Luxury suite bedroom",
    category: "Rooms",
    caption: "Presidential Suite",
    span: "wide",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&q=80",
    alt: "Deluxe room interior",
    category: "Rooms",
    caption: "Deluxe Room",
    span: "normal",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80",
    alt: "Modern bathroom",
    category: "Rooms",
    caption: "En-suite Bathroom",
    span: "normal",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80",
    alt: "Family suite",
    category: "Rooms",
    caption: "Family Suite",
    span: "tall",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800&q=80",
    alt: "Executive suite living area",
    category: "Rooms",
    caption: "Executive Suite",
    span: "normal",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    alt: "Jungle forest at Chitwan",
    category: "Nature",
    caption: "Chitwan Jungle",
    span: "wide",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80",
    alt: "Elephant in the wild",
    category: "Nature",
    caption: "Wild Elephant",
    span: "normal",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&q=80",
    alt: "Deer in Chitwan National Park",
    category: "Nature",
    caption: "National Park Wildlife",
    span: "normal",
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
    alt: "River through the jungle",
    category: "Nature",
    caption: "Rapti River",
    span: "tall",
  },
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    alt: "Fine dining restaurant",
    category: "Dining",
    caption: "Restaurant",
    span: "wide",
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    alt: "Nepalese cuisine spread",
    category: "Dining",
    caption: "Local Cuisine",
    span: "normal",
  },
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&q=80",
    alt: "Cocktails and drinks",
    category: "Dining",
    caption: "Signature Cocktails",
    span: "normal",
  },
  {
    id: 13,
    src: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    alt: "Outdoor dining setup",
    category: "Dining",
    caption: "Outdoor Dining",
    span: "normal",
  },
  {
    id: 14,
    src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    alt: "Boat safari on river",
    category: "Activities",
    caption: "River Boating",
    span: "wide",
  },
  {
    id: 15,
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    alt: "Jeep safari adventure",
    category: "Activities",
    caption: "Jeep Safari",
    span: "normal",
  },
  {
    id: 16,
    src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
    alt: "Swimming pool",
    category: "Activities",
    caption: "Outdoor Pool",
    span: "tall",
  },
  {
    id: 17,
    src: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80",
    alt: "Cultural dance performance",
    category: "Activities",
    caption: "Tharu Cultural Show",
    span: "normal",
  },
  {
    id: 18,
    src: "https://images.unsplash.com/photo-1465056836041-7f43ac27dcb5?w=800&q=80",
    alt: "Sunrise over Chitwan",
    category: "Views",
    caption: "Chitwan Sunrise",
    span: "wide",
  },
  {
    id: 19,
    src: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80",
    alt: "Hotel garden view",
    category: "Views",
    caption: "Garden View",
    span: "normal",
  },
  {
    id: 20,
    src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    alt: "Hotel exterior at dusk",
    category: "Views",
    caption: "Hotel at Dusk",
    span: "normal",
  },
  {
    id: 21,
    src: "https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800&q=80",
    alt: "Mountain mist view",
    category: "Views",
    caption: "Morning Mist",
    span: "tall",
  },
];

// ── Lightbox ───────────────────────────────────────────────────────────────
function Lightbox({
  images,
  activeIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: GalleryImage[];
  activeIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const img = images[activeIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,20,18,0.96)" }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 flex items-center justify-center w-10 h-10 transition-all"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          cursor: "pointer",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background = "rgba(10,122,123,0.40)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)")
        }
      >
        <X size={18} />
      </button>

      {/* Prev */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-4 sm:left-8 z-10 flex items-center justify-center w-11 h-11 transition-all"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          cursor: "pointer",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background = "rgba(10,122,123,0.40)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)")
        }
      >
        <ChevronLeft size={20} />
      </button>

      {/* Image */}
      <div
        className="relative mx-20 sm:mx-28"
        style={{ maxWidth: "min(860px, 90vw)", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full" style={{ paddingBottom: "62%" }}>
          <Image
            src={img.src}
            alt={img.alt}
            fill
            className="object-cover"
            sizes="860px"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ border: "1px solid rgba(10,122,123,0.35)" }}
          />
        </div>

        {/* Caption */}
        <div className="flex items-center justify-between mt-4 px-1">
          <div>
            <p style={{ ...eyebrow, color: "rgba(255,255,255,0.40)" }}>
              {img.category}
            </p>
            <p
              style={{
                fontFamily: "var(--font-exo2)",
                fontWeight: 300,
                fontSize: 20,
                color: "rgb(221,211,188)",
                letterSpacing: "0.04em",
              }}
            >
              {img.caption}
            </p>
          </div>
          <span
            style={{
              ...eyebrow,
              color: "rgba(255,255,255,0.30)",
              fontSize: 10,
            }}
          >
            {activeIndex + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Next */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-4 sm:right-8 z-10 flex items-center justify-center w-11 h-11 transition-all"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          cursor: "pointer",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLElement).style.background = "rgba(10,122,123,0.40)")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)")
        }
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

// ── Gallery Card ───────────────────────────────────────────────────────────
function GalleryCard({
  image,
  index,
  onClick,
}: {
  image: GalleryImage;
  index: number;
  onClick: () => void;
}) {
  const spanClass =
    image.span === "wide"
      ? "col-span-2"
      : image.span === "tall"
      ? "row-span-2"
      : "";

  const heightClass =
    image.span === "tall"
      ? "h-full min-h-[480px]"
      : image.span === "wide"
      ? "h-64 sm:h-72"
      : "h-64";

  return (
    <div
      className={`group relative overflow-hidden cursor-pointer ${spanClass}`}
      data-aos="zoom-in"
      data-aos-duration="600"
      data-aos-delay={String((index % 6) * 80)}
      onClick={onClick}
      style={{ border: "1px solid rgba(10,122,123,0.12)" }}
    >
      <div className={`relative w-full ${heightClass}`}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,26,26,0.75) 0%, rgba(10,26,26,0.10) 50%, transparent 100%)",
          }}
        />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "rgba(10,122,123,0.22)" }}
        >
          <div
            className="flex items-center justify-center w-12 h-12"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.35)",
              backdropFilter: "blur(4px)",
            }}
          >
            <ZoomIn size={18} color="#fff" />
          </div>
        </div>

        {/* Caption */}
        <div className="absolute bottom-0 left-0 px-4 pb-4">
          <p
            style={{
              ...eyebrow,
              color: "rgba(255,255,255,0.50)",
              fontSize: "9px",
              marginBottom: 2,
            }}
          >
            {image.category}
          </p>
          <p
            style={{
              fontFamily: "var(--font-exo2)",
              fontWeight: 300,
              fontSize: 15,
              color: "#fff",
              letterSpacing: "0.04em",
            }}
          >
            {image.caption}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
const GalleryPage = () => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () =>
    setLightboxIndex((i) =>
      i !== null ? (i - 1 + galleryImages.length) % galleryImages.length : null
    );
  const nextImage = () =>
    setLightboxIndex((i) =>
      i !== null ? (i + 1) % galleryImages.length : null
    );

  return (
    <>
      <AOSInit />
      <main className={`${exo2.variable} bg-[#f2ede1] min-h-screen flex flex-col`}>

        {/* ── HERO ────────────────────────────────────────────────────── */}
        <section
          className="relative bg-[#0a7a7b] flex flex-col items-center justify-center text-center text-white px-4 sm:px-8 overflow-hidden"
          style={{ minHeight: "110vh" }}
        >
          {/* Line texture */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,1) 3px,rgba(255,255,255,1) 4px)",
            }}
          />

          {/* Top ornament */}
          <div
            data-aos="fade-down"
            data-aos-delay="0"
            className="flex flex-col items-center mb-7"
          >
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
            style={{ ...eyebrow, color: "rgba(255,255,255,0.60)" }}
            className="mb-5"
          >
            Photo Gallery
          </p>

          {/* Title */}
          <h1
            data-aos="fade-down"
            data-aos-delay="200"
            className="px-4 mb-3"
            style={{
              fontFamily: "var(--font-exo2)",
              fontWeight: 300,
              fontSize: "clamp(2.4rem, 6vw, 72px)",
              lineHeight: "clamp(2.8rem, 7vw, 82px)",
              color: "rgb(230, 221, 202)",
              letterSpacing: "0.06em",
            }}
          >
            A Glimpse of{" "}
            <em
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                color: "rgba(230,221,202,0.72)",
              }}
            >
              Royal Galaxy
            </em>
          </h1>

          {/* Divider */}
          <div
            data-aos="fade-down"
            data-aos-delay="300"
            className="flex items-center gap-4 my-6"
          >
            <div className="w-14 h-px bg-white/25" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/45" />
            <div className="w-14 h-px bg-white/25" />
          </div>

          {/* Subheading */}
          <p
            data-aos="fade-up"
            data-aos-delay="380"
            className="max-w-xs sm:max-w-md mb-8 px-4"
            style={{
              ...body,
              color: "rgba(255,255,255,0.70)",
              fontSize: "clamp(14px, 1.5vw, 16px)",
              lineHeight: "1.85",
              letterSpacing: "0.02em",
            }}
          >
            Explore the beauty of our rooms, the wildlife of Chitwan, and every
            experience that awaits you at Royal Galaxy Hotel &amp; Lodge.
          </p>

          {/* Wave out */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg
              viewBox="0 0 1440 60"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f2ede1" />
            </svg>
          </div>
        </section>

        {/* ── GALLERY GRID ────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto w-full px-4 sm:px-8 pt-14 pb-20">

          {/* Section label */}
          <div
            data-aos="fade-up"
            data-aos-duration="500"
            className="flex items-center gap-4 mb-10"
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(10,122,123,0.20), transparent)",
              }}
            />
            <p style={{ ...eyebrow, color: "rgba(10,122,123,0.60)" }}>
              Our Collection
            </p>
            <div
              style={{
                flex: 1,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(10,122,123,0.20), transparent)",
              }}
            />
          </div>

          {/* Grid */}
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            style={{ gridAutoRows: "240px" }}
          >
            {galleryImages.map((image, index) => (
              <GalleryCard
                key={image.id}
                image={image}
                index={index}
                onClick={() => openLightbox(index)}
              />
            ))}
          </div>
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <CTA />
      </main>

      {/* ── LIGHTBOX ──────────────────────────────────────────────────── */}
      {lightboxIndex !== null && (
        <Lightbox
          images={galleryImages}
          activeIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
        />
      )}
    </>
  );
};

export default GalleryPage;