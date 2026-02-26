"use client";

import React from "react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────
export type BtnVariant = "light" | "solid" | "outline";

export interface HotelButtonProps {
  href?: string;
  children: React.ReactNode;
  variant?: BtnVariant;
  aosDir?: "fade-up" | "fade-right" | "fade-left" | "fade-down";
  aosDelay?: number;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

// ── Style map ────────────────────────────────────────────────────────────────
const VARIANT_STYLES: Record<BtnVariant, { wrapper: string; arrow: string }> = {
  light: {
    wrapper: "bg-[#f2ede1] text-[#0a7a7b] hover:bg-[#e8e0d0]",
    arrow: "text-[#0a7a7b]",
  },
  solid: {
    wrapper: "bg-[#0a7a7b] text-[#f2ede1] hover:bg-[#085e5f]",
    arrow: "text-[#f2ede1]",
  },
  outline: {
    wrapper:
      "bg-transparent border border-[#0a7a7b]/40 text-[#0a7a7b] hover:border-[#0a7a7b] hover:bg-[#0a7a7b]/5",
    arrow: "text-[#0a7a7b]",
  },
};

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-exo2)",
  fontSize: "11px",
  fontWeight: 600,
  letterSpacing: "0.24em",
};

// ── Component ────────────────────────────────────────────────────────────────
export default function HotelButton({
  href,
  children,
  variant = "solid",
  aosDir,
  aosDelay,
  type = "button",
  onClick,
}: HotelButtonProps) {
  const v = VARIANT_STYLES[variant];

  const inner = (
    <span
      className={`group inline-flex items-center gap-0 px-9 py-3 uppercase transition-all duration-300 ease-in-out cursor-pointer select-none ${v.wrapper}`}
      style={LABEL_STYLE}
    >
      {/* Label — slides left on hover */}
      <span className="transition-transform duration-300 ease-in-out group-hover:-translate-x-1">
        {children}
      </span>
      {/* Arrow — expands on hover */}
      <span
        className={`overflow-hidden w-0 opacity-0 group-hover:w-5 group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-in-out font-light ${v.arrow}`}
        style={{ fontSize: "16px", lineHeight: 1 }}
        aria-hidden="true"
      >
        ›
      </span>
    </span>
  );

  const aoProps: Record<string, string | number> = {};
  if (aosDir) aoProps["data-aos"] = aosDir;
  if (aosDelay !== undefined) aoProps["data-aos-delay"] = aosDelay;

  if (href) {
    return (
      <div {...aoProps}>
        <Link href={href}>{inner}</Link>
      </div>
    );
  }

  return (
    <div {...aoProps}>
      <button type={type} onClick={onClick} className="appearance-none border-0 p-0 bg-transparent">
        {inner}
      </button>
    </div>
  );
}
