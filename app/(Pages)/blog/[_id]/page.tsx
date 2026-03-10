"use client";

import { useEffect, useState } from "react";
import CTA from "@/components/ui/CTA";
import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { Exo_2 } from "next/font/google";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Tag,
  Clock,
  Share2,
  User,
  MoreVertical,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { SyncLoading } from "@/components/ui/loading";
import Time from "@/components/ui/time";
import { useUser } from "@clerk/nextjs";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
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

// ── Font ──────────────────────────────────────────────────────────────────
const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-exo2",
});

// ── Palette tokens ────────────────────────────────────────────────────────
const C = {
  bg: "#f0ebe0",
  navy: "#0e1a2e",
  navyMid: "#162440",
  gold: "#b8943f",
  goldLight: "#d4a853",
  cream: "rgb(236,224,196)",
  border: "#ddd5c4",
  cardBg: "#faf7f2",
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

// ── Types ─────────────────────────────────────────────────────────────────
interface MediaFile {
  url: string;
  public_id: string;
  type: "image" | "video";
  format: string;
  width: number;
  height: number;
  duration?: number;
}

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  media: MediaFile[];
  tags: string[];
  uploader: string;
  uploader_email: string;
  uploader_avatar: string;
  uploader_id: string;
  created_at: string;
  updated_at?: string;
  status?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function BlogPostPage({
  params,
}: {
  params: Promise<{ _id: string }>;
}) {
  const { _id } = use(params);
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const Allowed = ["admin", "moderator"];
  const isPrivileged =
    isLoaded &&
    isSignedIn &&
    Allowed.includes((user?.publicMetadata?.role as string) ?? "");

  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(1);
  const [slideCount, setSlideCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Shows a banner if some Cloudinary files failed but the post was deleted
  const [mediaWarning, setMediaWarning] = useState<string | null>(null);

  const collection = "Journal";

  // ── Fetch post ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!_id) {
      setError("Invalid post ID");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `/api/getRequestById?_id=${_id}&collection=${collection}`,
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        if (!data.success || !data.data) throw new Error("Post not found");
        setBlogPost(data.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    })();
  }, [_id]);

  // ── Carousel counter sync ─────────────────────────────────────────────
  useEffect(() => {
    if (!carouselApi) return;
    setSlideCount(carouselApi.scrollSnapList().length);
    setCurrentSlide(carouselApi.selectedScrollSnap() + 1);
    carouselApi.on("select", () =>
      setCurrentSlide(carouselApi.selectedScrollSnap() + 1),
    );
  }, [carouselApi]);

  // ── Share ─────────────────────────────────────────────────────────────
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: blogPost?.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      }
    } catch {
      /* user cancelled */
    }
    setShowMenu(false);
  };

  // ── Delete ────────────────────────────────────────────────────────────
  // Sends { id, collection } as JSON body → matches /api/deleteAPI
  const handleDeletePost = async (id: string) => {
    try {
      setIsDeleting(true);
      setMediaWarning(null);

      const res = await fetch("/api/deleteAPI", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, collection }),
      });

      const result = await res.json();

      // Non-2xx or explicit failure
      if (!res.ok || !result.success) {
        toast.error(result.error ?? "Failed to delete post");
        return;
      }

      // Post deleted, but some Cloudinary media could not be removed
      if (result.media?.failed > 0) {
        setMediaWarning(
          `Post deleted, but ${result.media.failed} media file(s) could not be removed from storage.`,
        );
        // Let user read the warning before navigating away
        await new Promise((r) => setTimeout(r, 2500));
      }

      toast.success(result.message ?? "Post deleted successfully");
      router.push("/blog");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────
  if (loading) {
    return <SyncLoading />;
  }

  // ── Error ─────────────────────────────────────────────────────────────
  if (error || !blogPost) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: C.bg }}
      >
        <span style={{ fontSize: 48 }}>⚠️</span>
        <h2 style={{ ...EXO, color: C.navy, fontSize: 22, fontWeight: 600 }}>
          Something went wrong
        </h2>
        <p style={{ color: C.navyMid }}>{error ?? "Post not found."}</p>
        <Link
          href="/blog"
          className="flex items-center gap-2 mt-2"
          style={{ color: C.gold, ...EXO, fontWeight: 500 }}
        >
          <ArrowLeft size={16} /> Back to Blog
        </Link>
      </div>
    );
  }

  const validDate = blogPost.created_at
    ? !isNaN(new Date(blogPost.created_at).getTime())
    : false;

  return (
    <div
      className={`${exo2.variable} min-h-screen`}
      style={{ background: C.bg, color: C.navy }}
    >
      {/* ── STICKY HEADER ──────────────────────────────────────────────── */}
      <header
        className=" flex items-center justify-between px-4 py-3 border-b"
        style={{ background: C.cardBg, borderColor: C.border }}
      >
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 group"
          style={{ ...EXO, color: C.navy, fontWeight: 500, fontSize: 13 }}
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          Back
        </button>

        {/* Centre wordmark */}
        <span
          style={{
            ...EYEBROW,
            color: C.gold,
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          Royal Galaxy Journal
        </span>

        {/* Three-dot menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 transition-colors rounded"
            style={{ color: C.navy }}
            aria-label="Options"
          >
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              {/* Dropdown */}
              <div
                className="absolute right-0 top-full mt-1 z-50 rounded shadow-lg border py-1 min-w-[160px]"
                style={{ background: "white", borderColor: C.border }}
              >
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm transition-colors"
                  style={{ ...EXO, color: C.navy }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = C.bg)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <Share2 size={14} />
                  Share article
                </button>
              </div>
            </>
          )}

          {shareSuccess && (
            <div
              className="absolute right-0 top-full mt-1 px-3 py-2 rounded text-xs shadow"
              style={{
                background: C.navy,
                color: C.cream,
                ...EXO,
                whiteSpace: "nowrap",
              }}
            >
              ✓ Link copied!
            </div>
          )}
        </div>
      </header>

      {/* ── CLOUDINARY WARNING BANNER ──────────────────────────────────── */}
      {mediaWarning && (
        <div
          className="w-full px-4 py-3 text-sm text-center"
          style={{
            background: "#7c3200",
            color: "#ffe0c0",
            ...EXO,
            fontWeight: 500,
          }}
        >
          ⚠️ {mediaWarning}
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center px-4 pt-16 pb-20 text-center"
        style={{ background: "#272727", color: C.cream, minHeight: 340 }}
      >
        {/* Gold ornament */}
        <div
          className="mb-4"
          style={{ width: 40, height: 2, background: C.gold, borderRadius: 1 }}
        />

        {/* Meta row */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
          {blogPost.status && (
            <span
              style={{
                ...EYEBROW,
                color: C.goldLight,
                background: `${C.gold}22`,
                padding: "2px 10px",
                borderRadius: 2,
              }}
            >
              {blogPost.status}
            </span>
          )}

          {validDate && (
            <>
              <span
                className="flex items-center gap-1"
                style={{ ...EYEBROW, color: `${C.cream}99` }}
              >
                <Calendar size={11} />
                {formatDate(blogPost.created_at)}
              </span>
              <span
                className="flex items-center gap-1"
                style={{ ...EYEBROW, color: `${C.cream}99` }}
              >
                <Clock size={11} />
                <Time time={blogPost.created_at} />
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h1
          style={{
            ...EXO,
            fontWeight: 700,
            fontSize: "clamp(26px, 5vw, 46px)",
            lineHeight: 1.18,
            maxWidth: 760,
            color: "#fff",
          }}
        >
          {blogPost.title}
        </h1>

        {/* Excerpt */}
        {blogPost.excerpt && (
          <p
            style={{
              ...EXO,
              fontWeight: 300,
              fontSize: 16,
              color: `${C.cream}cc`,
              maxWidth: 620,
              marginTop: 16,
              lineHeight: 1.7,
            }}
          >
            {blogPost.excerpt}
          </p>
        )}

        {/* Bottom wave → parchment */}
        <svg
          viewBox="0 0 1440 48"
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
          <path d="M0,48 C360,0 1080,0 1440,48 L1440,48 L0,48 Z" fill={C.bg} />
        </svg>
      </section>

      {/* ── MAIN BODY ──────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
        {/* MAIN COLUMN */}
        <div className="flex flex-col gap-8">
          {/* ── CAROUSEL ─────────────────────────────────────────────────── */}
          {blogPost.media && blogPost.media.length > 0 && (
            <div
              className="rounded overflow-hidden border"
              style={{ borderColor: C.border, background: "#111" }}
            >
              <Carousel setApi={setCarouselApi} className="w-full">
                <CarouselContent>
                  {blogPost.media.map((m, i) => (
                    <CarouselItem key={m.public_id ?? i}>
                      <div
                        className="relative flex items-center justify-center"
                        style={{ aspectRatio: "16/9", background: "#111" }}
                      >
                        {m.type === "image" ? (
                          <Image
                            src={m.url}
                            alt={`Media ${i + 1}`}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 800px"
                          />
                        ) : (
                          <video
                            src={m.url}
                            controls
                            className="w-full h-full object-contain"
                          >
                            Your browser does not support the video tag.
                          </video>
                        )}

                        {/* Type badge */}
                        <span
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            ...EYEBROW,
                            background: `${C.navy}cc`,
                            color: C.cream,
                            padding: "2px 8px",
                            borderRadius: 2,
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          {m.type}
                        </span>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* Dots + counter */}
              {blogPost.media.length > 1 && (
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{ background: C.navy }}
                >
                  <div className="flex items-center gap-1.5">
                    {blogPost.media.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => carouselApi?.scrollTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        style={{
                          background:
                            currentSlide === i + 1 ? C.gold : `${C.gold}30`,
                          width: currentSlide === i + 1 ? "16px" : "8px",
                          height: "8px",
                          borderRadius: "9999px",
                          transition: "all 0.2s",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                  <span
                    style={{
                      ...EYEBROW,
                      color: `${C.cream}80`,
                      fontSize: 10,
                    }}
                  >
                    {currentSlide} / {slideCount}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* CONTENT ─────────────────────────────────────────────────────── */}
          <div
            className="rounded border p-6 md:p-10"
            style={{ background: C.cardBg, borderColor: C.border }}
          >
            <h2
              className="mb-6 pb-3 border-b"
              style={{ ...EYEBROW, color: C.gold, borderColor: C.border }}
            >
              Full Article
            </h2>
            <div
              style={{
                ...EXO,
                fontWeight: 400,
                fontSize: 16,
                lineHeight: 1.85,
                color: C.navyMid,
                whiteSpace: "pre-wrap",
              }}
            >
              {blogPost.content}
            </div>
          </div>

          {/* TAGS ─────────────────────────────────────────────────────────── */}
          {blogPost.tags && blogPost.tags.length > 0 && (
            <div
              className="rounded border p-5"
              style={{ background: C.cardBg, borderColor: C.border }}
            >
              <h3
                className="flex items-center gap-2 mb-3"
                style={{ ...EYEBROW, color: C.gold }}
              >
                <Tag size={12} />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {blogPost.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      ...EXO,
                      fontSize: 12,
                      fontWeight: 500,
                      padding: "4px 12px",
                      border: `1px solid ${C.navy}`,
                      color: C.navy,
                      borderRadius: 2,
                      cursor: "default",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        C.navy;
                      (e.currentTarget as HTMLElement).style.color = C.cream;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                      (e.currentTarget as HTMLElement).style.color = C.navy;
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR ──────────────────────────────────────────────────────── */}
        <aside className="flex flex-col gap-6">
          {/* Uploader card — privileged only ────────────────────────────── */}
          {isPrivileged && (
            <div
              className="rounded border p-5"
              style={{ background: C.cardBg, borderColor: C.border }}
            >
              <h3 style={{ ...EYEBROW, color: C.gold }} className="mb-4">
                Posted By
              </h3>

              <div className="flex items-center gap-3 mb-4">
                {blogPost.uploader_avatar ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={blogPost.uploader_avatar}
                      alt={blogPost.uploader}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: C.navy, color: C.cream }}
                  >
                    <span style={{ ...EXO, fontWeight: 600, fontSize: 14 }}>
                      {blogPost.uploader?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                )}
                <div>
                  <p
                    style={{
                      ...EXO,
                      fontWeight: 600,
                      fontSize: 14,
                      color: C.navy,
                    }}
                  >
                    {blogPost.uploader}
                  </p>
                  {blogPost.uploader_email && (
                    <p
                      style={{
                        ...EXO,
                        fontSize: 11,
                        color: `${C.navy}80`,
                      }}
                    >
                      {blogPost.uploader_email}
                    </p>
                  )}
                </div>
              </div>

              {/* Delete button — guarded by AlertDialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={isDeleting}
                    className="w-full rounded-none bg-red-500 hover:bg-red-600 disabled:opacity-60"
                  >
                    {isDeleting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin inline-block">⏳</span>
                        Deleting…
                      </span>
                    ) : (
                      "Delete Post"
                    )}
                  </Button>
                </AlertDialogTrigger>

                <AlertDialogContent
                  style={{ background: C.cardBg, borderColor: C.border }}
                >
                  <AlertDialogHeader>
                    <AlertDialogTitle
                      style={{ ...EXO, color: C.navy, fontWeight: 700 }}
                    >
                      Delete this post?
                    </AlertDialogTitle>
                    <AlertDialogDescription
                      style={{ ...EXO, color: `${C.navy}99`, fontSize: 14 }}
                    >
                      This will permanently remove{" "}
                      <span style={{ color: C.navy, fontWeight: 600 }}>
                        "{blogPost.title}"
                      </span>{" "}
                      and all its media from storage. This action cannot be
                      undone.
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
                      onClick={() => handleDeletePost(blogPost._id)}
                      style={{
                        ...EXO,
                        background: "#ef4444",
                        color: "#fff",
                        borderRadius: 0,
                        fontWeight: 600,
                      }}
                      className="hover:bg-red-600"
                    >
                      Yes, delete permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {/* Stats ────────────────────────────────────────────────────────── */}
          <div
            className="rounded border p-5"
            style={{ background: C.cardBg, borderColor: C.border }}
          >
            <h3 style={{ ...EYEBROW, color: C.gold }} className="mb-4">
              Post Statistics
            </h3>
            <div className="flex flex-col gap-3">
              <StatRow
                icon={<span>📸</span>}
                label="Media Files"
                value={String(blogPost.media?.length ?? 0)}
                navy={C.navy}
              />
              <StatRow
                icon={<Tag size={13} />}
                label="Tags"
                value={String(blogPost.tags?.length ?? 0)}
                navy={C.navy}
              />
            </div>
          </div>

          {/* Dates ───────────────────────────────────────────────────────── */}
          <div
            className="rounded border p-5"
            style={{ background: "#272727", borderColor: "#333" }}
          >
            <div className="flex flex-col gap-4 text-[#eaeaea]">
              <div>
                <p
                  style={{
                    ...EYEBROW,
                    color: `${C.cream}66`,
                    fontSize: 10,
                  }}
                >
                  Published
                </p>
                <p
                  style={{
                    ...EXO,
                    color: C.cream,
                    fontWeight: 500,
                    fontSize: 13,
                  }}
                >
                  {validDate ? formatDate(blogPost.created_at) : "—"}
                </p>
              </div>

              {blogPost.updated_at &&
                blogPost.updated_at !== blogPost.created_at && (
                  <div>
                    <p
                      style={{
                        ...EYEBROW,
                        color: `${C.cream}66`,
                        fontSize: 10,
                      }}
                    >
                      Last Updated
                    </p>
                    <p
                      style={{
                        ...EXO,
                        color: C.cream,
                        fontWeight: 500,
                        fontSize: 13,
                      }}
                    >
                      {formatDate(blogPost.updated_at)}
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Share CTA ───────────────────────────────────────────────────── */}
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-3 rounded border transition-colors"
            style={{
              ...EXO,
              fontWeight: 600,
              fontSize: 13,
              color: C.gold,
              borderColor: C.gold,
              background: "transparent",
              letterSpacing: "0.08em",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                `${C.gold}18`)
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "transparent")
            }
          >
            <Share2 size={14} />
            Share This Article
          </button>
        </aside>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer
        className="text-center py-8 border-t"
        style={{ borderColor: C.border, background: C.cardBg }}
      >
        <p style={{ ...EYEBROW, color: `${C.navy}60`, fontSize: 10 }}>
          Royal Galaxy Hotel &amp; Lodge — Journal
        </p>
        <Link
          href="/blog"
          style={{ ...EXO, color: C.gold, fontSize: 13, fontWeight: 500 }}
          className="mt-2 inline-block hover:underline"
        >
          ← All Posts
        </Link>
      </footer>
      <CTA />
    </div>
  );
}

// ── Stat row ──────────────────────────────────────────────────────────────
function StatRow({
  icon,
  label,
  value,
  navy,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  navy: string;
}) {
  const EXO: React.CSSProperties = { fontFamily: "var(--font-exo2)" };
  return (
    <div className="flex items-center justify-between">
      <span
        className="flex items-center gap-2"
        style={{ ...EXO, fontSize: 12, color: `${navy}80` }}
      >
        {icon}
        {label}
      </span>
      <span style={{ ...EXO, fontSize: 13, fontWeight: 600, color: navy }}>
        {value}
      </span>
    </div>
  );
}
