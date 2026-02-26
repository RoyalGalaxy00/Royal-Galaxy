"use client";

import { useEffect, useRef } from "react";
import Typed from "typed.js";

export default function HeroTyped() {
  const typedRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: [
        "Luxury in the Heart of the Jungle",
        "Your Gateway to Chitwan National Park",
        "Experience Unforgettable Safari Adventures",
        "Where Nature Meets Elegance",
        "Book Your Authentic Jungle Escape",
        "Welcome to Royal Galaxy Hotel And Lodge",
      ],
      typeSpeed: 50,
      showCursor: true,
      cursorChar: "",
      autoInsertCss: true,
      contentType: "html",
    });

    return () => {
      typed.destroy();
    };
  }, []);

  return <span className="text-white text-center md:text-left" ref={typedRef} />;
}
