"use client"
import React from 'react'
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    id: 1,
    name: "Sarah Jenkins",
    location: "United Kingdom",
    rating: 5,
    comment: "An absolute paradise! The jungle safari was the highlight of our trip, and the luxury tent accommodation was beyond our expectations. The staff treated us like royalty.",
    date: "A week ago"
  },
  {
    id: 2,
    name: "Michael Chen",
    location: "Singapore",
    rating: 5,
    comment: "The attention to detail in this hotel is remarkable. From the welcome drink to the evening Tharu cultural show, everything was perfectly curated. Highly recommended!",
    date: "2 weeks ago"
  },
  {
    id: 3,
    name: "Emma & David",
    location: "Australia",
    rating: 5,
    comment: "We stayed for 3 nights for our honeymoon and it was magical. The private dinner by the river was unforgettable. The best place designed for relaxation and adventure.",
    date: "1 month ago"
  }
];

const ReviewTestimonials = () => {
  return (
    <section className="py-24 bg-[#0a7a7b]/5 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#0a7a7b]/5 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0a7a7b]/5 rounded-full blur-3xl -z-10 transform -translate-x-1/2 translate-y-1/2"></div>

      <div className="container mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h3 className="text-[#0a7a7b] font-medium tracking-widest uppercase text-sm mb-2">Guest Experiences</h3>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">What Our Guests Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Don't just take our word for it. Here is what our valued guests have to say about their stay at Royal Galaxy.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white relative overflow-hidden">
              <CardContent className="pt-12 px-8 pb-8 flex flex-col items-center text-center h-full">
                
                {/* Quote Icon */}
                <div className="absolute top-6 left-8 text-[#0a7a7b]/10">
                  <Quote className="w-12 h-12 transform -scale-x-100" />
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-6 relative z-10">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${i < testimonial.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-gray-600 italic text-lg leading-relaxed mb-8 flex-grow relative z-10">
                  "{testimonial.comment}"
                </p>

                {/* Divider */}
                <div className="w-12 h-1 bg-[#0a7a7b]/20 rounded-full mb-6"></div>

                {/* User Info */}
                <div className="relative z-10">
                   <h4 className="font-serif font-bold text-gray-900 text-xl mb-1">{testimonial.name}</h4>
                   <span className="text-sm text-[#0a7a7b] font-medium uppercase tracking-wide">{testimonial.location}</span>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  )
}

export default ReviewTestimonials
