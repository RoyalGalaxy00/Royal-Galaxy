"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Exo_2 } from "next/font/google";
import AOSInit from "@/components/ui/AOS";
import Image from "next/image";
import {
  X,
  BedDouble,
  Users,
  Check,
  ArrowRight,
  Calendar,
  Clock,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { useUser } from "@clerk/nextjs";
import { CapF } from "@/utils/firstUpper";
import { toast } from "sonner";
import { postBookings } from "@/app/actions/commentActions";

// ── Font ──────────────────────────────────────────────────────────────────
const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-exo2",
});

// ── Palette ───────────────────────────────────────────────────────────────
const C = {
  bg: "#f0ebe0",
  hero: "#272727",
  navy: "#0e1a2e",
  navyMid: "#162440",
  gold: "#b8943f",
  goldLight: "#d4a853",
  cream: "rgb(236,224,196)",
  border: "#ddd5c4",
  cardBg: "#faf7f2",
  muted: "#8a7f6e",
} as const;

// ── Style tokens ──────────────────────────────────────────────────────────
const EXO: React.CSSProperties = { fontFamily: "var(--font-exo2)" };
const EYEBROW: React.CSSProperties = {
  fontFamily: "var(--font-exo2)",
  fontWeight: 500,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  fontSize: "11px",
  lineHeight: "20px",
};

// ── Room Data ─────────────────────────────────────────────────────────────
const rooms = [
  {
    _id: 1,
    name: "Standard Room",
    price: 400,
    image: "/bed1.jpg",
    description:
      "Cozy room with essential amenities for a comfortable stay. Perfect for solo travellers or couples.",
    maxAdults: 2,
    maxChildren: 0,
    amenities: [
      "Free WiFi",
      "Air Conditioning",
      "Flat-screen TV",
      "En-suite Bathroom",
    ],
  },
  {
    _id: 2,
    name: "Deluxe Room",
    price: 400,
    image: "/bed2.jpg",
    description:
      "Spacious room with premium furnishings, a garden view and enhanced in-room facilities.",
    maxAdults: 3,
    maxChildren: 0,
    amenities: [
      "Free WiFi",
      "Air Conditioning",
      "Mini Bar",
      "Flat-screen TV",
      "Room Service",
    ],
  },
  {
    _id: 3,
    name: "Executive Suite",
    price: 600,
    image: "/bed3.jpg",
    description:
      "Luxurious suite with a separate living area and sweeping panoramic views of Chitwan.",
    maxAdults: 4,
    maxChildren: 1,
    amenities: [
      "Free WiFi",
      "Air Conditioning",
      "Mini Bar",
      "Room Service",
      "Jacuzzi",
      "Balcony",
    ],
  },
  {
    _id: 4,
    name: "Family Room",
    price: 1000,
    image: "/bed4.jpg",
    description:
      "Perfect for families — interconnected rooms with kid-friendly amenities all included.",
    maxAdults: 4,
    maxChildren: 1,
    amenities: [
      "Free WiFi",
      "Air Conditioning",
      "Mini Bar",
      "Room Service",
      "Kids Club Access",
    ],
  },
  {
    _id: 5,
    name: "Family Suite",
    price: 1000,
    image: "/bed5.jpg",
    description:
      "Spacious family suite designed for 4 adults and 2 children with separate sleeping areas.",
    maxAdults: 4,
    maxChildren: 2,
    amenities: [
      "Free WiFi",
      "Air Conditioning",
      "Mini Bar",
      "Room Service",
      "Kids Club Access",
      "Play Area",
      "Baby Cot",
    ],
  },
  {
    _id: 6,
    name: "Presidential Suite",
    price: 1000,
    image: "/bed1.jpg",
    description:
      "Our finest accommodation with luxury amenities, butler service and exclusive access.",
    maxAdults: 6,
    maxChildren: 2,
    amenities: [
      "Free WiFi",
      "Air Conditioning",
      "Mini Bar",
      "Butler Service",
      "Jacuzzi",
      "Balcony",
      "Private Lounge",
    ],
  },
];

const nepalProvinces = [
  "Koshi",
  "Madhesh",
  "Bagmati",
  "Gandaki",
  "Lumbini",
  "Karnali",
  "Sudurpashchim",
];

// ── Validation Schema ─────────────────────────────────────────────────────
const formSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required"),
  lastName: z.string().trim().min(2, "Last name is required"),
  address: z.string().trim().min(4, "Address is required"),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(1, "Please select a province"),
  zipCode: z.string().trim().min(1, "Zip code is required"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .trim()
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number format"),
  email: z.string().trim().email("Invalid email address"),
  checkInDate: z.string().trim().min(1, "Check-in date is required"),
  checkInTime: z.string().trim().min(1, "Check-in time is required"),
  checkOutDate: z.string().trim().min(1, "Check-out date is required"),
  checkOutTime: z.string().trim().min(1, "Check-out time is required"),
  numberOfAdults: z.enum(["1", "2", "3", "4", "4+"]),
});

type FormValues = z.infer<typeof formSchema>;

// ── Shared input style helper ─────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  ...EXO,
  background: "transparent",
  borderRadius: 0,
  color: C.navy,
  fontSize: 14,
};

// ── Room Card ─────────────────────────────────────────────────────────────
function RoomCard({
  room,
  onBook,
  index,
}: {
  room: (typeof rooms)[0];
  onBook: (room: (typeof rooms)[0]) => void;
  index: number;
}) {
  return (
    <article
      className="group flex flex-col border overflow-hidden"
      style={{ background: C.cardBg, borderColor: C.border, borderRadius: 0 }}
      data-aos="fade-up"
      data-aos-duration="600"
      data-aos-delay={String(index * 80)}
    >
      <div className="relative w-full overflow-hidden" style={{ height: 220 }}>
        <Image
          src={room.image}
          alt={room.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(14,26,46,0.55) 0%, transparent 55%)",
          }}
        />
        <div
          className="absolute top-3 right-3 px-3 py-1"
          style={{
            background: C.navy,
            ...EYEBROW,
            color: C.gold,
            fontSize: 10,
          }}
        >
          Rs. {room.price.toLocaleString("en-NP")} / night
        </div>
        <div className="absolute bottom-0 left-0 px-5 pb-4">
          <h2
            style={{
              ...EXO,
              fontWeight: 300,
              fontSize: "1.2rem",
              letterSpacing: "0.04em",
              color: "#fff",
            }}
          >
            {room.name}
          </h2>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-4 mb-3">
          <span
            className="flex items-center gap-1.5"
            style={{ ...EXO, fontSize: 12, color: C.gold }}
          >
            <Users size={13} />
            {room.maxAdults} Adults
            {room.maxChildren > 0 ? `, ${room.maxChildren} Children` : ""}
          </span>
          <span
            className="flex items-center gap-1.5"
            style={{ ...EXO, fontSize: 12, color: C.muted }}
          >
            <BedDouble size={13} />
            {room.name.toLowerCase().includes("suite") ? "Suite" : "Room"}
          </span>
        </div>

        <p
          style={{
            ...EXO,
            fontSize: 13,
            lineHeight: 1.75,
            color: C.muted,
            marginBottom: 14,
          }}
        >
          {room.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {room.amenities.map((a) => (
            <span
              key={a}
              className="flex items-center gap-1 px-2 py-1"
              style={{
                ...EXO,
                fontSize: 10,
                letterSpacing: "0.06em",
                fontWeight: 500,
                color: C.navy,
                border: `1px solid ${C.border}`,
              }}
            >
              <Check size={9} style={{ color: C.gold }} />
              {a}
            </span>
          ))}
        </div>

        <button
          onClick={() => onBook(room)}
          className="group/btn mt-auto w-full flex items-center justify-center gap-2 py-3 transition-all"
          style={{
            background: C.navy,
            color: C.cream,
            ...EYEBROW,
            fontSize: 10,
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = C.gold)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = C.navy)
          }
        >
          Book This Room
          <ArrowRight
            size={12}
            className="transition-transform group-hover/btn:translate-x-1"
          />
        </button>
      </div>
    </article>
  );
}

// ── Booking Sheet ─────────────────────────────────────────────────────────
function BookingSheet({
  room,
  open,
  onClose,
}: {
  room: (typeof rooms)[0] | null;
  open: boolean;
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const { user, isSignedIn } = useUser();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      checkInDate: "",
      checkInTime: "",
      checkOutDate: "",
      checkOutTime: "",
      numberOfAdults: "1",
    },
  });

  const handleOpenChange = (o: boolean) => {
    if (!o) {
      setSubmitted(false);
      form.reset();
      onClose();
    }
  };

  async function onSubmit(values: FormValues) {
    if (!isSignedIn || !user) {
      toast.error("Please sign in to continue");
      return;
    }
    const BookerData = {
      firstName: CapF(values.firstName.trim()) as string,
      lastName: CapF(values.lastName.trim()) as string,
      address: CapF(values.address.trim()) as string,
      city: CapF(values.city.trim()) as string,
      state: CapF(values.state.trim()) as string,
      zipCode: CapF(values.zipCode.trim()) as string,
      phone: values.phone as string,
      email: values.email as string,
      checkInDate: values.checkInDate as string,
      checkInTime: values.checkInTime as string,
      checkOutDate: values.checkOutDate as string,
      checkOutTime: values.checkOutTime as string,
      numberOfGuests: values.numberOfAdults as string,
      room: room?.name as string,
      collection: "Bookings" as string,
      userId: user.id as string,
      Sender_email: user.primaryEmailAddress?.emailAddress as string,
      Sender_name: user.fullName as string,
      Sender_avatar: user.imageUrl as string,
    };

    startTransition(async () => {
      try {
        const result = await postBookings(BookerData);
        if (result?.success) {
          toast.success("Reservation sent successfully!");
          form.reset();
          setSubmitted(true);
        } else {
          toast.error(result?.error || "Something went wrong");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to send reservation");
      }
    });
  }

  const errors = form.formState.errors;
  const fieldStyle = (hasErr: boolean): React.CSSProperties => ({
    ...inputStyle,
    borderColor: hasErr ? "#ef4444" : C.border,
  });

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {/*
        KEY FIXES:
        1. `p-0 [&>button]:hidden` — removes all default SheetContent padding
           and hides shadcn's auto-generated X button so ours is the only one.
        2. The entire SheetContent background is set to C.hero (dark) so the
           rounded-t-2xl corners are dark — no light gap between the edge and
           the header bar.
        3. The handle pill and SheetHeader sit directly one after the other
           with pb-0 on the handle and no margin in between — zero gap.
        4. SheetTitle + SheetDescription live inside <SheetHeader> for correct
           ARIA wiring (aria-labelledby / aria-describedby).
      */}
      <SheetContent
        side="bottom"
        className="max-h-[92vh] overflow-y-auto rounded-t-2xl p-0 [&>button]:hidden"
        style={{
          background: C.hero,
          borderColor: C.border,
          fontFamily: "var(--font-exo2)",
        }}
      >
        {/* ── HANDLE — sits inside the dark hero area, no gap below ── */}
        <div className="flex justify-center pt-3 pb-0">
          <div
            style={{
              width: 44,
              height: 4,
              borderRadius: 9999,
              background: "rgba(255,255,255,0.18)",
            }}
          />
        </div>

        {/* ── STICKY HEADER — immediately below handle, no spacing ─── */}
        <SheetHeader
          className="sticky top-0 z-10 px-6 pt-4 pb-5 border-b flex-row items-start justify-between space-y-0"
          style={{ background: C.hero, borderColor: "#3a3a3a" }}
        >
          <div>
            <p style={{ ...EYEBROW, color: C.gold, marginBottom: 4 }}>
              Make a Reservation
            </p>
            <SheetTitle
              style={{
                ...EXO,
                fontWeight: 300,
                fontSize: 22,
                color: "#fff",
                letterSpacing: "0.04em",
              }}
            >
              {room?.name ?? ""}
            </SheetTitle>
            {room && (
              <SheetDescription
                style={{
                  ...EXO,
                  color: `${C.cream}70`,
                  fontSize: 13,
                  marginTop: 2,
                }}
              >
                Rs. {room.price.toLocaleString("en-NP")} / night ·{" "}
                {room.maxAdults} Adults
                {room.maxChildren > 0 ? `, ${room.maxChildren} Children` : ""}
              </SheetDescription>
            )}
          </div>
          <SheetClose className="text-white/50 hover:text-white transition-colors mt-1 shrink-0">
            <X size={18} />
          </SheetClose>
        </SheetHeader>

        {/* ── SCROLLABLE BODY — switches to light cardBg ────────────── */}
        <div style={{ background: C.cardBg }}>
          <div className="max-w-2xl mx-auto px-6 py-8">
            {/* ── SUCCESS ─────────────────────────────────────────────── */}
            {submitted ? (
              <div className="flex flex-col items-center text-center py-12 gap-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: `${C.gold}18`,
                    border: `1px solid ${C.gold}40`,
                  }}
                >
                  <Check size={24} style={{ color: C.gold }} />
                </div>
                <div style={{ width: 28, height: 1, background: C.gold }} />
                <h3
                  style={{
                    ...EXO,
                    fontWeight: 300,
                    fontSize: 24,
                    color: C.navy,
                    letterSpacing: "0.04em",
                  }}
                >
                  Reservation Received
                </h3>
                <p
                  style={{
                    ...EXO,
                    fontSize: 14,
                    color: C.muted,
                    lineHeight: 1.8,
                    maxWidth: 380,
                  }}
                >
                  Thank you for choosing Royal Galaxy. We'll contact you shortly
                  to confirm your booking for{" "}
                  <span style={{ color: C.navy, fontWeight: 600 }}>
                    {room?.name}
                  </span>
                  .
                </p>
                <button
                  onClick={() => handleOpenChange(false)}
                  className="mt-4 px-8 py-3 transition-all"
                  style={{
                    background: C.navy,
                    color: C.cream,
                    ...EYEBROW,
                    fontSize: 10,
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = C.gold)
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background = C.navy)
                  }
                >
                  Close
                </button>
              </div>
            ) : (
              /* ── FORM ─────────────────────────────────────────────── */
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                  noValidate
                >
                  <p style={{ ...EYEBROW, color: C.gold }}>Guest Details</p>

                  {/* Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                            First Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Saurav"
                              style={fieldStyle(!!errors.firstName)}
                              className="focus-visible:ring-0 focus-visible:border-[#b8943f]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage style={{ ...EXO, fontSize: 12 }} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                            Last Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Kumal"
                              style={fieldStyle(!!errors.lastName)}
                              className="focus-visible:ring-0 focus-visible:border-[#b8943f]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage style={{ ...EXO, fontSize: 12 }} />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Address */}
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                          Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Street address"
                            style={fieldStyle(!!errors.address)}
                            className="focus-visible:ring-0 focus-visible:border-[#b8943f]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage style={{ ...EXO, fontSize: 12 }} />
                      </FormItem>
                    )}
                  />

                  {/* City / Province / Zip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                            City
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Bharatpur"
                              style={fieldStyle(!!errors.city)}
                              className="focus-visible:ring-0 focus-visible:border-[#b8943f]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage style={{ ...EXO, fontSize: 12 }} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                            Province
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger
                                style={{
                                  ...EXO,
                                  background: "transparent",
                                  borderColor: errors.state
                                    ? "#ef4444"
                                    : C.border,
                                  borderRadius: 0,
                                  color: C.navy,
                                  fontSize: 14,
                                }}
                                className="focus:ring-0 focus:border-[#b8943f]"
                              >
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent
                              style={{
                                background: C.cardBg,
                                borderColor: C.border,
                                borderRadius: 0,
                              }}
                            >
                              {nepalProvinces.map((p) => (
                                <SelectItem
                                  key={p}
                                  value={p}
                                  style={{
                                    ...EXO,
                                    color: C.navy,
                                    fontSize: 13,
                                  }}
                                >
                                  {p}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage style={{ ...EXO, fontSize: 12 }} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                            Zip Code
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="44200"
                              style={fieldStyle(!!errors.zipCode)}
                              className="focus-visible:ring-0 focus-visible:border-[#b8943f]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage style={{ ...EXO, fontSize: 12 }} />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                            Phone
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="9876543210"
                              style={fieldStyle(!!errors.phone)}
                              className="focus-visible:ring-0 focus-visible:border-[#b8943f]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage style={{ ...EXO, fontSize: 12 }} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@example.com"
                              style={fieldStyle(!!errors.email)}
                              className="focus-visible:ring-0 focus-visible:border-[#b8943f]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage style={{ ...EXO, fontSize: 12 }} />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator style={{ background: C.border }} />
                  <p style={{ ...EYEBROW, color: C.gold }}>Stay Details</p>

                  {/* Check-in */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="checkInDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                            <span className="flex items-center gap-1.5">
                              <Calendar size={11} style={{ color: C.gold }} />
                              Check-in Date
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              style={fieldStyle(!!errors.checkInDate)}
                              className="focus-visible:ring-0 focus-visible:border-[#b8943f]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage style={{ ...EXO, fontSize: 12 }} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="checkInTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                            <span className="flex items-center gap-1.5">
                              <Clock size={11} style={{ color: C.gold }} />
                              Check-in Time
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              style={fieldStyle(!!errors.checkInTime)}
                              className="focus-visible:ring-0 focus-visible:border-[#b8943f]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage style={{ ...EXO, fontSize: 12 }} />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Check-out */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="checkOutDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                            <span className="flex items-center gap-1.5">
                              <Calendar size={11} style={{ color: C.gold }} />
                              Check-out Date
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              style={fieldStyle(!!errors.checkOutDate)}
                              className="focus-visible:ring-0 focus-visible:border-[#b8943f]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage style={{ ...EXO, fontSize: 12 }} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="checkOutTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                            <span className="flex items-center gap-1.5">
                              <Clock size={11} style={{ color: C.gold }} />
                              Check-out Time
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="time"
                              style={fieldStyle(!!errors.checkOutTime)}
                              className="focus-visible:ring-0 focus-visible:border-[#b8943f]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage style={{ ...EXO, fontSize: 12 }} />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Number of Guests */}
                  <FormField
                    control={form.control}
                    name="numberOfAdults"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                          Number of Guests
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-wrap gap-3 pt-1"
                          >
                            {["1", "2", "3", "4", "4+"].map((num) => (
                              <div
                                key={num}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={num}
                                  id={`guest-${num}`}
                                  style={{ borderColor: C.gold, color: C.gold }}
                                />
                                <label
                                  htmlFor={`guest-${num}`}
                                  style={{
                                    ...EXO,
                                    fontSize: 13,
                                    color: C.navy,
                                    cursor: "pointer",
                                  }}
                                >
                                  {num}
                                </label>
                              </div>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage style={{ ...EXO, fontSize: 12 }} />
                      </FormItem>
                    )}
                  />

                  {/* Submit */}
                  <SheetFooter className="pt-2">
                    <SheetClose asChild>
                      <button
                        type="button"
                        style={{
                          ...EXO,
                          background: "transparent",
                          border: `1px solid ${C.border}`,
                          color: C.navy,
                          padding: "10px 24px",
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: "pointer",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Cancel
                      </button>
                    </SheetClose>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="flex-1 py-3 transition-all disabled:opacity-60"
                      style={{
                        background: C.navy,
                        color: C.cream,
                        ...EYEBROW,
                        fontSize: 10,
                        border: "none",
                        cursor: isPending ? "not-allowed" : "pointer",
                      }}
                      onMouseEnter={(e) => {
                        if (!isPending)
                          (e.currentTarget as HTMLElement).style.background =
                            C.gold;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          C.navy;
                      }}
                    >
                      {isPending ? "Submitting…" : "Confirm Reservation"}
                    </button>
                  </SheetFooter>
                </form>
              </Form>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function BookPage() {
  const [selectedRoom, setSelectedRoom] = useState<(typeof rooms)[0] | null>(
    null,
  );

  return (
    <>
      <AOSInit />
      <div
        className={`${exo2.variable} min-h-screen`}
        style={{ background: C.bg, color: C.navy }}
      >
        {/* ── TOP GOLD LINE ──────────────────────────────────────────── */}
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.goldLight}, ${C.gold}, transparent)`,
          }}
        />

        {/* ── HERO ───────────────────────────────────────────────────── */}
        <section
          className="relative flex flex-col items-center justify-center text-center overflow-hidden"
          style={{
            background: C.hero,
            minHeight: "clamp(360px, 55vw, 520px)",
            paddingTop: "clamp(72px, 12vw, 140px)",
            paddingBottom: "clamp(72px, 12vw, 140px)",
          }}
        >
          {[260, 460, 660].map((size, i) => (
            <div
              key={size}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: size,
                height: size,
                borderRadius: "50%",
                border: `1px solid ${C.gold}${i === 0 ? "20" : i === 1 ? "12" : "08"}`,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            />
          ))}

          <div className="relative z-10 px-5">
            <div
              className="flex items-center justify-center gap-3 mb-6"
              data-aos="fade-down"
              data-aos-duration="700"
            >
              <div style={{ width: 28, height: 1, background: C.gold }} />
              <span style={{ ...EYEBROW, color: C.gold }}>
                Royal Galaxy Hotel &amp; Lodge
              </span>
              <div style={{ width: 28, height: 1, background: C.gold }} />
            </div>

            <h1
              data-aos="fade-up"
              data-aos-duration="800"
              data-aos-delay="100"
              style={{
                ...EXO,
                fontWeight: 300,
                fontSize: "clamp(38px, 6vw, 72px)",
                lineHeight: 1.08,
                color: "#fff",
                letterSpacing: "0.04em",
              }}
            >
              Reserve Your{" "}
              <em
                style={{
                  color: C.goldLight,
                  fontStyle: "italic",
                  fontWeight: 300,
                }}
              >
                Stay
              </em>
            </h1>

            <p
              data-aos="fade-up"
              data-aos-duration="800"
              data-aos-delay="220"
              style={{
                ...EXO,
                fontWeight: 300,
                fontStyle: "italic",
                fontSize: 17,
                color: `white`,
                marginTop: 14,
                letterSpacing: "0.04em",
              }}
            >
              Sauraha, Chitwan · Nepal
            </p>
          </div>

          <svg
            viewBox="0 0 1440 56"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              display: "block",
            }}
            preserveAspectRatio="none"
          >
            <path d="M0,56 C480,0 960,0 1440,56 L1440,56 L0,56 Z" fill={C.bg} />
          </svg>
        </section>

        {/* ── INTRO ──────────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto text-center px-5 pt-14 pb-8">
          <p
            style={{ ...EYEBROW, color: C.gold }}
            className="mb-3"
            data-aos="fade-up"
            data-aos-duration="600"
          >
            Our Accommodations
          </p>
          <h2
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="80"
            style={{
              ...EXO,
              fontWeight: 300,
              fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
              color: C.navy,
              letterSpacing: "0.04em",
              lineHeight: 1.3,
            }}
            className="mb-4"
          >
            Choose Your{" "}
            <em style={{ color: C.gold, fontStyle: "italic", fontWeight: 300 }}>
              Perfect Room
            </em>
          </h2>
          <p
            data-aos="fade-up"
            data-aos-duration="600"
            data-aos-delay="160"
            style={{ ...EXO, fontSize: 14, lineHeight: 1.85, color: C.muted }}
          >
            From cozy standard rooms to our magnificent presidential suite,
            every space at Royal Galaxy is crafted for comfort and luxury.
            Select a room below and complete your reservation in minutes.
          </p>
        </section>

        {/* ── ROOM GRID ──────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map((room, i) => (
              <RoomCard
                key={room._id}
                room={room}
                onBook={setSelectedRoom}
                index={i}
              />
            ))}
          </div>
        </section>

        {/* ── BOTTOM GOLD LINE ───────────────────────────────────────── */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${C.gold}60, transparent)`,
          }}
        />
      </div>

      <BookingSheet
        room={selectedRoom}
        open={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />
    </>
  );
}
