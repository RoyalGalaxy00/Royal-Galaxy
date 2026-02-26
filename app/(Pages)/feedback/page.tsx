"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Exo_2 } from "next/font/google";
import AOSInit from "@/components/ui/AOS";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import {
  Star,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Send,
  MessageSquareQuote,
  BadgeCheck,
  ChevronDown,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getFeedbacks,
  postFeedback,
  deleteFeedback,
  type FeedbackEntry,
} from "@/app/actions/feedbackActions";

// ── Font ──────────────────────────────────────────────────────────────────
const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-exo2",
});

// ── Palette ───────────────────────────────────────────────────────────────
const C = {
  bg: "#f2ede1",
  hero: "#272727",           // ← matches Contact page
  navy: "#1a2e2e",
  navyMid: "#223a3a",
  teal: "#0a7a7b",
  tealLight: "#0d9192",
  gold: "#b8943f",           // ← gold accent like Contact page
  goldLight: "#d4a853",
  cream: "rgb(221,211,188)",
  border: "#ddd5c4",
  cardBg: "#faf7f2",
  muted: "#6b7a6b",
  white: "#ffffff",
} as const;

const EXO: React.CSSProperties = { fontFamily: "var(--font-exo2)" };
const EYEBROW: React.CSSProperties = {
  fontFamily: "var(--font-exo2)",
  fontWeight: 500,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  fontSize: "11px",
  lineHeight: "20px",
};

// ── Constants ─────────────────────────────────────────────────────────────
const ROOM_OPTIONS = [
  "Standard Room",
  "Deluxe Room",
  "Executive Suite",
  "Family Room",
  "Family Suite",
  "Presidential Suite",
];

const MONTH_OPTIONS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TRAVEL_OPTIONS = [
  "Solo Traveller",
  "Couple",
  "Family with Children",
  "Group of Friends",
  "Business Travel",
];

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

// ── Zod Schema ────────────────────────────────────────────────────────────
const feedbackSchema = z.object({
  roomStayed: z.string().min(1, "Please select the room you stayed in"),
  checkInMonth: z.string().min(1, "Please select the month of your stay"),
  travelType: z.string().min(1, "Please select your travel type"),
  ratingOverall: z.number().min(1, "Please rate your overall experience").max(5),
  ratingCleanliness: z.number().min(1, "Please rate cleanliness").max(5),
  ratingService: z.number().min(1, "Please rate the service").max(5),
  ratingFood: z.number().min(1, "Please rate the food").max(5),
  ratingValue: z.number().min(1, "Please rate value for money").max(5),
  ratingLocation: z.number().min(1, "Please rate the location").max(5),
  title: z.string().trim().min(4, "Please write a short title"),
  body: z.string().trim().min(20, "Please write at least 20 characters"),
  wouldRecommend: z.boolean(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

// ── Star Picker ───────────────────────────────────────────────────────────
function StarPicker({
  value,
  onChange,
  error,
}: {
  value: number;
  onChange: (v: number) => void;
  error?: boolean;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              color: filled ? "#d4a853" : error ? "#ef444440" : C.border,
              transition: "color 0.15s, transform 0.1s",
              transform: hovered === star ? "scale(1.2)" : "scale(1)",
            }}
          >
            <Star
              size={22}
              fill={filled ? "#d4a853" : "none"}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
      {value > 0 && (
        <span
          style={{
            ...EXO,
            fontSize: 12,
            color: C.teal,
            marginLeft: 6,
            fontWeight: 600,
          }}
        >
          {RATING_LABELS[value]}
        </span>
      )}
    </div>
  );
}

// ── Rating Display (read-only) ────────────────────────────────────────────
function RatingStars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          fill={s <= value ? "#d4a853" : "none"}
          strokeWidth={1.5}
          style={{ color: s <= value ? "#d4a853" : C.border }}
        />
      ))}
    </div>
  );
}

// ── Average of ratings ────────────────────────────────────────────────────
function avg(entries: FeedbackEntry[], key: keyof FeedbackEntry) {
  if (!entries.length) return 0;
  const total = entries.reduce((s, e) => s + (Number(e[key]) || 0), 0);
  return +(total / entries.length).toFixed(1);
}

// ── Feedback Card ─────────────────────────────────────────────────────────
function FeedbackCard({
  entry,
  canDelete,
  onDelete,
}: {
  entry: FeedbackEntry;
  canDelete: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className="flex flex-col border"
      style={{
        background: C.cardBg,
        borderColor: C.border,
        borderRadius: 0,
      }}
      data-aos="fade-up"
      data-aos-duration="500"
    >
      {/* Top bar — overall rating */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{ background: C.navy, borderColor: "#1e3535" }}
      >
        <div className="flex items-center gap-2">
          <RatingStars value={entry.ratingOverall} size={13} />
          <span
            style={{
              ...EXO,
              fontSize: 12,
              fontWeight: 600,
              color: "#d4a853",
            }}
          >
            {RATING_LABELS[entry.ratingOverall] ?? "—"}
          </span>
        </div>
        <span
          style={{
            ...EYEBROW,
            fontSize: 9,
            color: "rgba(221,211,188,0.40)",
          }}
        >
          {entry.roomStayed}
        </span>
      </div>

      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Author */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {entry.Sender_avatar ? (
              <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={entry.Sender_avatar}
                  alt={entry.Sender_name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: C.navy, color: C.cream }}
              >
                <span style={{ ...EXO, fontWeight: 700, fontSize: 14 }}>
                  {entry.Sender_name?.[0]?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-1.5">
                <p style={{ ...EXO, fontWeight: 600, fontSize: 14, color: C.navy }}>
                  {entry.Sender_name}
                </p>
                <BadgeCheck size={13} style={{ color: C.teal }} />
              </div>
              <p style={{ ...EXO, fontSize: 11, color: C.muted }}>
                {entry.travelType} · {entry.checkInMonth}
              </p>
            </div>
          </div>

          {/* Recommend badge */}
          <div
            className="flex items-center gap-1 px-2 py-1 flex-shrink-0"
            style={{
              background: entry.wouldRecommend ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${entry.wouldRecommend ? "#bbf7d0" : "#fecaca"}`,
            }}
          >
            {entry.wouldRecommend ? (
              <>
                <ThumbsUp size={10} color="#16a34a" />
                <span style={{ ...EYEBROW, color: "#16a34a", fontSize: 8 }}>Recommends</span>
              </>
            ) : (
              <>
                <ThumbsDown size={10} color="#ef4444" />
                <span style={{ ...EYEBROW, color: "#ef4444", fontSize: 8 }}>Doesn't recommend</span>
              </>
            )}
          </div>
        </div>

        {/* Title + body */}
        <div>
          <p
            style={{
              ...EXO,
              fontWeight: 600,
              fontSize: 15,
              color: C.navy,
              marginBottom: 6,
              lineHeight: 1.3,
            }}
          >
            {entry.title}
          </p>
          <p
            style={{
              ...EXO,
              fontSize: 13,
              color: C.muted,
              lineHeight: 1.75,
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {entry.body}
          </p>
        </div>

        {/* Sub-ratings */}
        <div
          className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 border-t"
          style={{ borderColor: C.border }}
        >
          {[
            { label: "Cleanliness", val: entry.ratingCleanliness },
            { label: "Service", val: entry.ratingService },
            { label: "Food", val: entry.ratingFood },
            { label: "Value", val: entry.ratingValue },
            { label: "Location", val: entry.ratingLocation },
          ].map(({ label, val }) => (
            <div key={label} className="flex items-center justify-between">
              <span style={{ ...EXO, fontSize: 11, color: C.muted }}>{label}</span>
              <RatingStars value={val} size={10} />
            </div>
          ))}
        </div>

        {/* Date + delete */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: C.border }}>
          <span style={{ ...EYEBROW, color: C.muted, fontSize: 9 }}>
            {new Date(entry.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>

          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="flex items-center gap-1.5 px-2.5 py-1.5 transition-all"
                  style={{
                    background: "transparent",
                    border: "1px solid #ddd5c4",
                    color: C.muted,
                    cursor: "pointer",
                    ...EXO,
                    fontSize: 11,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "#fef2f2";
                    el.style.borderColor = "#fecaca";
                    el.style.color = "#ef4444";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.background = "transparent";
                    el.style.borderColor = "#ddd5c4";
                    el.style.color = C.muted;
                  }}
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent style={{ background: C.cardBg, borderColor: C.border, borderRadius: 0 }}>
                <AlertDialogHeader>
                  <AlertDialogTitle style={{ ...EXO, color: C.navy, fontWeight: 700 }}>
                    Delete this feedback?
                  </AlertDialogTitle>
                  <AlertDialogDescription style={{ ...EXO, color: C.muted, fontSize: 14 }}>
                    The review from{" "}
                    <span style={{ color: C.navy, fontWeight: 600 }}>{entry.Sender_name}</span>{" "}
                    will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    style={{
                      ...EXO,
                      borderColor: C.border,
                      color: C.navy,
                      background: "transparent",
                      borderRadius: 0,
                    }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(entry._id)}
                    style={{ ...EXO, background: "#ef4444", color: "#fff", borderRadius: 0, fontWeight: 600 }}
                    className="hover:bg-red-600"
                  >
                    Yes, delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function FeedbackPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const userRole = (user?.publicMetadata?.role as string) ?? "";
  const canDelete = isSignedIn && (userRole === "admin" || userRole === "moderator");

  useEffect(() => {
    (async () => {
      const result = await getFeedbacks();
      if (result.success && result.data) setFeedbacks(result.data);
      setLoadingFeedbacks(false);
    })();
  }, []);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      roomStayed: "",
      checkInMonth: "",
      travelType: "",
      ratingOverall: 0,
      ratingCleanliness: 0,
      ratingService: 0,
      ratingFood: 0,
      ratingValue: 0,
      ratingLocation: 0,
      title: "",
      body: "",
      wouldRecommend: true,
    },
  });

  const errors = form.formState.errors;

  const inputStyle: React.CSSProperties = {
    ...EXO,
    background: "transparent",
    borderRadius: 0,
    color: C.navy,
    fontSize: 14,
    borderColor: C.border,
  };

  async function onSubmit(values: FeedbackFormValues) {
    if (!isSignedIn || !user) {
      toast.error("Please sign in to leave feedback");
      return;
    }

    startTransition(async () => {
      const result = await postFeedback({
        ...values,
        userId: user.id,
        Sender_name: user.fullName ?? "Guest",
        Sender_email: user.primaryEmailAddress?.emailAddress ?? "",
        Sender_avatar: user.imageUrl ?? "",
        created_at: new Date().toISOString(),
      });

      if (result.success) {
        toast.success("Thank you for your feedback!");
        form.reset();
        setSubmitted(true);
        setFormOpen(false);
        const fresh = await getFeedbacks();
        if (fresh.success && fresh.data) setFeedbacks(fresh.data);
      } else {
        toast.error(result.error ?? "Failed to submit feedback");
      }
    });
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteFeedback(id);
      if (result.success) {
        toast.success("Feedback deleted");
        setFeedbacks((prev) => prev.filter((f) => f._id !== id));
      } else {
        toast.error(result.error ?? "Failed to delete feedback");
      }
    });
  };

  const totalReviews = feedbacks.length;
  const avgOverall = avg(feedbacks, "ratingOverall");
  const pctRecommend = totalReviews
    ? Math.round((feedbacks.filter((f) => f.wouldRecommend).length / totalReviews) * 100)
    : 0;

  return (
    <>
      <AOSInit />
      <main className={`${exo2.variable} bg-[#f2ede1] min-h-screen flex flex-col`}>

        {/* ── TOP GOLD LINE (matches Contact page) ────────────────────── */}
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.goldLight}, ${C.gold}, transparent)`,
          }}
        />

        {/* ── HERO ────────────────────────────────────────────────────── */}
        <section
          className="relative flex flex-col items-center justify-center text-center px-4 sm:px-8 overflow-hidden"
          style={{
            background: C.hero,
            paddingTop: "clamp(72px, 12vw, 140px)",
            paddingBottom: "clamp(72px, 12vw, 140px)",
            minHeight: "56vh",
          }}
        >
          {/* Decorative rings — gold tint like Contact page */}
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

          <div className="relative z-10">
            {/* Eyebrow with gold lines — mirrors Contact page */}
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
              data-aos-delay="100"
              data-aos-duration="800"
              style={{
                ...EXO,
                fontWeight: 300,
                fontSize: "clamp(2.2rem, 5.5vw, 76px)",
                lineHeight: 1.06,
                color: "#ffffff",
                letterSpacing: "-0.01em",
              }}
            >
              Guest{" "}
              <em style={{ fontStyle: "italic", color: C.goldLight, fontWeight: 300 }}>
                Reviews
              </em>
            </h1>

            <p
              data-aos="fade-up"
              data-aos-delay="220"
              data-aos-duration="800"
              style={{
                ...EXO,
                fontWeight: 300,
                fontSize: "clamp(14px, 1.5vw, 17px)",
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.85,
                maxWidth: 480,
                margin: "18px auto 28px",
              }}
            >
              Your honest feedback helps us improve and helps future guests make
              the right choice. We read every single review.
            </p>

            {/* Stats row */}
            {!loadingFeedbacks && totalReviews > 0 && (
              <div
                data-aos="fade-up"
                data-aos-delay="340"
                data-aos-duration="700"
                className="flex items-center justify-center gap-6 flex-wrap"
              >
                {[
                  { value: avgOverall.toString(), label: "Avg Rating" },
                  { value: totalReviews.toString(), label: "Total Reviews" },
                  { value: `${pctRecommend}%`, label: "Recommend" },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center px-5 py-3"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: `1px solid ${C.gold}22`,
                    }}
                  >
                    <span
                      style={{
                        ...EXO,
                        fontWeight: 300,
                        fontSize: 28,
                        color: C.cream,
                        lineHeight: 1,
                      }}
                    >
                      {value}
                    </span>
                    <span style={{ ...EYEBROW, color: `${C.gold}99`, fontSize: 9, marginTop: 4 }}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Wave — fills into page bg */}
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
            <path d="M0,56 C480,0 960,0 1440,56 L1440,56 L0,56 Z" fill="#f2ede1" />
          </svg>
        </section>

        {/* ── WRITE A REVIEW TOGGLE ────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto w-full px-4 sm:px-8 pt-12 pb-2">
          <div
            data-aos="fade-up"
            data-aos-duration="500"
            className="border"
            style={{ borderColor: C.border }}
          >
            {/* Toggle header */}
            <button
              onClick={() => setFormOpen((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-5 transition-all"
              style={{
                background: formOpen ? C.navy : C.cardBg,
                border: "none",
                cursor: "pointer",
              }}
            >
              <div className="flex items-center gap-3">
                <MessageSquareQuote
                  size={18}
                  style={{ color: formOpen ? "#d4a853" : C.teal }}
                />
                <span
                  style={{
                    ...EXO,
                    fontWeight: 600,
                    fontSize: 16,
                    color: formOpen ? "rgb(221,211,188)" : C.navy,
                    letterSpacing: "0.02em",
                  }}
                >
                  Write a Review
                </span>
                {!isSignedIn && isLoaded && (
                  <span
                    style={{
                      ...EYEBROW,
                      fontSize: 9,
                      color: formOpen ? "rgba(221,211,188,0.45)" : C.muted,
                    }}
                  >
                    Sign in required
                  </span>
                )}
              </div>
              <ChevronDown
                size={18}
                style={{
                  color: formOpen ? "rgba(255,255,255,0.50)" : C.muted,
                  transform: formOpen ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.25s",
                }}
              />
            </button>

            {/* Form body */}
            {formOpen && (
              <div
                className="px-6 py-8 border-t"
                style={{ background: C.cardBg, borderColor: C.border }}
              >
                {!isSignedIn ? (
                  <p style={{ ...EXO, fontSize: 14, color: C.muted, textAlign: "center", padding: "24px 0" }}>
                    Please sign in to leave a review.
                  </p>
                ) : submitted ? (
                  <div className="flex flex-col items-center text-center py-8 gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: `${C.teal}15`, border: `1px solid ${C.teal}35` }}
                    >
                      <Send size={20} style={{ color: C.teal }} />
                    </div>
                    <p style={{ ...EXO, fontWeight: 600, fontSize: 18, color: C.navy }}>
                      Thank you for your feedback!
                    </p>
                    <p style={{ ...EXO, fontSize: 13, color: C.muted }}>
                      Your review has been published.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      style={{
                        ...EYEBROW,
                        fontSize: 10,
                        marginTop: 8,
                        padding: "9px 22px",
                        background: C.navy,
                        color: C.cream,
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Write Another
                    </button>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7" noValidate>

                      {/* Auto-filled user info banner */}
                      <div
                        className="flex items-center gap-3 px-4 py-3"
                        style={{ background: `${C.teal}0d`, border: `1px solid ${C.teal}25` }}
                      >
                        {user?.imageUrl && (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            <Image src={user.imageUrl} alt={user.fullName ?? ""} fill className="object-cover" />
                          </div>
                        )}
                        <div>
                          <p style={{ ...EXO, fontSize: 13, fontWeight: 600, color: C.navy }}>
                            {user?.fullName}
                          </p>
                          <p style={{ ...EXO, fontSize: 11, color: C.muted }}>
                            {user?.primaryEmailAddress?.emailAddress}
                          </p>
                        </div>
                        <BadgeCheck size={14} style={{ color: C.teal, marginLeft: "auto" }} />
                      </div>

                      {/* Stay info row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="roomStayed"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ ...EYEBROW, color: C.muted }}>Room Stayed In</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger
                                    style={{
                                      ...EXO,
                                      background: "transparent",
                                      borderColor: errors.roomStayed ? "#ef4444" : C.border,
                                      borderRadius: 0,
                                      color: C.navy,
                                      fontSize: 14,
                                    }}
                                    className="focus:ring-0 focus:border-[#0a7a7b]"
                                  >
                                    <SelectValue placeholder="Select room" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent style={{ background: C.cardBg, borderColor: C.border, borderRadius: 0 }}>
                                  {ROOM_OPTIONS.map((r) => (
                                    <SelectItem key={r} value={r} style={{ ...EXO, color: C.navy, fontSize: 13 }}>
                                      {r}
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
                          name="checkInMonth"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ ...EYEBROW, color: C.muted }}>Month of Stay</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger
                                    style={{
                                      ...EXO,
                                      background: "transparent",
                                      borderColor: errors.checkInMonth ? "#ef4444" : C.border,
                                      borderRadius: 0,
                                      color: C.navy,
                                      fontSize: 14,
                                    }}
                                    className="focus:ring-0 focus:border-[#0a7a7b]"
                                  >
                                    <SelectValue placeholder="Select month" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent style={{ background: C.cardBg, borderColor: C.border, borderRadius: 0 }}>
                                  {MONTH_OPTIONS.map((m) => (
                                    <SelectItem key={m} value={m} style={{ ...EXO, color: C.navy, fontSize: 13 }}>
                                      {m}
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
                          name="travelType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel style={{ ...EYEBROW, color: C.muted }}>Travel Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger
                                    style={{
                                      ...EXO,
                                      background: "transparent",
                                      borderColor: errors.travelType ? "#ef4444" : C.border,
                                      borderRadius: 0,
                                      color: C.navy,
                                      fontSize: 14,
                                    }}
                                    className="focus:ring-0 focus:border-[#0a7a7b]"
                                  >
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent style={{ background: C.cardBg, borderColor: C.border, borderRadius: 0 }}>
                                  {TRAVEL_OPTIONS.map((t) => (
                                    <SelectItem key={t} value={t} style={{ ...EXO, color: C.navy, fontSize: 13 }}>
                                      {t}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage style={{ ...EXO, fontSize: 12 }} />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Ratings grid */}
                      <div>
                        <p style={{ ...EYEBROW, color: C.teal, marginBottom: 16 }}>Rate Your Stay</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {[
                            { name: "ratingOverall" as const, label: "Overall Experience" },
                            { name: "ratingCleanliness" as const, label: "Cleanliness" },
                            { name: "ratingService" as const, label: "Staff & Service" },
                            { name: "ratingFood" as const, label: "Food & Dining" },
                            { name: "ratingValue" as const, label: "Value for Money" },
                            { name: "ratingLocation" as const, label: "Location & Views" },
                          ].map(({ name, label }) => (
                            <FormField
                              key={name}
                              control={form.control}
                              name={name}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel style={{ ...EYEBROW, color: C.muted }}>{label}</FormLabel>
                                  <FormControl>
                                    <StarPicker
                                      value={field.value as number}
                                      onChange={field.onChange}
                                      error={!!errors[name]}
                                    />
                                  </FormControl>
                                  <FormMessage style={{ ...EXO, fontSize: 12 }} />
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Title */}
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ ...EYEBROW, color: C.muted }}>Review Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Summarise your stay in a few words…"
                                style={{
                                  ...inputStyle,
                                  borderColor: errors.title ? "#ef4444" : C.border,
                                }}
                                className="focus-visible:ring-0 focus-visible:border-[#0a7a7b]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage style={{ ...EXO, fontSize: 12 }} />
                          </FormItem>
                        )}
                      />

                      {/* Body */}
                      <FormField
                        control={form.control}
                        name="body"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ ...EYEBROW, color: C.muted }}>Your Review</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Tell others about your experience — what you loved, what could be improved…"
                                rows={5}
                                style={{
                                  ...inputStyle,
                                  borderColor: errors.body ? "#ef4444" : C.border,
                                  lineHeight: 1.7,
                                  resize: "vertical",
                                }}
                                className="focus-visible:ring-0 focus-visible:border-[#0a7a7b]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage style={{ ...EXO, fontSize: 12 }} />
                          </FormItem>
                        )}
                      />

                      {/* Would recommend */}
                      <FormField
                        control={form.control}
                        name="wouldRecommend"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel style={{ ...EYEBROW, color: C.muted }}>
                              Would you recommend Royal Galaxy?
                            </FormLabel>
                            <FormControl>
                              <div className="flex gap-3 pt-1">
                                {[
                                  { val: true, label: "Yes, I'd recommend", icon: <ThumbsUp size={13} /> },
                                  { val: false, label: "Not this time", icon: <ThumbsDown size={13} /> },
                                ].map(({ val, label, icon }) => {
                                  const active = field.value === val;
                                  return (
                                    <button
                                      key={String(val)}
                                      type="button"
                                      onClick={() => field.onChange(val)}
                                      className="flex items-center gap-2 px-4 py-2.5 transition-all"
                                      style={{
                                        ...EXO,
                                        fontSize: 13,
                                        background: active
                                          ? val ? `${C.teal}12` : "#fef2f230"
                                          : "transparent",
                                        border: `1px solid ${active ? (val ? C.teal : "#ef4444") : C.border}`,
                                        color: active ? (val ? C.teal : "#ef4444") : C.muted,
                                        cursor: "pointer",
                                        fontWeight: active ? 600 : 400,
                                      }}
                                    >
                                      {icon}
                                      {label}
                                    </button>
                                  );
                                })}
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Submit */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setFormOpen(false)}
                          style={{
                            ...EXO,
                            background: "transparent",
                            border: `1px solid ${C.border}`,
                            color: C.navy,
                            padding: "10px 22px",
                            fontSize: 12,
                            cursor: "pointer",
                            letterSpacing: "0.06em",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isPending}
                          className="flex items-center gap-2 flex-1 justify-center py-3 transition-all disabled:opacity-60"
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
                              (e.currentTarget as HTMLElement).style.background = C.gold;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = C.navy;
                          }}
                        >
                          <Send size={12} />
                          {isPending ? "Submitting…" : "Submit Review"}
                        </button>
                      </div>
                    </form>
                  </Form>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── REVIEWS SECTION ─────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto w-full px-4 sm:px-8 pt-10 pb-20">

          {/* Section header */}
          <div
            data-aos="fade-up"
            data-aos-duration="500"
            className="flex items-center gap-4 mb-8"
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${C.gold}44, transparent)`,
              }}
            />
            <p style={{ ...EYEBROW, color: `${C.gold}99` }}>
              {totalReviews > 0 ? `${totalReviews} Guest Review${totalReviews !== 1 ? "s" : ""}` : "Guest Reviews"}
            </p>
            <div
              style={{
                flex: 1,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${C.gold}44, transparent)`,
              }}
            />
          </div>

          {/* Aggregate rating bar */}
          {!loadingFeedbacks && totalReviews > 0 && (
            <div
              data-aos="fade-up"
              data-aos-duration="500"
              className="flex flex-wrap items-center gap-6 p-6 mb-8 border"
              style={{ background: C.navy, borderColor: "#1e3535" }}
            >
              {/* Big number */}
              <div className="flex flex-col items-center">
                <span
                  style={{
                    ...EXO,
                    fontWeight: 300,
                    fontSize: 52,
                    color: "rgb(221,211,188)",
                    lineHeight: 1,
                  }}
                >
                  {avgOverall}
                </span>
                <RatingStars value={Math.round(avgOverall)} size={16} />
                <span style={{ ...EYEBROW, color: "rgba(221,211,188,0.40)", fontSize: 9, marginTop: 4 }}>
                  out of 5
                </span>
              </div>

              {/* Per-category bars */}
              <div className="flex-1 min-w-[200px] grid grid-cols-1 gap-2">
                {[
                  { label: "Cleanliness", key: "ratingCleanliness" as keyof FeedbackEntry },
                  { label: "Service", key: "ratingService" as keyof FeedbackEntry },
                  { label: "Food", key: "ratingFood" as keyof FeedbackEntry },
                  { label: "Value", key: "ratingValue" as keyof FeedbackEntry },
                  { label: "Location", key: "ratingLocation" as keyof FeedbackEntry },
                ].map(({ label, key }) => {
                  const val = avg(feedbacks, key);
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span style={{ ...EXO, fontSize: 12, color: "rgba(221,211,188,0.55)", width: 72, flexShrink: 0 }}>
                        {label}
                      </span>
                      <div
                        className="flex-1 h-1.5"
                        style={{ background: "rgba(255,255,255,0.08)", borderRadius: 2 }}
                      >
                        <div
                          style={{
                            width: `${(val / 5) * 100}%`,
                            height: "100%",
                            background: "#d4a853",
                            borderRadius: 2,
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                      <span style={{ ...EXO, fontSize: 11, color: "#d4a853", width: 28, textAlign: "right" }}>
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Recommend pct */}
              <div
                className="flex flex-col items-center px-5 py-4"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <span
                  style={{
                    ...EXO,
                    fontWeight: 300,
                    fontSize: 36,
                    color: "rgb(221,211,188)",
                    lineHeight: 1,
                  }}
                >
                  {pctRecommend}%
                </span>
                <span style={{ ...EYEBROW, color: "rgba(221,211,188,0.40)", fontSize: 9, marginTop: 4 }}>
                  Recommend
                </span>
              </div>
            </div>
          )}

          {/* Cards grid */}
          {loadingFeedbacks ? (
            <div className="flex items-center justify-center py-20">
              <div
                className="animate-spin rounded-full border-2"
                style={{ width: 34, height: 34, borderColor: C.teal, borderTopColor: "transparent" }}
              />
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="flex flex-col items-center py-20 gap-3">
              <MessageSquareQuote size={40} style={{ color: C.border }} />
              <p style={{ ...EXO, color: C.muted, fontSize: 15 }}>
                No reviews yet. Be the first to share your experience!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {feedbacks.map((entry) => (
                <FeedbackCard
                  key={entry._id}
                  entry={entry}
                  canDelete={canDelete}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── BOTTOM GOLD LINE ─────────────────────────────────────────── */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, ${C.gold}60, transparent)`,
          }}
        />
      </main>
    </>
  );
}