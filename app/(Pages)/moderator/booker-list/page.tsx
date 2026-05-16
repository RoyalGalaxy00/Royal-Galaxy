"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { Exo_2 } from "next/font/google";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  Trash2,
  Reply,
  Clock,
  CheckCheck,
  Inbox,
  Search,
  X,
  BedDouble,
  Users,
  Calendar,
  MapPin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  getBookings,
  sendBookingReply,
  deleteBooking,
  type BookingInfo,
} from "@/app/actions/bookingAdmin";
import { EmailLimitAlert } from "@/components/ui/alertEmails";

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

const EXO: React.CSSProperties = { fontFamily: "var(--font-exo2)" };
const EYEBROW: React.CSSProperties = {
  fontFamily: "var(--font-exo2)",
  fontWeight: 500,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  fontSize: "11px",
  lineHeight: "20px",
};

// ── Helpers ───────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function nightsBetween(checkIn: string, checkOut: string) {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  const nights = Math.round(diff / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : null;
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<BookingInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "replied">("all");

  // Reply sheet
  const [replyOpen, setReplyOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<BookingInfo | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [isSending, startSending] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  // ── Fetch ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const result = await getBookings();
      if (result.success && result.data) {
        setBookings(result.data);
      } else {
        toast.error(result.error ?? "Failed to load bookings");
      }
      setLoading(false);
    })();
  }, []);

  // ── Open reply sheet ──────────────────────────────────────────────
  const openReply = (booking: BookingInfo) => {
    setActiveBooking(booking);
    setReplySubject(
      `Your Reservation at Royal Galaxy Hotel & Lodge — ${booking.room}`,
    );
    setReplyBody(
      `Dear ${booking.firstName},\n\nThank you for choosing Royal Galaxy Hotel & Lodge. We are pleased to confirm your reservation for the ${booking.room}.\n\nCheck-in: ${formatDate(booking.checkInDate)} at ${booking.checkInTime}\nCheck-out: ${formatDate(booking.checkOutDate)} at ${booking.checkOutTime}\nGuests: ${booking.numberOfGuests}\n\nShould you require any assistance before your arrival, please don't hesitate to get in touch.\n\nWarm regards,\nRoyal Galaxy Hotel & Lodge`,
    );
    setReplyOpen(true);
  };

  // ── Send reply ────────────────────────────────────────────────────
  const handleSendReply = () => {
    if (!activeBooking) return;
    if (!replyBody.trim() || !replySubject.trim()) {
      toast.error("Subject and message body are required");
      return;
    }

    startSending(async () => {
      const result = await sendBookingReply({
        to: activeBooking.email,
        toName: `${activeBooking.firstName} ${activeBooking.lastName}`,
        subject: replySubject,
        body: replyBody,
        bookingId: activeBooking._id,
      });

      if (result.success) {
        toast.success(`Reply sent to ${activeBooking.email}!`);
        setBookings((prev) =>
          prev.map((b) =>
            b._id === activeBooking._id ? { ...b, replied: true } : b,
          ),
        );
        setReplyOpen(false);
      } else {
        toast.error(result.error ?? "Failed to send reply");
      }
    });
  };

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    startDeleting(async () => {
      const result = await deleteBooking(id);
      if (result.success) {
        toast.success("Booking deleted");
        setBookings((prev) => prev.filter((b) => b._id !== id));
      } else {
        toast.error(result.error ?? "Failed to delete booking");
      }
    });
  };

  // ── Filter + Search ───────────────────────────────────────────────
  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      b.firstName.toLowerCase().includes(q) ||
      b.lastName.toLowerCase().includes(q) ||
      b.email.toLowerCase().includes(q) ||
      b.room?.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q);

    const matchFilter =
      filter === "all" ||
      (filter === "replied" && b.replied) ||
      (filter === "pending" && !b.replied);

    return matchSearch && matchFilter;
  });

  // ── Loading ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="animate-spin rounded-full border-2"
            style={{
              width: 36,
              height: 36,
              borderColor: C.gold,
              borderTopColor: "transparent",
            }}
          />
          <p style={{ ...EXO, color: C.muted, fontSize: 13 }}>
            Loading bookings…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${exo2.variable} min-h-screen`}
      style={{ background: C.bg }}
    >
      {/* ── TOP GOLD LINE ──────────────────────────────────────────── */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.goldLight}, ${C.gold}, transparent)`,
        }}
      />

      {/* ── PAGE HEADER ────────────────────────────────────────────── */}
      <header style={{ background: C.hero }} className="px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <p style={{ ...EYEBROW, color: C.gold, marginBottom: 6 }}>
            Admin Panel
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1
                style={{
                  ...EXO,
                  fontWeight: 300,
                  fontSize: "clamp(28px, 4vw, 44px)",
                  color: "#fff",
                  lineHeight: 1.1,
                }}
              >
                Room{" "}
                <em style={{ color: C.goldLight, fontStyle: "italic" }}>
                  Bookings
                </em>
              </h1>
              <p
                style={{
                  ...EXO,
                  color: `${C.cream}70`,
                  fontSize: 14,
                  marginTop: 6,
                }}
              >
                {bookings.length} reservation
                {bookings.length !== 1 ? "s" : ""} received
              </p>
            </div>

            {/* Search */}
            <div
              className="flex items-center gap-2 px-3 py-2"
              style={{
                background: "#1a1a1a",
                border: `1px solid ${C.gold}30`,
                minWidth: 260,
              }}
            >
              <Search size={14} style={{ color: C.gold, flexShrink: 0 }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, room, city…"
                style={{
                  ...EXO,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: C.cream,
                  fontSize: 13,
                  width: "100%",
                }}
              />
              {search && (
                <button onClick={() => setSearch("")}>
                  <X size={13} style={{ color: C.muted }} />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── STATS + FILTER BAR ─────────────────────────────────────── */}
      <div
        className="border-b"
        style={{ background: C.cardBg, borderColor: C.border }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6 flex-wrap justify-between">
          {/* Stats */}
          <div className="flex items-center gap-6 flex-wrap">
            {[
              { label: "Total", value: bookings.length, color: C.navy },
              {
                label: "Confirmed",
                value: bookings.filter((b) => b.replied).length,
                color: "#16a34a",
              },
              {
                label: "Pending",
                value: bookings.filter((b) => !b.replied).length,
                color: "#d97706",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  style={{
                    ...EXO,
                    fontSize: 22,
                    fontWeight: 700,
                    color,
                    lineHeight: 1,
                  }}
                >
                  {value}
                </span>
                <span style={{ ...EYEBROW, color: C.muted }}>{label}</span>
                <Separator orientation="vertical" className="h-5 ml-2" />
              </div>
            ))}
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2">
            {(["all", "pending", "replied"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...EYEBROW,
                  fontSize: 10,
                  padding: "6px 14px",
                  background: filter === f ? C.navy : "transparent",
                  color: filter === f ? C.cream : C.muted,
                  border: `1px solid ${filter === f ? C.navy : C.border}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
      <EmailLimitAlert />
      {/* ── BOOKING GRID ───────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Inbox size={48} style={{ color: C.border }} />
            <p style={{ ...EXO, color: C.muted, fontSize: 15 }}>
              {search ? "No bookings match your search." : "No bookings yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onReply={openReply}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── REPLY SHEET ────────────────────────────────────────────── */}
      <Sheet open={replyOpen} onOpenChange={setReplyOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[90vh] overflow-y-auto rounded-t-xl border-t"
          style={{
            background: C.cardBg,
            borderColor: C.border,
            fontFamily: "var(--font-exo2)",
          }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-1 pb-4">
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 9999,
                background: C.border,
              }}
            />
          </div>

          <div className="max-w-2xl mx-auto pb-8 px-2">
            <SheetHeader className="mb-6">
              <div>
                <p style={{ ...EYEBROW, color: C.gold, marginBottom: 4 }}>
                  Compose Reply
                </p>
                <SheetTitle
                  style={{
                    ...EXO,
                    color: C.navy,
                    fontWeight: 600,
                    fontSize: 20,
                  }}
                >
                  Reply to {activeBooking?.firstName} {activeBooking?.lastName}
                </SheetTitle>

                <SheetDescription asChild>
                  <div className="mt-1">
                    <div
                      className="inline-flex items-center gap-2 px-3 py-1.5 mt-1"
                      style={{
                        background: `${C.gold}15`,
                        border: `1px solid ${C.gold}40`,
                      }}
                    >
                      <Mail size={12} style={{ color: C.gold }} />
                      <span
                        style={{
                          ...EXO,
                          fontSize: 13,
                          color: C.navy,
                          fontWeight: 500,
                        }}
                      >
                        Sending to:{" "}
                        <strong style={{ color: C.gold }}>
                          {activeBooking?.email}
                        </strong>
                      </span>
                    </div>
                  </div>
                </SheetDescription>
              </div>

              {/* Booking summary quote */}
              {activeBooking && (
                <div
                  className="mt-4 p-4"
                  style={{
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderLeft: `3px solid ${C.gold}`,
                  }}
                >
                  <p style={{ ...EYEBROW, color: C.muted, marginBottom: 8 }}>
                    Reservation Summary
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {[
                      {
                        icon: <BedDouble size={11} />,
                        label: activeBooking.room,
                      },
                      {
                        icon: <Calendar size={11} />,
                        label: `${formatDate(activeBooking.checkInDate)} → ${formatDate(activeBooking.checkOutDate)}`,
                      },
                      {
                        icon: <Users size={11} />,
                        label: `${activeBooking.numberOfGuests} guest(s)`,
                      },
                    ].map(({ icon, label }, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span style={{ color: C.gold }}>{icon}</span>
                        <span
                          style={{ ...EXO, fontSize: 13, color: C.navyMid }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SheetHeader>

            {/* Subject */}
            <div className="space-y-2 mb-4">
              <label style={{ ...EYEBROW, color: C.muted }}>Subject</label>
              <Input
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                style={{
                  ...EXO,
                  background: "transparent",
                  borderColor: C.border,
                  borderRadius: 0,
                  color: C.navy,
                  fontSize: 14,
                }}
                className="focus-visible:ring-0 focus-visible:border-[#b8943f]"
              />
            </div>

            {/* Body */}
            <div className="space-y-2 mb-6">
              <label style={{ ...EYEBROW, color: C.muted }}>Message</label>
              <Textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                rows={10}
                style={{
                  ...EXO,
                  background: "transparent",
                  borderColor: C.border,
                  borderRadius: 0,
                  color: C.navy,
                  fontSize: 14,
                  lineHeight: 1.7,
                  resize: "vertical",
                }}
                className="focus-visible:ring-0 focus-visible:border-[#b8943f]"
              />
            </div>

            <SheetFooter className="flex flex-col-reverse sm:flex-row gap-3">
              <SheetClose asChild>
                <Button
                  variant="outline"
                  style={{
                    ...EXO,
                    borderColor: C.border,
                    color: C.navy,
                    borderRadius: 0,
                    background: "transparent",
                  }}
                >
                  Cancel
                </Button>
              </SheetClose>

              <button
                onClick={handleSendReply}
                disabled={isSending}
                className="flex items-center justify-center gap-2 px-6 py-2.5 transition-all disabled:opacity-60"
                style={{
                  background: C.navy,
                  color: C.cream,
                  ...EXO,
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: "0.06em",
                  border: "none",
                  cursor: isSending ? "not-allowed" : "pointer",
                  flex: 1,
                }}
                onMouseEnter={(e) => {
                  if (!isSending)
                    (e.currentTarget as HTMLElement).style.background = C.gold;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = C.navy;
                }}
              >
                {isSending ? (
                  <>
                    <span className="animate-spin inline-block">⏳</span>
                    Sending…
                  </>
                ) : (
                  <>
                    <Reply size={14} />
                    Send Confirmation
                  </>
                )}
              </button>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ── Booking Card ──────────────────────────────────────────────────────────
function BookingCard({
  booking,
  onReply,
  onDelete,
}: {
  booking: BookingInfo;
  onReply: (b: BookingInfo) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const EXO: React.CSSProperties = { fontFamily: "var(--font-exo2)" };
  const EYEBROW: React.CSSProperties = {
    fontFamily: "var(--font-exo2)",
    fontWeight: 500,
    letterSpacing: "0.32em",
    textTransform: "uppercase",
    fontSize: "11px",
    lineHeight: "20px",
  };

  const nights = nightsBetween(booking.checkInDate, booking.checkOutDate);

  return (
    <Card
      className="flex flex-col border"
      style={{
        background: "#faf7f2",
        borderColor: "#ddd5c4",
        borderRadius: 0,
        boxShadow: "none",
      }}
    >
      <CardHeader className="pb-3 pt-5 px-5">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3 min-w-0">
            {booking.Sender_avatar ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={booking.Sender_avatar}
                  alt={booking.Sender_name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#0e1a2e", color: "rgb(236,224,196)" }}
              >
                <span style={{ ...EXO, fontWeight: 700, fontSize: 15 }}>
                  {booking.firstName?.[0]?.toUpperCase() ?? "?"}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <p
                style={{
                  ...EXO,
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#0e1a2e",
                  lineHeight: 1.2,
                }}
                className="truncate"
              >
                {booking.firstName} {booking.lastName}
              </p>
              <p
                style={{ ...EXO, fontSize: 12, color: "#8a7f6e" }}
                className="truncate"
              >
                {booking.Sender_name}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <div
            className="flex items-center gap-1 flex-shrink-0 px-2 py-0.5"
            style={{
              background: booking.replied ? "#f0fdf4" : "#fffbeb",
              border: `1px solid ${booking.replied ? "#bbf7d0" : "#fde68a"}`,
            }}
          >
            {booking.replied ? (
              <>
                <CheckCheck size={10} color="#16a34a" />
                <span style={{ ...EYEBROW, color: "#16a34a", fontSize: 9 }}>
                  Confirmed
                </span>
              </>
            ) : (
              <>
                <Clock size={10} color="#d97706" />
                <span style={{ ...EYEBROW, color: "#d97706", fontSize: 9 }}>
                  Pending
                </span>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-4 flex-1 flex flex-col gap-4">
        {/* Room + nights */}
        <div
          className="flex items-center justify-between px-3 py-2.5"
          style={{ background: "#0e1a2e" }}
        >
          <div className="flex items-center gap-2">
            <BedDouble size={13} style={{ color: "#b8943f" }} />
            <span
              style={{
                ...EXO,
                fontSize: 13,
                fontWeight: 600,
                color: "rgb(236,224,196)",
              }}
            >
              {booking.room}
            </span>
          </div>
          {nights && (
            <span
              style={{
                ...EYEBROW,
                fontSize: 9,
                color: "#b8943f",
              }}
            >
              {nights} night{nights !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              label: "Check-in",
              date: booking.checkInDate,
              time: booking.checkInTime,
            },
            {
              label: "Check-out",
              date: booking.checkOutDate,
              time: booking.checkOutTime,
            },
          ].map(({ label, date, time }) => (
            <div
              key={label}
              className="flex flex-col gap-0.5 p-2.5"
              style={{ border: "1px solid #ddd5c4" }}
            >
              <span style={{ ...EYEBROW, color: "#8a7f6e", fontSize: 9 }}>
                {label}
              </span>
              <span
                style={{
                  ...EXO,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0e1a2e",
                }}
              >
                {formatDate(date)}
              </span>
              <span style={{ ...EXO, fontSize: 11, color: "#8a7f6e" }}>
                {time}
              </span>
            </div>
          ))}
        </div>

        {/* Guests + Contact */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Users size={12} style={{ color: "#b8943f" }} />
            <span style={{ ...EXO, fontSize: 13, color: "#162440" }}>
              {booking.numberOfGuests} guest
              {Number(booking.numberOfGuests) > 1 ? "s" : ""}
            </span>
          </div>
          <div
            className="flex items-center gap-2 px-2 py-1.5"
            style={{
              background: `${"#b8943f"}12`,
              border: `1px solid ${"#b8943f"}30`,
            }}
          >
            <Mail size={11} style={{ color: "#b8943f" }} />
            <span
              style={{
                ...EXO,
                fontSize: 12,
                color: "#b8943f",
                fontWeight: 500,
              }}
              className="truncate"
            >
              {booking.email}
            </span>
          </div>
          <a
            href={`tel:${booking.phone}`}
            className="flex items-center gap-2"
            style={{ ...EXO, fontSize: 13, color: "#8a7f6e" }}
          >
            <Phone size={12} style={{ color: "#8a7f6e" }} />
            {booking.phone}
          </a>
        </div>

        {/* Expandable address details */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 w-full"
          style={{
            ...EYEBROW,
            color: "#8a7f6e",
            fontSize: 9,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            textAlign: "left",
          }}
        >
          {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          {expanded ? "Hide" : "Show"} Address Details
        </button>

        {expanded && (
          <div
            className="flex flex-col gap-1 p-3"
            style={{ background: "#f0ebe0", border: "1px solid #ddd5c4" }}
          >
            <div className="flex items-start gap-2">
              <MapPin size={11} style={{ color: "#b8943f", marginTop: 2 }} />
              <div>
                <p style={{ ...EXO, fontSize: 13, color: "#162440" }}>
                  {booking.address}
                </p>
                <p style={{ ...EXO, fontSize: 12, color: "#8a7f6e" }}>
                  {booking.city}, {booking.state} — {booking.zipCode}
                </p>
              </div>
            </div>
          </div>
        )}

        <Separator style={{ background: "#ddd5c4" }} />

        {/* Timestamp */}
        {booking.created_at && (
          <div className="flex items-center gap-1.5">
            <Clock size={11} style={{ color: "#8a7f6e" }} />
            <span style={{ ...EYEBROW, color: "#8a7f6e", fontSize: 9 }}>
              {new Date(booking.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </CardContent>

      {/* ── ACTIONS ──────────────────────────────────────────────────── */}
      <CardFooter
        className="px-5 py-4 flex items-center gap-2 border-t"
        style={{ borderColor: "#ddd5c4" }}
      >
        {/* Reply */}
        <button
          onClick={() => onReply(booking)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 transition-all"
          style={{
            background: "#0e1a2e",
            color: "rgb(236,224,196)",
            ...EXO,
            fontWeight: 600,
            fontSize: 12,
            letterSpacing: "0.06em",
            border: "none",
            cursor: "pointer",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#b8943f")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#0e1a2e")
          }
        >
          <Reply size={13} />
          {booking.replied ? "Send Again" : "Reply"}
        </button>

        {/* Delete */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="flex items-center justify-center p-2.5 transition-all"
              style={{
                background: "transparent",
                border: "1px solid #ddd5c4",
                color: "#8a7f6e",
                cursor: "pointer",
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
                el.style.color = "#8a7f6e";
              }}
              aria-label="Delete booking"
            >
              <Trash2 size={14} />
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent
            style={{ background: "#faf7f2", borderColor: "#ddd5c4" }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle
                style={{ ...EXO, color: "#0e1a2e", fontWeight: 700 }}
              >
                Delete this booking?
              </AlertDialogTitle>
              <AlertDialogDescription
                style={{ ...EXO, color: "#8a7f6e", fontSize: 14 }}
              >
                The reservation from{" "}
                <span style={{ color: "#0e1a2e", fontWeight: 600 }}>
                  {booking.firstName} {booking.lastName}
                </span>{" "}
                for{" "}
                <span style={{ color: "#b8943f", fontWeight: 600 }}>
                  {booking.room}
                </span>{" "}
                will be permanently removed. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                style={{
                  ...EXO,
                  borderColor: "#ddd5c4",
                  color: "#0e1a2e",
                  background: "transparent",
                  borderRadius: 0,
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(booking._id)}
                style={{
                  ...EXO,
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: 0,
                  fontWeight: 600,
                }}
                className="hover:bg-red-600"
              >
                Yes, delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
