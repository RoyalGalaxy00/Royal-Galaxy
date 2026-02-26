"use client"
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Separator } from './separator'
import { Button } from './button'

const OwnerMessage = () => {
  return (
    <section className="py-16 md:py-24 bg-white/50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          
     

          {/* Content Section */}
          <div className="w-full md:w-1/2 flex flex-col space-y-6 md:space-y-8">
            <div className="space-y-2">
              <h3 className="text-gray-900 font-medium tracking-widest uppercase text-sm md:text-base">Saurav Kumal</h3>
              <h2 className="text-3xl md:text-5xl font-serif font-bold  leading-tight">
               <span className="text-[#0a7a7b]">Owner Message</span>
              </h2>
            </div>
            
            <Separator className="w-20 bg-[#0a7a7b] h-1 rounded-full" />
            
            <div className="space-y-4 text-gray-600 text-base md:text-lg leading-relaxed font-light">
              <p>
                Experience the thrill of the wild with our exclusive Jungle and Jeep Safaris, or enjoy a serene Elephant Ride through the heart of Chitwan National Park, home to the majestic One-horned Rhino. Immerse yourself in the vibrant local heritage with traditional Tharu Cultural Dance and cultural explorations in Sauraha.
              </p>
              <p>
                Our resort ensures your comfort with modern amenities including high-speed WiFi, spacious parking, and an on-site restaurant serving delectable cuisine. Whether you prefer the excitement of boating or simply relaxing in luxury, we provide everything needed for an unforgettable stay.
              </p>
            </div>

            <div className="pt-4">
              <Link href="/about">
              <Button className="bg-[#0a7a7b] text-white px-8 md:px-10 py-6 rounded-full text-lg shadow-lg hover:bg-[#086061] hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                Contact us
              </Button>
              </Link>
            </div>
          </div>
     {/* Image Section */}
          <div className="w-full md:w-1/2 relative group">
            <div className="relative h-[300px] md:h-[500px] w-full overflow-hidden rounded-2xl shadow-2xl">
              <Image 
                src="/swimmingpool.jpg" 
                alt="Luxury Swimming Pool"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60"></div>
            </div>
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#0a7a7b]/10 rounded-full -z-10 blur-2xl"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#0a7a7b]/10 rounded-full -z-10 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default OwnerMessage