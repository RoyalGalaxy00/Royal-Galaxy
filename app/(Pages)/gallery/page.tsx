"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Exo_2 } from "next/font/google";
import AOSInit from "@/components/ui/AOS";
import Image from "next/image";
import CTA from "@/components/ui/CTA";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import {
  X,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Upload,
  Trash2,
  Loader2,
  CloudUpload,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// ── Font ───────────────────────────────────────────────────────────────────
const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-exo2",
});

// ── Shared style tokens ────────────────────────────────────────────────────
const body = {
  fontFamily: "var(--font-exo2)",
  fontWeight: 400,
  color: "rgb(39, 39, 39)",
} as const;

const eyebrow: React.CSSProperties = {
  fontFamily: "var(--font-exo2)",
  fontWeight: 500,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  fontSize: "11px",
  lineHeight: "20px",
};

// ── Types ──────────────────────────────────────────────────────────────────
interface GalleryImage {
  _id: string;
  url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  uploader_id: string;
  uploader_name: string;
  uploader_email: string;
  uploader_avatar: string;
  created_at: string;
}

interface UploadFormValues {
  files: FileList;
}

// ── Lightbox ───────────────────────────────────────────────────────────────
function Lightbox({
  images,
  activeIndex,
  onClose,
  onPrev,
  onNext,
  isPrivileged,
}: {
  images: GalleryImage[];
  activeIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  isPrivileged: boolean;
}) {
  const img = images[activeIndex];

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,20,18,0.96)" }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 flex items-center justify-center w-10 h-10 transition-all"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        <X size={18} />
      </button>

      {/* Prev */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        className="absolute left-4 sm:left-8 z-10 flex items-center justify-center w-11 h-11 transition-all"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Image */}
      <div
        className="relative mx-20 sm:mx-28"
        style={{ maxWidth: "min(860px, 90vw)", width: "100%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full" style={{ paddingBottom: "62%" }}>
          <Image
            src={img.url}
            alt={`Gallery image by ${img.uploader_name}`}
            fill
            className="object-cover"
            sizes="860px"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ border: "1px solid rgba(10,122,123,0.35)" }}
          />
        </div>

        {/* Caption */}
        <div className="flex items-center justify-between mt-4 px-1">
          <div>
            <p style={{ ...eyebrow, color: "rgba(255,255,255,0.40)" }}>
              {new Date(img.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {isPrivileged && (
              <p
                style={{
                  fontFamily: "var(--font-exo2)",
                  fontWeight: 300,
                  fontSize: 18,
                  color: "rgb(221,211,188)",
                  letterSpacing: "0.04em",
                }}
              >
                {img.uploader_name}
              </p>
            )}
          </div>
          <span
            style={{
              ...eyebrow,
              color: "rgba(255,255,255,0.30)",
              fontSize: 10,
            }}
          >
            {activeIndex + 1} / {images.length}
          </span>
        </div>
      </div>

      {/* Next */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        className="absolute right-4 sm:right-8 z-10 flex items-center justify-center w-11 h-11 transition-all"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

// ── Gallery Card ───────────────────────────────────────────────────────────
function GalleryCard({
  image,
  index,
  onClick,
  isPrivileged,
  onDelete,
}: {
  image: GalleryImage;
  index: number;
  onClick: () => void;
  isPrivileged: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className="group relative overflow-hidden cursor-pointer"
      data-aos="zoom-in"
      data-aos-duration="600"
      data-aos-delay={String((index % 6) * 80)}
      onClick={onClick}
      style={{ border: "1px solid rgba(10,122,123,0.12)" }}
    >
      <div className="relative w-full h-64">
        <Image
          src={image.url}
          alt={`Uploaded by ${image.uploader_name}`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Base gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,26,26,0.75) 0%, rgba(10,26,26,0.10) 50%, transparent 100%)",
          }}
        />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "rgba(10,122,123,0.22)" }}
        >
          <div
            className="flex items-center justify-center w-12 h-12"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.35)",
              backdropFilter: "blur(4px)",
            }}
          >
            <ZoomIn size={18} color="#fff" />
          </div>
        </div>

        {/* Delete button — admin/moderator only */}
        {isPrivileged && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(image._id);
            }}
            className="absolute top-3 right-3 z-10 flex items-center justify-center w-8 h-8 opacity-0 group-hover:opacity-100 transition-all duration-200"
            style={{
              background: "rgba(220,38,38,0.85)",
              border: "1px solid rgba(255,255,255,0.25)",
              backdropFilter: "blur(4px)",
              color: "#fff",
              cursor: "pointer",
            }}
            title="Delete image"
          >
            <Trash2 size={14} />
          </button>
        )}

        {/* Caption */}
        <div className="absolute bottom-0 left-0 px-4 pb-4">
          <p
            style={{
              ...eyebrow,
              color: "rgba(255,255,255,0.50)",
              fontSize: "9px",
              marginBottom: 2,
            }}
          >
            {new Date(image.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          {isPrivileged && (
            <p
              style={{
                fontFamily: "var(--font-exo2)",
                fontWeight: 300,
                fontSize: 14,
                color: "#fff",
                letterSpacing: "0.04em",
              }}
            >
              {image.uploader_name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Upload Sheet ───────────────────────────────────────────────────────────
function UploadSheet({
  open,
  onOpenChange,
  onUploadSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUploadSuccess: (images: GalleryImage[]) => void;
}) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UploadFormValues>();

  const watchedFiles = watch("files");

  // Generate previews when files change
  useEffect(() => {
    if (!watchedFiles || watchedFiles.length === 0) {
      setPreviews([]);
      return;
    }
    const urls: string[] = [];
    Array.from(watchedFiles).forEach((file) => {
      urls.push(URL.createObjectURL(file));
    });
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [watchedFiles]);

  const removePreview = (index: number) => {
    // We can't remove individual files from FileList easily,
    // so reset and let the user re-select
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: UploadFormValues) => {
    if (!data.files || data.files.length === 0) return;

    setIsUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      const files = Array.from(data.files);
      formData.append("filesCount", String(files.length));
      files.forEach((file, i) => formData.append(`file_${i}`, file));

      setProgress(40);

      const res = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      const result = await res.json();
      setProgress(100);

      toast.success(`${result.images.length} photo(s) uploaded successfully!`);
      onUploadSuccess(result.images);
      reset();
      setPreviews([]);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      reset();
      setPreviews([]);
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl max-h-[85vh] overflow-y-auto"
        style={{
          fontFamily: "var(--font-exo2)",
          background: "#f2ede1",
          borderTop: "2px solid rgba(10,122,123,0.20)",
        }}
      >
        <SheetHeader className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="flex items-center justify-center w-9 h-9"
              style={{
                background: "rgba(10,122,123,0.10)",
                border: "1px solid rgba(10,122,123,0.25)",
              }}
            >
              <CloudUpload size={18} style={{ color: "#0a7a7b" }} />
            </div>
            <SheetTitle
              style={{
                fontFamily: "var(--font-exo2)",
                fontWeight: 600,
                fontSize: 18,
                color: "rgb(39,39,39)",
                letterSpacing: "0.02em",
              }}
            >
              Upload to Gallery
            </SheetTitle>
          </div>
          <SheetDescription
            style={{
              fontFamily: "var(--font-exo2)",
              fontSize: 13,
              color: "rgba(39,39,39,0.55)",
            }}
          >
            Select one or more photos to add to the Royal Galaxy gallery. Images
            will be optimised automatically.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Drop zone */}
          <div>
            <Label
              style={{
                ...eyebrow,
                color: "rgba(39,39,39,0.55)",
                marginBottom: 10,
                display: "block",
              }}
            >
              Photos
            </Label>

            <div
              className="relative flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200"
              style={{
                border: "2px dashed rgba(10,122,123,0.30)",
                background: "rgba(10,122,123,0.03)",
                padding: "2rem 1.5rem",
                minHeight: 140,
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={28} style={{ color: "rgba(10,122,123,0.50)" }} />
              <p
                style={{
                  fontFamily: "var(--font-exo2)",
                  fontSize: 14,
                  color: "rgba(39,39,39,0.60)",
                  textAlign: "center",
                }}
              >
                Click to select photos, or drag &amp; drop here
              </p>
              <p
                style={{
                  ...eyebrow,
                  fontSize: 9,
                  color: "rgba(39,39,39,0.35)",
                }}
              >
                JPG, PNG, WEBP — up to 10 MB each
              </p>

              <input
                {...register("files", {
                  required: "Please select at least one photo",
                  validate: (files) =>
                    files.length > 0 || "Please select at least one photo",
                })}
                ref={(e) => {
                  register("files").ref(e);
                  (
                    fileInputRef as React.MutableRefObject<HTMLInputElement | null>
                  ).current = e;
                }}
                type="file"
                accept="image/*"
                multiple
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={isUploading}
              />
            </div>

            {errors.files && (
              <p
                className="mt-2"
                style={{
                  fontFamily: "var(--font-exo2)",
                  fontSize: 12,
                  color: "rgb(220,38,38)",
                }}
              >
                {errors.files.message}
              </p>
            )}
          </div>

          {/* Preview grid */}
          {previews.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label
                  style={{
                    ...eyebrow,
                    color: "rgba(39,39,39,0.55)",
                  }}
                >
                  Selected ({previews.length})
                </Label>
                <Badge
                  variant="outline"
                  style={{
                    fontFamily: "var(--font-exo2)",
                    fontSize: 10,
                    borderColor: "rgba(10,122,123,0.30)",
                    color: "#0a7a7b",
                  }}
                >
                  {previews.length} photo{previews.length > 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="group relative overflow-hidden"
                    style={{
                      aspectRatio: "1",
                      border: "1px solid rgba(10,122,123,0.15)",
                    }}
                  >
                    <Image
                      src={src}
                      alt={`Preview ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="120px"
                    />
                    <button
                      type="button"
                      onClick={() => removePreview(i)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: "rgba(220,38,38,0.65)" }}
                    >
                      <X size={16} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload progress */}
          {isUploading && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p
                  style={{
                    fontFamily: "var(--font-exo2)",
                    fontSize: 13,
                    color: "#0a7a7b",
                  }}
                >
                  Uploading to Cloudinary…
                </p>
                <span
                  style={{
                    fontFamily: "var(--font-exo2)",
                    fontSize: 12,
                    color: "rgba(39,39,39,0.50)",
                  }}
                >
                  {progress}%
                </span>
              </div>
              <Progress
                value={progress}
                className="h-1.5"
                style={
                  {
                    background: "rgba(10,122,123,0.12)",
                    "--progress-color": "#0a7a7b",
                  } as React.CSSProperties
                }
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 pb-4">
            <Button
              type="submit"
              disabled={isUploading || previews.length === 0}
              className="flex-1 gap-2"
              style={{
                background: "#0a7a7b",
                color: "#fff",
                fontFamily: "var(--font-exo2)",
                fontWeight: 500,
                letterSpacing: "0.04em",
                fontSize: 13,
                border: "none",
                cursor: isUploading ? "not-allowed" : "pointer",
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <ImagePlus size={15} />
                  Upload{" "}
                  {previews.length > 0
                    ? `${previews.length} Photo${previews.length > 1 ? "s" : ""}`
                    : "Photos"}
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
              style={{
                fontFamily: "var(--font-exo2)",
                fontSize: 13,
                borderColor: "rgba(39,39,39,0.20)",
                color: "rgba(39,39,39,0.60)",
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
const GalleryPage = () => {
  const { user, isLoaded } = useUser();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Role check
  const role = user?.publicMetadata?.role as string | undefined;
  const isPrivileged = role === "admin" || role === "moderator";

  // Fetch images
  const fetchImages = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Failed to fetch images");
      const data = await res.json();
      setImages(data.images ?? []);
    } catch {
      toast.error("Could not load gallery images.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Lightbox
  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  const prevImage = () =>
    setLightboxIndex((i) =>
      i !== null ? (i - 1 + images.length) % images.length : null,
    );
  const nextImage = () =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null));

  // Upload success
  const handleUploadSuccess = (newImages: GalleryImage[]) => {
    setImages((prev) => [...newImages, ...prev]);
  };

  // Delete
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/galleryDelete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteTarget }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Delete failed");
      }
      setImages((prev) => prev.filter((img) => img._id !== deleteTarget));
      toast.success("Image deleted successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <>
      <AOSInit />
      <main
        className={`${exo2.variable} bg-[#f2ede1] min-h-screen flex flex-col`}
      >
        {/* ── HERO ────────────────────────────────────────────────────── */}
        <section
          className="relative bg-[#0a7a7b] flex flex-col items-center justify-center text-center text-white px-4 sm:px-8 overflow-hidden"
          style={{ minHeight: "110vh" }}
        >
          {/* Line texture */}
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,1) 3px,rgba(255,255,255,1) 4px)",
            }}
          />

          {/* Top ornament */}
          <div
            data-aos="fade-down"
            data-aos-delay="0"
            className="flex flex-col items-center mb-7"
          >
            <div className="w-px h-10 bg-white/25 mb-3" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-white/35" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/55" />
              <div className="w-8 h-px bg-white/35" />
            </div>
          </div>

          {/* Eyebrow */}
          <p
            data-aos="fade-down"
            data-aos-delay="100"
            style={{ ...eyebrow, color: "rgba(255,255,255,0.60)" }}
            className="mb-5"
          >
            Photo Gallery
          </p>

          {/* Title */}
          <h1
            data-aos="fade-down"
            data-aos-delay="200"
            className="px-4 mb-3"
            style={{
              fontFamily: "var(--font-exo2)",
              fontWeight: 300,
              fontSize: "clamp(2.4rem, 6vw, 72px)",
              lineHeight: "clamp(2.8rem, 7vw, 82px)",
              color: "rgb(230, 221, 202)",
              letterSpacing: "0.06em",
            }}
          >
            A Glimpse of{" "}
            <em
              style={{
                fontStyle: "italic",
                fontWeight: 300,
                color: "rgba(230,221,202,0.72)",
              }}
            >
              Royal Galaxy
            </em>
          </h1>

          {/* Divider */}
          <div
            data-aos="fade-down"
            data-aos-delay="300"
            className="flex items-center gap-4 my-6"
          >
            <div className="w-14 h-px bg-white/25" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/45" />
            <div className="w-14 h-px bg-white/25" />
          </div>

          {/* Subheading */}
          <p
            data-aos="fade-up"
            data-aos-delay="380"
            className="max-w-xs sm:max-w-md mb-8 px-4"
            style={{
              ...body,
              color: "rgba(255,255,255,0.70)",
              fontSize: "clamp(14px, 1.5vw, 16px)",
              lineHeight: "1.85",
              letterSpacing: "0.02em",
            }}
          >
            Explore the beauty of our rooms, the wildlife of Chitwan, and every
            experience that awaits you at Royal Galaxy Hotel &amp; Lodge.
          </p>

          {/* Wave out */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
            <svg
              viewBox="0 0 1440 60"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z"
                fill="#f2ede1"
              />
            </svg>
          </div>
        </section>

        {/* ── GALLERY GRID ────────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto w-full px-4 sm:px-8 pt-14 pb-32">
          {/* Section label */}
          <div
            data-aos="fade-up"
            data-aos-duration="500"
            className="flex items-center gap-4 mb-10"
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(10,122,123,0.20), transparent)",
              }}
            />
            <p style={{ ...eyebrow, color: "rgba(10,122,123,0.60)" }}>
              Our Collection
            </p>
            <div
              style={{
                flex: 1,
                height: 1,
                background:
                  "linear-gradient(90deg, transparent, rgba(10,122,123,0.20), transparent)",
              }}
            />
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2
                size={32}
                className="animate-spin"
                style={{ color: "rgba(10,122,123,0.50)" }}
              />
              <p
                style={{
                  ...eyebrow,
                  color: "rgba(39,39,39,0.35)",
                  fontSize: 10,
                }}
              >
                Loading gallery…
              </p>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && images.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-24 gap-4"
              style={{
                border: "1px dashed rgba(10,122,123,0.20)",
                background: "rgba(10,122,123,0.02)",
              }}
            >
              <ImagePlus size={36} style={{ color: "rgba(10,122,123,0.30)" }} />
              <p
                style={{
                  fontFamily: "var(--font-exo2)",
                  fontWeight: 300,
                  fontSize: 18,
                  color: "rgba(39,39,39,0.40)",
                  letterSpacing: "0.04em",
                }}
              >
                No photos yet
              </p>
              {isPrivileged && (
                <p
                  style={{
                    ...eyebrow,
                    color: "rgba(10,122,123,0.40)",
                    fontSize: 9,
                  }}
                >
                  Use the upload button to add photos
                </p>
              )}
            </div>
          )}

          {/* Grid */}
          {!isLoading && images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {images.map((image, index) => (
                <GalleryCard
                  key={image._id}
                  image={image}
                  index={index}
                  onClick={() => openLightbox(index)}
                  isPrivileged={isPrivileged}
                  onDelete={(id) => setDeleteTarget(id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── CTA ─────────────────────────────────────────────────────── */}
        <CTA />
      </main>

      {/* ── FAB: Upload Button (admin/moderator only) ────────────────── */}
      {isLoaded && isPrivileged && (
        <button
          onClick={() => setSheetOpen(true)}
          className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-5 py-3 shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: "#0a7a7b",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.15)",
            fontFamily: "var(--font-exo2)",
            fontWeight: 500,
            letterSpacing: "0.06em",
            fontSize: 12,
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(10,122,123,0.45)",
          }}
        >
          <ImagePlus size={16} />
          Add Photos
        </button>
      )}

      {/* ── Upload Sheet ─────────────────────────────────────────────── */}
      <UploadSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* ── Lightbox ─────────────────────────────────────────────────── */}
      {lightboxIndex !== null && images.length > 0 && (
        <Lightbox
          images={images}
          activeIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevImage}
          onNext={nextImage}
          isPrivileged={isPrivileged}
        />
      )}

      {/* ── Delete Confirm Dialog ─────────────────────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent
          style={{ fontFamily: "var(--font-exo2)", background: "#f2ede1" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              style={{ fontFamily: "var(--font-exo2)", fontWeight: 600 }}
            >
              Delete this photo?
            </AlertDialogTitle>
            <AlertDialogDescription
              style={{
                fontFamily: "var(--font-exo2)",
                color: "rgba(39,39,39,0.55)",
              }}
            >
              This will permanently remove the image from Cloudinary and the
              gallery. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              style={{ fontFamily: "var(--font-exo2)", fontSize: 13 }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              style={{
                background: "rgb(220,38,38)",
                fontFamily: "var(--font-exo2)",
                fontSize: 13,
              }}
            >
              {isDeleting ? (
                <>
                  <Loader2 size={13} className="animate-spin mr-2" />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GalleryPage;
