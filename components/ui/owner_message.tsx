"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "./separator";
import { Button } from "./button";
import { getLatestOwnerImage } from "@/app/actions/getOwnerImage";

const OwnerMessage = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLatestOwnerImage().then((url) => {
      setImageUrl(url);
      setLoading(false);
    });
  }, []);

  // Use the fetched image or fallback to default "/Owner.jpg"
  const displayImageUrl = imageUrl || "/Owner.jpg";

  return (
    <section className="py-16 md:py-24 bg-white/50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          {/* Content Section */}
          <div className="w-full md:w-1/2 flex flex-col space-y-6 md:space-y-8">
            <div className="space-y-2">
              <h3 className="text-gray-900 font-medium tracking-widest uppercase text-sm md:text-base">
                Purna Bahadur Thakuri
              </h3>
              <h2 className="text-3xl md:text-5xl font-serif font-bold leading-tight">
                <span className="text-[#0a7a7b]">Owner Message</span>
              </h2>
            </div>

            <Separator className="w-20 bg-[#0a7a7b] h-1 rounded-full" />

            <div className="space-y-4 text-gray-600 text-base md:text-lg leading-relaxed font-light">
              <p>
                Nestled in the vibrant heart of Kawasoti-17, Amaltari, Chitwan,
                Royal Galaxy Hotel & Lodge offers a harmonious blend of regal
                comfort and the raw beauty of Nepal’s wilderness. Our doors open
                to a world where the luxurious amenities of a premier hotel meet
                the tranquil rhythms of nature. Whether you are gazing out at
                the lush landscape or stepping out to explore the famed Chitwan
                National Park, our lodge serves as the perfect sanctuary for
                adventurers and peace-seekers alike.
              </p>
              <p>
                At Royal Galaxy, we pride ourselves on being your home away from
                home. After a day of jungle safaris and cultural encounters,
                return to our warm hospitality, savor authentic local cuisine,
                and relax in accommodations designed for your utmost comfort. We
                invite you to create lasting memories with us, where every stay
                is a royal experience in the heart of the jungle. Book your
                escape to Sauraha today.
              </p>
            </div>
          </div>

          {/* Image Section */}
          <div className="w-full md:w-1/2 relative group">
            <div className="relative h-[300px] md:h-[500px] w-full overflow-hidden rounded-2xl shadow-2xl">
              {!loading && (
                <Image
                  src={displayImageUrl}
                  alt="Owner Photo"
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60"></div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#0a7a7b]/10 rounded-full -z-10 blur-2xl"></div>
            <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#0a7a7b]/10 rounded-full -z-10 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OwnerMessage;
