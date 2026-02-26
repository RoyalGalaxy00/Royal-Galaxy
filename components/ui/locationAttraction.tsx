"use client";
import React from "react";
import { MapPin, Trees, Binoculars, Music, ArrowRight } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";

const attractions = [
  {
    title: "Chitwan National Park",
    description:
      "A UNESCO World Heritage site, home to rich flora and fauna. Experience the heart of the jungle.",
    icon: Trees,
  },
  {
    title: "One Horned Rhino",
    description:
      "Witness the majestic and endangered One-Horned Rhinoceros in its natural habitat during our safaris.",
    icon: Binoculars,
  },
  {
    title: "Sauraha",
    description:
      "The gateway to Chitwan. Explore the vibrant town, riverside sunsets, and local lifestyle.",
    icon: MapPin,
  },
  {
    title: "Tharu Culture & Dance",
    description:
      "Immerse yourself in the indigenous Tharu culture with traditional stick dances and cultural shows.",
    icon: Music,
  },
];

const LocationAttraction = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-20">
          <h3 className="text-[#0a7a7b] font-medium tracking-widest uppercase text-sm mb-2">
            Explore the Wild
          </h3>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            Local Attractions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Discover the wonders of Chitwan. From dense jungles to vibrant
            culture, endless adventures await just outside our doorstep.
          </p>
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {attractions.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 relative overflow-hidden"
            >
              {/* Hover Accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-[#0a7a7b] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>

              <div className="w-14 h-14 bg-[#0a7a7b]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#0a7a7b] transition-colors duration-300">
                <item.icon className="w-7 h-7 text-[#0a7a7b] group-hover:text-white transition-colors duration-300" />
              </div>

              <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 group-hover:text-[#0a7a7b] transition-colors duration-300">
                {item.title}
              </h3>

              <p className="text-gray-600 leading-relaxed text-sm mb-6">
                {item.description}
              </p>

              <div className="flex items-center text-[#0a7a7b] font-medium text-sm group/btn cursor-pointer">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/local-attractions">
            <Button className="bg-transparent border border-[#0a7a7b] text-[#0a7a7b] hover:bg-[#0a7a7b] hover:text-white px-8 py-6 rounded-full text-lg transition-all duration-300">
              View All
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LocationAttraction;
