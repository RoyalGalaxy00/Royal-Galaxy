"use client"
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <main className=" h-screen w-full flex flex-col  items-center justify-center  px-6 ">
      {/* <Image
        src="../app/public/not-found.svg"
        alt="404 error"
        width={500}
        height={500}
        className="mb-8"
      /> */}
      <h2 className="text-2xl font-bold  mb-4">Page Not Found</h2>
      <p className=" mb-8">The page you are looking for does not exist.</p>
      <Button variant="outline">
        <Link href="/" className="text-lg ">
          Go back home
        </Link>
      </Button>
    </main>
  );
}