"use client";
import React from "react";
import Link from "next/link";
import {
  Utensils,
  Wifi,
  Car,
  Clock,
  ConciergeBell,
  Shirt,
  Thermometer,
  Droplets,
  Plane,
  Check,
  Map,
  Users,
  Waves,
} from "lucide-react";
import { Button } from "./button";

const amenities = [
  {
    icon: Utensils,
    title: "Restaurant",
    description:
      "Multi-cuisine restaurant serving local, Indian, and continental dishes",
  },
  {
    icon: Wifi,
    title: "Free WiFi",
    description: "High-speed internet access throughout the property",
  },
  {
    icon: Car,
    title: "Parking",
    description: "Complimentary secure parking for all guests",
  },
  {
    icon: Clock,
    title: "24/7 Front Desk",
    description: "Round-the-clock assistance for your needs",
  },
  {
    icon: ConciergeBell,
    title: "Room Service",
    description: "In-room dining available during your stay",
  },
  {
    icon: Shirt,
    title: "Laundry Service",
    description: "Quick and efficient laundry facilities",
  },
  {
    icon: Thermometer,
    title: "Air Conditioning",
    description: "Comfortable, climate-controlled rooms",
  },
  { icon: Droplets, title: "Hot Water", description: "24/7 hot water supply" },
  {
    icon: Plane,
    title: "Airport Transfers",
    description: "Pickup and drop-off services available (on request)",
  },
  {
    icon: Waves,
    title: "Swimming Pool",
    description: "Relax in our crystal clear outdoor swimming pool",
  },
];

const HotelServices = () => {
  return (
    <section className="text-gray-600 body-font bg-white">
      <div className="container px-5 py-24 mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20">
          <h3 className="text-[#0a7a7b] font-medium tracking-widest uppercase text-sm mb-2">
            Our Amenities
          </h3>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            Hotel Services
          </h2>
          <p className="text-base leading-relaxed xl:w-2/4 lg:w-3/4 mx-auto text-gray-500">
            We provide world-class facilities to ensure your stay is comfortable
            and memorable.
          </p>
        </div>

        {/* Features (Amenities) Grid - Reference Layout */}
        <div className="flex flex-wrap lg:w-4/5 sm:mx-auto sm:mb-2 -mx-2 mb-24">
          {amenities.map((item, index) => (
            <div key={index} className="p-2 sm:w-1/2 w-full">
              <div className="bg-gray-50 rounded-xl flex p-4 h-full items-center shadow-sm hover:shadow-md hover:bg-white border border-transparent hover:border-gray-100 transform transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 inline-flex items-center justify-center rounded-full bg-[#0a7a7b]/10 text-[#0a7a7b] mr-4 flex-shrink-0">
                  <item.icon className="w-5 h-5" />
                </div>
                <span className="title-font font-medium text-gray-900 text-lg">
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Link href="/contactus" className="flex justify-center mt-16">
          <Button className="text-white bg-[#0a7a7b] border-0 py-2 px-8 focus:outline-none hover:bg-[#086061] rounded text-lg">
            Book Your Stay
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default HotelServices;
