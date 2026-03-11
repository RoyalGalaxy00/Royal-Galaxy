"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  useUser,
} from "@clerk/nextjs";
import type { NavLink, UserRole } from "@/types/roles";

export default function NavBar() {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Get user role from Clerk metadata with type safety
  const userRole = (user?.publicMetadata?.role as UserRole) || null;

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

  // Type-safe navigation links
  const navLinks: NavLink[] = [
    { name: "Home", href: "/" },
    { name: "The Hotel", href: "/the-hotel" },
    { name: "Blog", href: "/blog" },
    { name: "Gallery", href: "/gallery" },
    { name: "Feedback", href: "/feedback" },
    { name: "Contact", href: "/contact" },
    { name: "Admin Dashboard", href: "/admin", requiredRole: "admin" },
    {
      name: "Moderator Dashboard",
      href: "/moderator",
      requiredRole: "moderator",
    },
  ];

  // Filter links based on user role
  const filteredLinks = navLinks.filter((link) => {
    // If no role required, show to everyone
    if (!link.requiredRole) return true;

    // If user is not logged in, don't show role-protected links
    if (!user) return false;

    // Admin can see all links
    if (userRole === "admin") return true;

    // Show moderator links only to moderators
    if (link.requiredRole === "moderator" && userRole === "moderator")
      return true;

    // Don't show admin links to non-admins
    if (link.requiredRole === "admin") return false;

    return false;
  });

  const textColorClass = "text-gray-900 dark:text-gray-100";
  const hoverColorClass = "hover:text-black dark:hover:text-white";

  // Don't render until user is loaded to prevent flash of incorrect content
  if (!isLoaded) {
    return (
      <header className="sticky top-0 left-0 right-0 z-50 w-full bg-transparent py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="text-2xl font-serif">Royal Galaxy</div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "sticky top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out border-b border-transparent",
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
          {filteredLinks.map((link) => (
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
              />
            </Link>
          ))}
          <div className="flex gap-4 ml-4 items-center">
            <SignedIn />
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
            <UserButton afterSignOutUrl="/" />
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="xl:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                suppressHydrationWarning
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
                {filteredLinks.map((link) => (
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
                    <UserButton afterSignOutUrl="/" />
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
