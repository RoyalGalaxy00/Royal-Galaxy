"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  MessageSquare,
  Users,
  Bell,
  BookOpen,
  Scale,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useUser } from "@clerk/nextjs";
// Server component for role checking
export async function ModeratorPage() {
  const { user,isSignedIn,isLoaded } = useUser();
   const userRole = user?.publicMetadata?.role as string | undefined;

   if(!isLoaded){
    return <div>Loading...</div>
   }
useEffect(() => {
if(!isSignedIn){
    redirect("/not-found");
    console.error("Please sign in first.")
  
}
}, [isLoaded]);


  if (!userRole) {
    redirect("/not-found");
    console.error("You are not authorized to access this page.")
    return null;
  }

  return <Moderator />;
}

// Client component for UI rendering
const Moderator = () => {
  const moderatorFunction = [
    {
      id: 1,
      category: "Blog Post",
      content: "Engage with comments to build community.",
      link: "/moderator/blog-post",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "text-green-500",
    },
    {
      id: 2,
      category: "Customers List",
      content: "Customers who want to reach out you.",
      link: "/moderator/customers-list",
      icon: <Users className="h-5 w-5" />,
      color: "text-red-500",
    },
       {
      id: 3,
      category: "Booker List",
      content: "Customers who want to book room.",
      link: "/moderator/booker-list",
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-500",
    },
  ];

  return (
    <section className="relative py-12 sm:py-16 md:py-24 px-4 md:px-8 lg:px-16 min-h-screen">
      {/* Background pattern - removed opacity class */}
      <div className="absolute inset-0 bg-grid"></div>

      {/* Removed gradient overlay div */}

      <div className="container mx-auto relative z-10">
        {/* Section Header with responsive font sizes */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Engage with Your Community
          </h2>
          <p className="text-base sm:text-lg max-w-2xl mx-auto font-medium">
            Choose your post type and start building meaningful connections
          </p>
        </div>

        {/* Responsive grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {moderatorFunction.map((post) => (
            <Card
              key={post.id}
              className="group border hover:border-gray-700 transition-all duration-300 hover:shadow-xl"
            >
              <CardContent className="p-5 sm:p-6 md:p-7">
                {/* Icon Container - removed background color */}
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5 transition-transform group-hover:scale-110 duration-300 border">
                  <div className={post.color}>{post.icon}</div>
                </div>

                {/* Content with improved typography */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-lg font-semibold ${post.color}`}>
                      {post.category}
                    </h3>
                  </div>

                  <p className="text-sm sm:text-base leading-relaxed">
                    {post.content}
                  </p>

                  <div className="pt-3">
                    <Button
                      asChild
                      variant="outline"
                      className="group/btn w-full justify-between border-gray-700 hover:border-gray-600 transition-all duration-300 text-sm sm:text-base"
                    >
                      <Link
                        href={post.link}
                        className="flex items-center justify-between w-full py-2"
                      >
                        <span className="font-medium">Visit Page</span>
                        <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-all" />
                      </Link>
                    </Button>

                    {/* Removed background from hover indicator */}
                    <div className="mt-3 h-0.5 w-0 group-hover:w-full transition-all duration-500"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Moderator;