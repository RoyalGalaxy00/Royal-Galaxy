"use client";
import { useEffect, useState, useMemo } from "react";
import { Exo_2 } from "next/font/google";
import { SyncLoading } from "@/components/ui/loading";
import { Eye, MessageCircle, Calendar, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import Time from "@/components/ui/time";
import Image from "next/image";
import AOSInit from "@/components/ui/AOS";
import { Input } from "@/components/ui/input";
import CTA from "@/components/ui/CTA";
import { toast } from "sonner";

// ── Font ───────────────────────────────────────────────────────────────────
const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-exo2",
});

// ── Shared style tokens ────────────────────────────────────────────────────
const body: React.CSSProperties = {
  fontFamily: "var(--font-exo2)",
  fontWeight: 400,
  color: "rgb(39, 39, 39)",
};

const eyebrow: React.CSSProperties = {
  fontFamily: "var(--font-exo2)",
  fontWeight: 500,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  fontSize: "11px",
  lineHeight: "20px",
};

// ── Types ──────────────────────────────────────────────────────────────────
type MediaItem = {
  url: string;
  type?: string;
};

type BlogPost = {
  _id: string;
  title: string;
  excerpt: string;
  media: MediaItem[];
  created_at: string;

  tags?: string[];
};

// ── Helper: first image-type media ────────────────────────────────────────
const getFirstImage = (media: MediaItem[]): string | null => {
  if (!media || media.length === 0) return null;
  const found = media.find((m) => !m.type || m.type === "image");
  return found?.url ?? null;
};

// ── Tags Row ──────────────────────────────────────────────────────────────
const TagRow = ({ tags }: { tags?: string[] }) => {
  if (!tags || tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {tags.map((tag) => (
        <span
          key={tag}
          className="px-2.5 py-1 border border-[#0a7a7b]/30 text-[#0a7a7b] hover:bg-[#0a7a7b] hover:text-white transition-all duration-200 cursor-default"
          style={{
            fontFamily: "var(--font-exo2)",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

// ── Blog Card ─────────────────────────────────────────────────────────────
const BlogCard = ({ blog, delay = 0 }: { blog: BlogPost; delay?: number }) => {
  const imageUrl = getFirstImage(blog.media);

  return (
    <div
      data-aos="fade-up"
      data-aos-delay={delay}
      className="group flex flex-col sm:flex-row w-full bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Image */}
      {imageUrl && (
        <div className="relative w-full sm:w-52 md:w-60 lg:w-72 shrink-0 aspect-video sm:aspect-auto sm:min-h-[200px] overflow-hidden">
          <Image
            src={imageUrl}
            alt={blog.title}
            fill
            quality={85}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      {/* Content */}
      <div className={`flex flex-col justify-between p-6 sm:p-7 ${imageUrl ? "flex-1" : "w-full"}`}>
        <div>
         

          <h3
            style={{
              fontFamily: "var(--font-exo2)",
              fontWeight: 300,
              fontSize: "clamp(1.15rem, 2vw, 1.4rem)",
              lineHeight: "1.3",
              letterSpacing: "0.04em",
              color: "#1a2e2e",
            }}
            className="mb-2 group-hover:text-[#0a7a7b] transition-colors duration-200"
          >
            {blog.title}
          </h3>

          <p
            className="line-clamp-2"
            style={{
              ...body,
              color: "rgb(75,75,75)",
              fontSize: "clamp(12px, 1.4vw, 14px)",
              lineHeight: "1.85",
            }}
          >
            {blog.excerpt}
          </p>

          <TagRow tags={blog.tags} />
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-[#e8e3d8] flex items-center justify-between flex-wrap gap-2">
          <div
            className="flex items-center gap-3 text-[#8a9a9a] text-[11px]"
            style={{ fontFamily: "var(--font-exo2)", fontWeight: 400 }}
          >
       
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              <Time time={blog.created_at} />
            </span>
          </div>

          <Link href={`/blog/${blog._id}`}>
            <button
              className="group/btn flex items-center gap-1.5 text-[11px] uppercase tracking-widest font-medium text-[#0a7a7b] hover:text-[#086061] transition-colors duration-200"
              style={{ fontFamily: "var(--font-exo2)", fontWeight: 500 }}
            >
              Read More
              <ChevronRight
                size={12}
                className="transition-transform duration-200 group-hover/btn:translate-x-0.5"
              />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
const Blogs = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
        try {
      
      const res = await fetch("/api/getBlogs?collection=Journal");
      const data = await res.json();
     
        if (!data.success) {
          setError(data.message);
          return;
        }
        setBlogs(data.data);
      } catch {
        toast.error("Failed to load blogs.");
        setError("Failed to load blogs.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter((b) => b.title.toLowerCase().includes(q));
  }, [search, blogs]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f2ede1]">
        <SyncLoading />
      </div>
    );

  if (error)
    return (
      <div
        className="text-red-500 text-center min-h-screen flex items-center justify-center bg-[#f2ede1]"
        style={{ fontFamily: "var(--font-exo2)" }}
      >
        {error}
      </div>
    );

  return (
    <main className={`${exo2.variable} bg-[#f2ede1] min-h-screen flex flex-col`}>
      <AOSInit />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section
        className="relative bg-[#0a7a7b] flex flex-col items-center justify-center text-center text-white px-4 sm:px-8 overflow-hidden"
        style={{ minHeight: "110vh" }}
      >
        {/* Subtle line texture */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,1) 3px,rgba(255,255,255,1) 4px)",
          }}
        />

        {/* Top ornament */}
        <div data-aos="fade-down" data-aos-delay="0" className="flex flex-col items-center mb-7">
          <div className="w-px h-10 bg-white/25 mb-3" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-white/35" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/55" />
            <div className="w-8 h-px bg-white/35" />
          </div>
        </div>

        <p
          data-aos="fade-down"
          data-aos-delay="100"
          style={{ ...eyebrow, color: "rgba(255,255,255,0.60)" }}
          className="mb-5"
        >
          Stories &amp; Updates
        </p>

        <h1
          data-aos="fade-down"
          data-aos-delay="200"
          className="px-4 mb-1"
          style={{
            fontFamily: "var(--font-exo2)",
            fontWeight: 300,
            fontSize: "clamp(2.4rem, 6vw, 70px)",
            lineHeight: "clamp(2.8rem, 7vw, 82px)",
            color: "rgb(230, 221, 202)",
            letterSpacing: "0.06em",
          }}
        >
          The Royal Galaxy
        </h1>

        <p
          data-aos="fade-down"
          data-aos-delay="260"
          style={{
            fontFamily: "var(--font-exo2)",
            fontWeight: 300,
            fontStyle: "italic",
            fontSize: "clamp(1.5rem, 4vw, 48px)",
            lineHeight: "clamp(2rem, 5vw, 60px)",
            color: "rgba(230,221,202,0.72)",
            letterSpacing: "0.06em",
          }}
        >
          Journal
        </p>

        <div data-aos="fade-down" data-aos-delay="320" className="flex items-center gap-4 my-7">
          <div className="w-14 h-px bg-white/25" />
          <div className="w-1.5 h-1.5 rounded-full bg-white/45" />
          <div className="w-14 h-px bg-white/25" />
        </div>

        <p
          data-aos="fade-up"
          data-aos-delay="360"
          className="max-w-xs sm:max-w-md lg:max-w-lg mb-10 px-4"
          style={{
            ...body,
            color: "rgba(255,255,255,0.70)",
            fontSize: "clamp(14px, 1.6vw, 16px)",
            lineHeight: "1.85",
            letterSpacing: "0.02em",
          }}
        >
          Wildlife encounters, cultural stories, travel tips, and behind-the-scenes moments from Chitwan.
        </p>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 80"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#f2ede1" />
          </svg>
        </div>
      </section>

      {/* ── BLOG LISTING ──────────────────────────────────────────────── */}
      <section className="bg-[#f2ede1]">
        <div className="max-w-5xl w-full mx-auto px-4 sm:px-8 py-14 sm:py-20 md:py-24">

          {/* Section header */}
          <div
            data-aos="fade-up"
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8 sm:mb-10"
          >
            <div>
              <p style={{ ...eyebrow, color: "#0a7a7b" }} className="mb-2">
                Latest Entries
              </p>

            </div>

            <p
              className="text-[#8a9a9a]"
              style={{
                fontFamily: "var(--font-exo2)",
                fontWeight: 400,
                fontSize: "11px",
                letterSpacing: "0.20em",
                textTransform: "uppercase",
              }}
            >
              {blogs.length} {blogs.length === 1 ? "Story" : "Stories"}
            </p>
          </div>

          {/* ── Search bar ──────────────────────────────────────────── */}
          <div data-aos="fade-up" data-aos-delay="80" className="relative mb-10 sm:mb-12">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#0a7a7b]/60 pointer-events-none"
            />
            <Input
              type="text"
              placeholder="Search stories by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 h-11 bg-white border border-[#ccc6b8] focus:border-[#0a7a7b] focus-visible:ring-[#0a7a7b]/20 focus-visible:ring-2 rounded-none shadow-none text-[#1a2e2e] placeholder:text-[#a0a8a8]"
              style={{
                fontFamily: "var(--font-exo2)",
                fontSize: "13px",
                fontWeight: 400,
                letterSpacing: "0.02em",
              }}
            />
          </div>

          {/* Results count when searching */}
          {search.trim() && (
            <p
              className="mb-6 -mt-6 text-[#8a9a9a]"
              style={{
                fontFamily: "var(--font-exo2)",
                fontSize: "11px",
                fontWeight: 400,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              {filtered.length === 0
                ? "No results found"
                : `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search.trim()}"`}
            </p>
          )}

          {/* Empty state (no blogs at all) */}
          {blogs.length === 0 && (
            <div className="text-center py-24">
              <p
                style={{
                  ...body,
                  color: "#8a9a9a",
                  fontSize: "clamp(14px, 1.5vw, 16px)",
                }}
              >
                No journal entries yet. Check back soon.
              </p>
            </div>
          )}

          {/* No search match */}
          {blogs.length > 0 && filtered.length === 0 && (
            <div className="text-center py-20">
              <p
                style={{
                  ...body,
                  color: "#8a9a9a",
                  fontSize: "clamp(13px, 1.4vw, 15px)",
                }}
              >
                No stories match your search. Try a different keyword.
              </p>
            </div>
          )}

          {/* Blog list */}
          {filtered.length > 0 && (
            <div className="flex flex-col gap-5 sm:gap-6">
              {filtered.map((blog, i) => (
                <BlogCard key={blog._id} blog={blog} delay={(i % 5) * 80} />
              ))}
            </div>
          )}
        </div>
      </section>
      <CTA/>
    </main>
  );
};

export default Blogs;