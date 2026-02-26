"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./sheet";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
export default function NavBar() {
  const pathname = usePathname();
  // kept logic for potential future use but text below is forced dark
  const isHomePage = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "The Hotel", href: "/the-hotel" },
    { name: "Blog", href: "/blog" },
    { name: "Gallery", href: "/gallery" },
    { name: "Feedback", href: "/feedback" },

    // { name: "Amenities & Services ", href: "/services" },
    // { name: "Local Attractions", href: "/local-attractions" },
    { name: "Contact", href: "/contact" },
  ];

  // Modified to be consistently dark/blackish as requested
  const textColorClass = "text-gray-900 dark:text-gray-100";
  const hoverColorClass = "hover:text-black dark:hover:text-white";

  return (
    <header
      className={cn(
        "sticky top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out border-b border-transparent ",
        isScrolled
          ? "bg-transparent backdrop-blur-md dark:bg-black/80 shadow-sm border-gray-200/20 py-3"
          : "bg-transparent py-5",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-3 z-50">
          <Link
            href="/"
            className={cn(
              "font-serif font-bold tracking-wider transition-all duration-300",
              "text-gray-900 dark:text-gray-100",
              isScrolled ? "text-xl md:text-2xl" : "text-2xl md:text-3xl",
            )}
          >
            Royal Galaxy
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "group relative text-sm font-medium tracking-wide transition-colors duration-300",
                textColorClass,
                hoverColorClass,
              )}
            >
              {link.name}
              <span
                className={cn(
                  "absolute -bottom-1 left-0 h-px w-0 bg-current transition-all duration-300 ease-out group-hover:w-full",
                  "bg-black dark:bg-white",
                )}
              ></span>
            </Link>
          ))}
          <div className="flex gap-4 ml-4 items-center">
            <SignedIn></SignedIn>
            <SignedOut>
              <SignUpButton mode="modal">
                <Button
                  variant="ghost"
                  className="text-black dark:text-white hover:bg-transparent hover:text-gray-700 p-0 font-medium"
                >
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>
            <Button
              asChild
              variant="outline"
              className={cn(
                "rounded-full px-6 transition-all duration-300",
                "border-[#0a7a7b] text-[#0a7a7b] hover:bg-[#0a7a7b] hover:text-white bg-transparent",
              )}
            >
              <Link href="/book">Book Now</Link>
            </Button>
            <UserButton />
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="xl:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("hover:bg-black/10", textColorClass)}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[400px] border-l-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl flex flex-col justify-center items-center"
            >
              <SheetHeader className="mb-8 text-center">
                <SheetTitle className="text-2xl font-serif font-bold tracking-wider text-[#0a7a7b]">
                  Royal Galaxy Hotel and Lodge
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-6 items-center w-full">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-lg font-medium text-gray-600 transition-colors hover:text-black dark:text-gray-300 dark:hover:text-white"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="mt-6 flex flex-col gap-4 w-3/4 items-center">
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <Button
                        variant="ghost"
                        className="w-full text-lg text-black dark:text-white hover:bg-transparent"
                      >
                        Sign Up
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <Button
                    asChild
                    className="w-full rounded-full text-lg border border-[#0a7a7b] text-[#0a7a7b] hover:bg-[#0a7a7b] hover:text-white bg-transparent"
                  >
                    <Link href="/book">Book Now</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
