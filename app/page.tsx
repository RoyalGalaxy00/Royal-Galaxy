import Image from "next/image";
import { Button } from "@/components/ui/button";
import HeroTyped from "@/components/ui/HeroTyped";
import AboutComponent from "@/components/ui/aboutComponent";
import Service from "@/components/ui/hotelServices";
import LocationAttraction from "@/components/ui/locationAttraction";
import BlogComponent from "@/components/ui/blogComponent";
import ReviewTestimonials from "@/components/ui/testimonials";
import { Nearby } from "@/components/ui/nearby";
import OwnerMessage from "@/components/ui/owner_message";
import Link from "next/link";
import CTA from "@/components/ui/CTA";

export default function Home() {
  return (
    <div className="overflow-x-hidden w-full">
      <main className="flex flex-col md:flex-row h-screen w-full relative items-center justify-center md:justify-start md:items-start overflow-hidden">
        {/* Image Section - Absolute on Mobile, Relative side-by-side on Desktop */}
        <section className="absolute inset-0 md:relative md:w-1/2 h-full bg-[#ebe7d6] z-0 md:order-2 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1728033503828-5e7922a363aa?q=80&w=542&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Luxury Hotel Ambience"
            fill
            quality={100}
            className="object-cover"
            priority
          />
          {/* Mobile Overlay Gradient */}
          <div className="absolute inset-0 bg-black/40 md:hidden" />
        </section>

        {/* Text Section - Overlay on Mobile, Relative side-by-side on Desktop */}
        <section className="relative h-full flex flex-col w-full md:w-1/2 bg-transparent md:bg-[#0a7a7b] justify-center px-6 md:px-12 lg:px-20 py-12 md:py-0 z-10 md:order-1">
          <div className="flex flex-col text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-bold leading-none tracking-tight min-h-[160px] md:min-h-[200px] mx-auto md:mx-0">
            <HeroTyped />
          </div>
          <p className="text-white text-base sm:text-lg md:text-xl max-w-md drop-shadow-md md:drop-shadow-none mb-6 mx-auto md:mx-0">
            Experience the luxury of our hotel and create memories that will
            last a lifetime.
          </p>
          <Button
            asChild
            className="bg-white text-black w-fit text-lg px-8 py-6 rounded-none hover:bg-gray-100 transition-colors border-none mx-auto md:mx-0"
          >
            <Link href="/book">Book Now</Link>
          </Button>
        </section>
      </main>

      <AboutComponent />
      <OwnerMessage />
      <Service />
      <BlogComponent />
      <Nearby />
      <CTA />
      {/* <ReviewTestimonials /> */}
    </div>
  );
}
