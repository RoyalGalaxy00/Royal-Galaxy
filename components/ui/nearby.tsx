"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { cn } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";

const carouselItems = [
  {
    title: "Sauraha",
    image: "/sauraha.webp",
    description:
      "The vibrant gateway village to Chitwan National Park, buzzing with local markets, riverside views of the Rapti, and warm Nepali hospitality right at your doorstep.",
  },
  {
    title: "Chitwan National Park",
    image: "/deer.jpg",
    description:
      "Nepal's first UNESCO World Heritage national park — a pristine jungle teeming with Bengal tigers, gharial crocodiles, and over 500 species of birds waiting to be discovered.",
  },
  {
    title: "One-Horned Rhino",
    image: "/rhnio.jpg",
    description:
      "Chitwan is home to one of the last populations of the endangered greater one-horned rhinoceros. Spot them on a morning jungle walk or a peaceful canoe safari along the river.",
  },
  {
    title: "Tharu Culture",
    image: "/tharuCul.webp",
    description:
      "The indigenous Tharu people have called the Terai region home for centuries. Explore their unique architecture, art, traditional fishing techniques, and deep-rooted customs.",
  },
  {
    title: "Tharu Cultural Dance",
    image: "/tharu.webp",
    description:
      "Every evening, the Stick Dance and other traditional Tharu performances light up Sauraha. Experience vibrant costumes, rhythmic drumbeats, and storytelling through dance.",
  },
];
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
export function Nearby() {
  const [api, setApi] = useState();
  const [current, setCurrent] = useState(0);

  // Autoplay plugin
  const plugin = Autoplay({
    delay: 3000,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
  });

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="bg-[#ffffff] px-4 sm:px-8 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p
            data-aos="fade-down"
            style={{ ...eyebrow, color: "#0a7a7b" }}
            className="mb-4"
          >
            Discover More
          </p>
          <h2
            data-aos="fade-up"
            data-aos-delay="100"
            style={{
              fontFamily: "var(--font-exo2)",
              fontWeight: 300,
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              lineHeight: "1.25",
              letterSpacing: "0.04em",
              color: "#1a2e2e",
            }}
            className="mb-4"
          >
            Explore{" "}
            <span style={{ color: "#0a7a7b", fontWeight: 600 }}>
              Royal Galaxy
            </span>{" "}
            Nearby
          </h2>
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="w-12 h-px bg-[#0a7a7b]/25" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#0a7a7b]/45" />
            <div className="w-12 h-px bg-[#0a7a7b]/25" />
          </div>
          <p
            data-aos="fade-up"
            data-aos-delay="200"
            className="mx-auto max-w-xl"
            style={{
              ...body,
              color: "rgb(95,95,95)",
              fontSize: "clamp(14px, 1.5vw, 16px)",
              lineHeight: "1.80",
            }}
          >
            The perfect starting point from our hotel, every sight worth seeing
            is close by.
          </p>
        </div>

        {/* Cards */}

        <div className="w-full bg-white pb-8 md:pb-12 lg:pb-16 overflow-hidden">
          <div className="container mx-auto px-4">
            {/* Carousel Container */}
            <div className="relative w-full">
              <Carousel
                setApi={setApi}
                opts={{
                  align: "start",
                  loop: true,
                  dragFree: false,
                  containScroll: "trimSnaps",
                }}
                plugins={[plugin]}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4 lg:-ml-6">
                  {carouselItems.map((item, index) => (
                    <CarouselItem
                      key={item.title}
                      className={cn(
                        "pl-2 md:pl-4 lg:pl-6",
                        "basis-full", // Mobile: 1 card
                        "sm:basis-1/2", // Small tablets: 2 cards
                        "md:basis-1/3", // Tablets: 3 cards
                        "lg:basis-1/3", // Desktop: 4 cards
                        "xl:basis-1/3", // Large desktop: 5 cards
                      )}
                    >
                      <div className="h-full p-1">
                        <Card className="group flex flex-col h-full border border-[#e8e3d8] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 p-0">
                          {/* Image Section */}
                          <div className="relative w-full aspect-[4/3] overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-110"
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                            />

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>

                          {/* Text Content */}
                          <CardContent className="p-4 md:p-5 flex flex-col flex-1">
                            <h3
                              className="font-semibold text-[#1a2e2e] group-hover:text-[#0a7a7b] transition-colors duration-300 mb-2"
                              style={{
                                fontFamily: "var(--font-exo2)",
                                fontSize: "clamp(1rem, 2vw, 1.1rem)",
                                lineHeight: "1.3",
                              }}
                            >
                              {item.title}
                            </h3>
                            <p
                              className="text-xs md:text-sm text-[rgb(80,80,80)] line-clamp-4 md:line-clamp-none"
                              style={{
                                fontFamily: "var(--font-exo2)",
                                lineHeight: "1.6",
                              }}
                            >
                              {item.description}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Dot Indicators */}
                <div className="flex justify-center items-center gap-2 mt-6 md:mt-8">
                  {carouselItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => api?.scrollTo(index)}
                      className="group relative"
                      aria-label={`Go to slide ${index + 1}`}
                    >
                      <div
                        className={cn(
                          "h-1.5 md:h-2 rounded-full transition-all duration-300",
                          current === index
                            ? "w-6 md:w-8 bg-[#0a7a7b]"
                            : "w-1.5 md:w-2 bg-[#0a7a7b]/30 group-hover:bg-[#0a7a7b]/50",
                        )}
                      />
                    </button>
                  ))}
                </div>

                {/* Autoplay Indicator */}
                <div className="flex justify-center items-center mt-4">
                  <div className="flex items-center gap-2 text-xs md:text-sm text-[rgb(80,80,80)]"></div>
                </div>
              </Carousel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
