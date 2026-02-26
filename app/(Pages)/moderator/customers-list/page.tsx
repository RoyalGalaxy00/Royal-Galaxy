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
  getContactMessages,
  sendReply,
  deleteContactMessage,
  type ContactInfo,
} from "@/app/actions/contactAdmins";

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

// ── Page ──────────────────────────────────────────────────────────────────
export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Reply sheet state
  const [replyOpen, setReplyOpen] = useState(false);
  const [activeMsg, setActiveMsg] = useState<ContactInfo | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [isSending, startSending] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  // ── Fetch ───────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const result = await getContactMessages();
      if (result.success && result.data) {
        setMessages(result.data);
      } else {
        toast.error(result.error ?? "Failed to load messages");
      }
      setLoading(false);
    })();
  }, []);

  // ── Open reply sheet ────────────────────────────────────────────────
  // Uses msg.email — the address the visitor typed in the contact form
  const openReply = (msg: ContactInfo) => {
    setActiveMsg(msg);
    setReplySubject(
      `Re: Your enquiry — Royal Galaxy Hotel & Lodge`
    );
    setReplyBody(
      `Dear ${msg.firstName},\n\nThank you for reaching out to Royal Galaxy Hotel & Lodge.\n\n`
    );
    setReplyOpen(true);
  };

  // ── Send reply ──────────────────────────────────────────────────────
  const handleSendReply = () => {
    if (!activeMsg) return;
    if (!replyBody.trim() || !replySubject.trim()) {
      toast.error("Subject and message body are required");
      return;
    }

    startSending(async () => {
      const result = await sendReply({
        // ✅ Send to the email the visitor filled in the contact form
        to: activeMsg.email,
        toName: `${activeMsg.firstName} ${activeMsg.lastName}`,
        subject: replySubject,
        body: replyBody,
        messageId: activeMsg._id,
      });

      if (result.success) {
        toast.success(`Reply sent to ${activeMsg.email}!`);
        setMessages((prev) =>
          prev.map((m) =>
            m._id === activeMsg._id ? { ...m, replied: true } : m
          )
        );
        setReplyOpen(false);
      } else {
        toast.error(result.error ?? "Failed to send reply");
      }
    });
  };

  // ── Delete ──────────────────────────────────────────────────────────
  const handleDelete = (id: string) => {
    startDeleting(async () => {
      const result = await deleteContactMessage(id);
      if (result.success) {
        toast.success("Message deleted");
        setMessages((prev) => prev.filter((m) => m._id !== id));
      } else {
        toast.error(result.error ?? "Failed to delete message");
      }
    });
  };

  // ── Filtered ────────────────────────────────────────────────────────
  const filtered = messages.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.firstName.toLowerCase().includes(q) ||
      m.lastName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q)
    );
  });

  // ── Loading ─────────────────────────────────────────────────────────
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
            Loading messages…
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
      {/* ── TOP GOLD LINE ──────────────────────────────────────────────── */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.goldLight}, ${C.gold}, transparent)`,
        }}
      />

      {/* ── PAGE HEADER ────────────────────────────────────────────────── */}
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
                Contact{" "}
                <em style={{ color: C.goldLight, fontStyle: "italic" }}>
                  Messages
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
                {messages.length} message{messages.length !== 1 ? "s" : ""}{" "}
                received
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
                placeholder="Search messages…"
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

      {/* ── STATS BAR ──────────────────────────────────────────────────── */}
      <div
        className="border-b"
        style={{ background: C.cardBg, borderColor: C.border }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6 flex-wrap">
          {[
            { label: "Total", value: messages.length, color: C.navy },
            {
              label: "Replied",
              value: messages.filter((m) => m.replied).length,
              color: "#16a34a",
            },
            {
              label: "Pending",
              value: messages.filter((m) => !m.replied).length,
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
      </div>

      {/* ── MESSAGE GRID ───────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Inbox size={48} style={{ color: C.border }} />
            <p style={{ ...EXO, color: C.muted, fontSize: 15 }}>
              {search
                ? "No messages match your search."
                : "No messages yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((msg) => (
              <MessageCard
                key={msg._id}
                msg={msg}
                onReply={openReply}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── REPLY SHEET ────────────────────────────────────────────────── */}
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
                  Reply to {activeMsg?.firstName} {activeMsg?.lastName}
                </SheetTitle>

                {/* Show exactly which email will receive the reply */}
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
                          {activeMsg?.email}
                        </strong>
                      </span>
                    </div>
                  </div>
                </SheetDescription>
              </div>

              {/* Original message quote */}
              {activeMsg && (
                <div
                  className="mt-4 p-4 border-l-2"
                  style={{
                    borderLeftColor: C.gold,
                    background: C.bg,
                    border: `1px solid ${C.border}`,
                    borderLeft: `3px solid ${C.gold}`,
                  }}
                >
                  <p
                    style={{ ...EYEBROW, color: C.muted, marginBottom: 6 }}
                  >
                    Their Message
                  </p>
                  <p
                    style={{
                      ...EXO,
                      fontSize: 13,
                      color: C.navyMid,
                      lineHeight: 1.65,
                      fontStyle: "italic",
                    }}
                  >
                    "{activeMsg.message}"
                  </p>
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
                rows={8}
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
                className="group flex items-center justify-center gap-2 px-6 py-2.5 transition-all disabled:opacity-60"
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
                    <span className="animate-spin inline-block text-sm">
                      ⏳
                    </span>
                    Sending…
                  </>
                ) : (
                  <>
                    <Reply size={14} />
                    Send Reply
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

// ── Message Card ──────────────────────────────────────────────────────────
function MessageCard({
  msg,
  onReply,
  onDelete,
}: {
  msg: ContactInfo;
  onReply: (msg: ContactInfo) => void;
  onDelete: (id: string) => void;
}) {
  const EXO: React.CSSProperties = { fontFamily: "var(--font-exo2)" };
  const EYEBROW: React.CSSProperties = {
    fontFamily: "var(--font-exo2)",
    fontWeight: 500,
    letterSpacing: "0.32em",
    textTransform: "uppercase",
    fontSize: "11px",
    lineHeight: "20px",
  };

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
          <div className="flex items-center gap-3 min-w-0">
            {/* Avatar */}
            {msg.Sender_avatar ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={msg.Sender_avatar}
                  alt={msg.Sender_name}
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
                  {msg.firstName?.[0]?.toUpperCase() ?? "?"}
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
                {msg.firstName} {msg.lastName}
              </p>
              <p
                style={{ ...EXO, fontSize: 12, color: "#8a7f6e" }}
                className="truncate"
              >
                {msg.Sender_name}
              </p>
            </div>
          </div>

          {/* Replied badge */}
          {msg.replied && (
            <div
              className="flex items-center gap-1 flex-shrink-0 px-2 py-0.5"
              style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
              }}
            >
              <CheckCheck size={10} color="#16a34a" />
              <span style={{ ...EYEBROW, color: "#16a34a", fontSize: 9 }}>
                Replied
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-5 pb-4 flex-1 flex flex-col gap-4">
        {/* Contact info — shows the form email (reply destination) prominently */}
        <div className="flex flex-col gap-1.5">
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
              {msg.email}
            </span>
          </div>
          <a
            href={`tel:${msg.phone}`}
            className="flex items-center gap-2"
            style={{ ...EXO, fontSize: 13, color: "#8a7f6e" }}
          >
            <Phone size={12} style={{ color: "#8a7f6e" }} />
            {msg.phone}
          </a>
        </div>

        <Separator style={{ background: "#ddd5c4" }} />

        {/* Message body */}
        <div>
          <p style={{ ...EYEBROW, color: "#8a7f6e", marginBottom: 6 }}>
            Message
          </p>
          <p
            style={{
              ...EXO,
              fontSize: 13,
              color: "#162440",
              lineHeight: 1.7,
              display: "-webkit-box",
              WebkitLineClamp: 4,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {msg.message}
          </p>
        </div>

        {/* Date */}
        {msg.created_at && (
          <div className="flex items-center gap-1.5 mt-auto">
            <Clock size={11} style={{ color: "#8a7f6e" }} />
            <span style={{ ...EYEBROW, color: "#8a7f6e", fontSize: 9 }}>
              {new Date(msg.created_at).toLocaleDateString("en-US", {
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

      {/* ── ACTIONS ────────────────────────────────────────────────────── */}
      <CardFooter
        className="px-5 py-4 flex items-center gap-2 border-t"
        style={{ borderColor: "#ddd5c4" }}
      >
        {/* Reply */}
        <button
          onClick={() => onReply(msg)}
          className="group flex-1 flex items-center justify-center gap-2 py-2.5 transition-all"
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
          Reply
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
              aria-label="Delete message"
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
                Delete this message?
              </AlertDialogTitle>
              <AlertDialogDescription
                style={{ ...EXO, color: "#8a7f6e", fontSize: 14 }}
              >
                The message from{" "}
                <span style={{ color: "#0e1a2e", fontWeight: 600 }}>
                  {msg.firstName} {msg.lastName}
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
                onClick={() => onDelete(msg._id)}
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