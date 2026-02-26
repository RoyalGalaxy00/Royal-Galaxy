"use client";

import React, { useTransition } from "react";
import { postInfo } from "@/app/actions/commentActions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Exo_2 } from "next/font/google";
import AOSInit from "@/components/ui/AOS";
import { MapPin, Phone, Mail, MessageSquare, Send, ArrowRight } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CapF } from "@/utils/firstUpper";
import { useUser } from "@clerk/nextjs";
import CTA from "@/components/ui/CTA";

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
  contactHover: "#1a2e1a", // dark forest green on hover for contact cards
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

// ── Validation ────────────────────────────────────────────────────────────
const formSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits"),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .min(1, "Email is required"),
  message: z.string().trim().min(10, "Message must be at least 10 characters"),
});

type FormValues = z.infer<typeof formSchema>;

// ── Contact info items ────────────────────────────────────────────────────
const contactItems = [
  {
    icon: MapPin,
    label: "Find Us",
    value: "Bharatpur, Chitwan, Nepal",
    sub: "Royal Galaxy Hotel & Lodge",
    href: "https://maps.google.com",
  },
  {
    icon: Mail,
    label: "Write to Us",
    value: "royalgalaxy@gmail.com",
    sub: "We reply within 24 hours",
    href: "mailto:info@royalgalaxy.com.np",
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+977 56-123456",
    sub: "Daily  7 AM – 10 PM",
    href: "tel:+97756123456",
  },
];

export default function ContactPage() {
  const { user, isSignedIn } = useUser();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      message: "",
    },
  });

  async function onSubmit(values: FormValues) {
    const contactData = {
      firstName: CapF(values.firstName.trim()),
      lastName: CapF(values.lastName.trim()),
      phone: values.phone.trim(),
      email: values.email.trim(),
      message: CapF(values.message.trim()),
      userId: user?.id,
      Sender_email: user?.primaryEmailAddress?.emailAddress,
      Sender_name: user?.fullName,
      collection: "ContactInfo",
      Sender_avatar: user?.imageUrl,
    };

    startTransition(async () => {
      try {
        if (!isSignedIn || !user) {
          toast.error("Please sign in to continue");
          return;
        }
        const result = await postInfo(contactData);
        if (result?.success) {
          toast.success("Message sent successfully!");
          form.reset();
        } else {
          toast.error(result?.error || "Something went wrong");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to send message");
      }
    });
  }

  return (
    <>
      <AOSInit />
      <div
        className={`${exo2.variable} min-h-screen`}
        style={{ background: C.bg, color: C.navy }}
      >
        {/* ── TOP GOLD LINE ────────────────────────────────────────────── */}
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.goldLight}, ${C.gold}, transparent)`,
          }}
        />

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden flex flex-col items-center justify-center text-center"
          style={{
            background: C.hero,
            paddingTop: "clamp(72px, 12vw, 140px)",
            paddingBottom: "clamp(72px, 12vw, 140px)",
            minHeight: 420,
          }}
        >
          {/* Decorative rings */}
          {[280, 480, 680].map((size, i) => (
            <div
              key={size}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: size,
                height: size,
                borderRadius: "50%",
                border: `1px solid ${C.gold}${i === 0 ? "22" : i === 1 ? "14" : "0a"}`,
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            />
          ))}

          {/* Content */}
          <div className="relative z-10 px-5 max-w-2xl mx-auto">
            {/* Eyebrow */}
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

            {/* Main headline */}
            <h1
              data-aos="fade-up"
              data-aos-duration="800"
              data-aos-delay="100"
              style={{
                ...EXO,
                fontWeight: 300,
                fontSize: "clamp(40px, 7vw, 76px)",
                lineHeight: 1.06,
                color: "#fff",
                letterSpacing: "-0.01em",
              }}
            >
              Ask Us{" "}
              <em
                style={{
                  color: C.goldLight,
                  fontStyle: "italic",
                  fontWeight: 300,
                }}
              >
                Anything
              </em>
            </h1>

            {/* Sub */}
            <p
              data-aos="fade-up"
              data-aos-duration="800"
              data-aos-delay="220"
              style={{
                ...EXO,
                fontWeight: 300,
                fontSize: 17,
                color: `white`,
                marginTop: 18,
                lineHeight: 1.75,
              }}
            >
              Whether you're planning a stay, celebrating an occasion, or simply
              curious — our team is here to make it extraordinary.
            </p>
          </div>

          {/* Wave out */}
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
            <path
              d="M0,56 C480,0 960,0 1440,56 L1440,56 L0,56 Z"
              fill={C.bg}
            />
          </svg>
        </section>

        {/* ── CONTACT INFO STRIP ───────────────────────────────────────── */}
        <section
          className="container mx-auto px-5"
          style={{ paddingTop: 40, paddingBottom: 40 }}
        >
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-px"
            style={{ border: `1px solid ${C.border}`, background: C.border }}
          >
            {contactItems.map(({ icon: Icon, label, value, sub, href }, i) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-delay={String(i * 100)}
                className="group flex items-start gap-4 p-6 transition-all duration-300"
                style={{
                  background: C.cardBg,
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = C.contactHover;
                  // flip text colours on hover
                  el.querySelectorAll("[data-label]").forEach((n) => {
                    (n as HTMLElement).style.color = `${C.gold}99`;
                  });
                  el.querySelectorAll("[data-value]").forEach((n) => {
                    (n as HTMLElement).style.color = C.cream;
                  });
                  el.querySelectorAll("[data-sub]").forEach((n) => {
                    (n as HTMLElement).style.color = `${C.cream}70`;
                  });
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = C.cardBg;
                  el.querySelectorAll("[data-label]").forEach((n) => {
                    (n as HTMLElement).style.color = C.muted;
                  });
                  el.querySelectorAll("[data-value]").forEach((n) => {
                    (n as HTMLElement).style.color = C.navy;
                  });
                  el.querySelectorAll("[data-sub]").forEach((n) => {
                    (n as HTMLElement).style.color = C.muted;
                  });
                }}
              >
                {/* Icon circle */}
                <div
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: `1px solid ${C.gold}40`,
                    background: `${C.gold}0f`,
                  }}
                >
                  <Icon size={18} style={{ color: C.gold }} />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p
                    data-label
                    style={{ ...EYEBROW, color: C.muted, marginBottom: 4, transition: "color 0.3s" }}
                  >
                    {label}
                  </p>
                  <p
                    data-value
                    style={{
                      ...EXO,
                      fontWeight: 600,
                      fontSize: 14,
                      color: C.navy,
                      wordBreak: "break-word",
                      transition: "color 0.3s",
                    }}
                  >
                    {value}
                  </p>
                  <p
                    data-sub
                    style={{
                      ...EXO,
                      fontSize: 12,
                      color: C.muted,
                      marginTop: 2,
                      transition: "color 0.3s",
                    }}
                  >
                    {sub}
                  </p>
                </div>

                {/* Arrow */}
                <ArrowRight
                  size={14}
                  className="flex-shrink-0 mt-1 transition-transform group-hover:translate-x-1"
                  style={{ color: `${C.gold}60` }}
                />
              </a>
            ))}
          </div>
        </section>

        {/* ── FORM + MAP ────────────────────────────────────────────────── */}
        <section className="container mx-auto px-5 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">

            {/* ── FORM ─────────────────────────────────────────────────── */}
            <div
              data-aos="fade-right"
              data-aos-duration="700"
              data-aos-delay="100"
              className="border"
              style={{ background: C.cardBg, borderColor: C.border }}
            >
              {/* Form header */}
              <div
                className="px-8 py-6 border-b"
                style={{ borderColor: C.border }}
              >
                <p style={{ ...EYEBROW, color: C.gold, marginBottom: 8 }}>
                  Send a Message
                </p>
                <h2
                  style={{
                    ...EXO,
                    fontWeight: 600,
                    fontSize: 22,
                    color: C.navy,
                  }}
                >
                  Get in Touch
                </h2>
                <p
                  style={{
                    ...EXO,
                    fontSize: 14,
                    color: C.muted,
                    marginTop: 4,
                  }}
                >
                  We typically respond within a few hours.
                </p>
              </div>

              {/* Form body */}
              <div className="px-8 py-8">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Name row */}
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
                                style={{
                                  ...EXO,
                                  background: "transparent",
                                  borderColor: C.border,
                                  borderRadius: 0,
                                  color: C.navy,
                                }}
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
                                style={{
                                  ...EXO,
                                  background: "transparent",
                                  borderColor: C.border,
                                  borderRadius: 0,
                                  color: C.navy,
                                }}
                                className="focus-visible:ring-0 focus-visible:border-[#b8943f]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage style={{ ...EXO, fontSize: 12 }} />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Phone */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                            Phone
                          </FormLabel>
                          <FormControl>
                            <div
                              className="flex items-center focus-within:border-[#b8943f] transition-colors"
                              style={{
                                border: `1px solid ${C.border}`,
                                background: "transparent",
                              }}
                            >
                              <div
                                className="flex items-center px-3 self-stretch border-r"
                                style={{ borderColor: C.border }}
                              >
                                <Phone size={14} style={{ color: C.gold }} />
                              </div>
                              <Input
                                type="tel"
                                placeholder="+977 56-123456"
                                style={{
                                  ...EXO,
                                  background: "transparent",
                                  border: "none",
                                  borderRadius: 0,
                                  color: C.navy,
                                }}
                                className="focus-visible:ring-0 border-0 shadow-none"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage style={{ ...EXO, fontSize: 12 }} />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                            Email
                          </FormLabel>
                          <FormControl>
                            <div
                              className="flex items-center focus-within:border-[#b8943f] transition-colors"
                              style={{
                                border: `1px solid ${C.border}`,
                                background: "transparent",
                              }}
                            >
                              <div
                                className="flex items-center px-3 self-stretch border-r"
                                style={{ borderColor: C.border }}
                              >
                                <Mail size={14} style={{ color: C.gold }} />
                              </div>
                              <Input
                                type="email"
                                placeholder="sauravkumal077@gmail.com"
                                style={{
                                  ...EXO,
                                  background: "transparent",
                                  border: "none",
                                  borderRadius: 0,
                                  color: C.navy,
                                }}
                                className="focus-visible:ring-0 border-0 shadow-none"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage style={{ ...EXO, fontSize: 12 }} />
                        </FormItem>
                      )}
                    />

                    {/* Message */}
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                            Message
                          </FormLabel>
                          <FormControl>
                            <div
                              className="relative focus-within:border-[#b8943f] transition-colors"
                              style={{
                                border: `1px solid ${C.border}`,
                                background: "transparent",
                              }}
                            >
                              <MessageSquare
                                size={14}
                                style={{
                                  color: C.gold,
                                  position: "absolute",
                                  top: 14,
                                  left: 12,
                                  pointerEvents: "none",
                                }}
                              />
                              <Textarea
                                placeholder="Tell us about your stay, special requests, or any questions…"
                                style={{
                                  ...EXO,
                                  background: "transparent",
                                  border: "none",
                                  borderRadius: 0,
                                  color: C.navy,
                                  paddingLeft: 36,
                                  minHeight: 130,
                                  resize: "vertical",
                                }}
                                className="focus-visible:ring-0 border-0 shadow-none"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage style={{ ...EXO, fontSize: 12 }} />
                        </FormItem>
                      )}
                    />

                    {/* Submit row */}
                    <div className="flex items-center justify-between pt-2">
                      <p style={{ ...EXO, fontSize: 12, color: C.muted }}>
                        Sign in required to submit
                      </p>

                      <button
                        type="submit"
                        disabled={isPending}
                        className="group flex items-center gap-3 px-6 py-3 transition-all disabled:opacity-60"
                        style={{
                          background: C.navy,
                          color: C.cream,
                          ...EXO,
                          fontWeight: 600,
                          fontSize: 13,
                          letterSpacing: "0.06em",
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
                        {isPending ? (
                          <>
                            <span className="animate-spin inline-block">⏳</span>
                            Sending…
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send
                              size={14}
                              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </Form>
              </div>
            </div>

            {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-6">

              {/* Map */}
              <div
                data-aos="fade-left"
                data-aos-duration="700"
                data-aos-delay="150"
                className="border overflow-hidden"
                style={{ borderColor: C.border }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-3 border-b"
                  style={{ background: C.cardBg, borderColor: C.border }}
                >
                  <MapPin size={13} style={{ color: C.gold }} />
                  <span style={{ ...EYEBROW, color: C.navy, fontSize: 10 }}>
                    Bharatpur, Chitwan, Nepal
                  </span>
                </div>

                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3536.993901732425!2d84.07764327404679!3d27.562699731858917!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39944500739a8c99%3A0x34deed6c2aac5ac7!2sRoyal%20Galaxy%20Hotel%20%26%20Lodge!5e0!3m2!1sen!2snp!4v1771688405651!5m2!1sen!2snp"
                  style={{
                    width: "100%",
                    height: 280,
                    display: "block",
                    filter: "grayscale(0.5) contrast(1.05)",
                    border: "none",
                  }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Quote block */}
              <div
                data-aos="fade-left"
                data-aos-duration="700"
                data-aos-delay="250"
                className="border p-7 relative overflow-hidden"
                style={{ background: C.hero, borderColor: "#3a3a3a" }}
              >
                {/* Giant decorative quote mark */}
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    right: 20,
                    fontSize: 120,
                    lineHeight: 1,
                    color: `${C.gold}12`,
                    fontFamily: "Georgia, serif",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  "
                </div>

                <div
                  style={{
                    width: 28,
                    height: 1,
                    background: C.gold,
                    marginBottom: 16,
                  }}
                />

                <p
                  style={{
                    ...EXO,
                    fontWeight: 300,
                    fontStyle: "italic",
                    fontSize: 17,
                    color: C.cream,
                    lineHeight: 1.7,
                    marginBottom: 20,
                  }}
                >
                  "Every great stay begins with a single message. We look
                  forward to welcoming you to Chitwan."
                </p>

                <p style={{ ...EYEBROW, color: C.gold, fontSize: 10 }}>
                  The Royal Galaxy Team
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── BOTTOM GOLD LINE ─────────────────────────────────────────── */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${C.gold}60, transparent)`,
          }}
        />
      </div>
      <CTA />
    </>
  );
}