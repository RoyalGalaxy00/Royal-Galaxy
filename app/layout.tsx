import type { Metadata } from "next";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/ui/navbar";
import { ClerkProvider } from "@clerk/nextjs";
import Footer from "@/components/ui/footer";
import { Toaster } from "@/components/ui/sonner";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Royal Galaxy Hotel & Lodge | Chitwan, Nepal",
  description:
    "Experience luxury in the heart of the jungle at Royal Galaxy Hotel & Lodge in Sauraha, Chitwan, Nepal. Book your authentic safari adventure, jungle tours, and comfortable stays near Chitwan National Park.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <NavBar />
          {children}
          <Toaster
            position="top-center" // or "top-left", "top-right"
            className="bg-gray-900 text-amber-50 flex justify-center z-50"
          />{" "}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
