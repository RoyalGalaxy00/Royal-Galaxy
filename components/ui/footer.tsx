"use client"
import React from 'react'
import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = [
  { name: "The Hotel", href: "/the-hotel" },
  { name: "Blog", href: "/blog" },
  { name: "Book Now", href: "/book" },
  { name: "Contact Us", href: "/contact" },
];

const Footer = () => {
  return (
    <footer className="w-full">
      {/* Upper Footer - Light Background */}
      <div className="bg-[#ccd8d6] pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            
            {/* Brand Column */}
            <div className="space-y-6">
              <Link href="/" className="text-2xl font-serif font-bold tracking-wider text-[#054445]">
                Royal Galaxy
              </Link>
              <p className="text-[#054445]/80 leading-relaxed text-sm">
                Experience the perfect blend of luxury and wilderness. Your gateway to an unforgettable adventure in Chitwan.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="w-10 h-10 rounded-full bg-[#054445]/10 flex items-center justify-center text-[#054445] hover:bg-[#0a7a7b] hover:text-white transition-colors duration-300">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="#" className="w-10 h-10 rounded-full bg-[#054445]/10 flex items-center justify-center text-[#054445] hover:bg-[#0a7a7b] hover:text-white transition-colors duration-300">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="#" className="w-10 h-10 rounded-full bg-[#054445]/10 flex items-center justify-center text-[#054445] hover:bg-[#0a7a7b] hover:text-white transition-colors duration-300">
                  <Twitter className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <h3 className="text-lg font-serif font-semibold text-[#0a7a7b]">Quick Links</h3>
              <ul className="space-y-3">
                {footerLinks.map((link, index) => (
                  <li key={index}>
                    <Link href={link.href} className="text-[#054445]/80 hover:text-[#0a7a7b] transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
               <h3 className="text-lg font-serif font-semibold text-[#0a7a7b]">Contact Us</h3>
               <ul className="space-y-4">
                 <li className="flex items-start text-[#054445]/80 text-sm">
                    <MapPin className="w-5 h-5 mr-3 text-[#0a7a7b] shrink-0" />
                   <span>Sauraha, Chitwan,<br />Nepal</span>
                 </li>
                 <li className="flex items-center text-[#054445]/80 text-sm">
                   <Phone className="w-5 h-5 mr-3 text-[#0a7a7b] shrink-0" />
                   <span>+977 56-123456</span>
                 </li>
               <li className="flex items-center text-[#054445]/80 text-sm">
                   <Mail className="w-5 h-5 mr-3 text-[#0a7a7b] shrink-0" />
                   <span>info@royalgalaxy.com.np</span>
                 </li>
               </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Lower Footer - Dark Background */}
      <div className="bg-[#054445] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} Royal Galaxy Hotel. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
