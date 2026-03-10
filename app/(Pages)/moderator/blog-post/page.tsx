"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Upload,
  Tag,
  X,
  AlertCircle,
  Plus,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUser } from "@clerk/nextjs";

// ─── Schema ────────────────────────────────────────────────────────────────────
const BlogFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(4, { message: "Title must be at least 5 characters." })
    .max(900, { message: "Title cannot exceed 100 characters." }),
  excerpt: z
    .string()
    .trim()
    .min(4, { message: "Excerpt must be at least 4 characters." })
    .max(900, { message: "Excerpt cannot exceed 200 characters." }),
  content: z
    .string()
    .trim()
    .min(20, { message: "Content must be at least 20 characters." })
    .max(10000, { message: "Content cannot exceed 10000 characters." }),
  mediaFiles: z.array(z.any()).optional(),
  tags: z.array(z.string().trim()).optional(),
});

// ─── Types ─────────────────────────────────────────────────────────────────────
type DialogState = {
  open: boolean;
  type: "success" | "error" | "warning" | null;
  title: string;
  message: string;
};
type MediaItem = {
  file: File;
  preview: string;
  type: "image" | "video";
  name: string;
};
// ─── Component ─────────────────────────────────────────────────────────────────
const BlogPostForm = () => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [activeTab, setActiveTab] = useState("content");
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useUser();
  // ── Alert Dialog state ──────────────────────────────────────────────────────
  const [dialog, setDialog] = useState<DialogState>({
    open: false,
    type: null,
    title: "",
    message: "",
  });

  const showDialog = (
    type: "success" | "error" | "warning",
    title: string,
    message: string,
  ) => setDialog({ open: true, type, title, message });

  const closeDialog = () =>
    setDialog({ open: false, type: null, title: "", message: "" });

  // ── Form ────────────────────────────────────────────────────────────────────
  const form = useForm({
    resolver: zodResolver(BlogFormSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      mediaFiles: [],
      tags: [],
    },
    mode: "onChange",
  });

  const tags = form.watch("tags") || [];

  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (data: z.infer<typeof BlogFormSchema>) => {
    try {
      if (!user) {
        showDialog(
          "error",
          "Error",
          "You must be logged in to create a blog post.",
        );
        return;
      }

      const uploader_name =
        (isLoaded && isSignedIn && user?.username) ||
        user?.fullName ||
        "Anonymous";
      const uploader_email =
        (isLoaded && isSignedIn && user?.primaryEmailAddress?.emailAddress) ||
        "Anonymous";
      const uploader_avatar =
        (isLoaded && isSignedIn && user?.imageUrl) || "Anonymous";

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("excerpt", data.excerpt);
      formData.append("content", data.content);
      formData.append("uploader", uploader_name);
      formData.append("uploader_email", uploader_email);
      formData.append("uploader_avatar", uploader_avatar);
      formData.append("user_id", user?.id || "");

      if (data.mediaFiles && data.mediaFiles.length > 0) {
        data.mediaFiles.forEach((file, index) => {
          formData.append(`mediaFile_${index}`, file);
        });
        formData.append("mediaFilesCount", String(data.mediaFiles.length));
        formData.append(
          "mediaTypes",
          JSON.stringify(mediaItems.map((item) => item.type)),
        );
      }

      const tags = (data.tags || [])
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0)
        .map((tag: string) => tag.charAt(0).toUpperCase() + tag.slice(1));

      formData.append("tags", JSON.stringify(tags));

      const res = await fetch("/api/createBlog", {
        method: "POST",
        body: formData,
      });

      // ── Handle non-2xx HTTP responses ──────────────────────────────────────
      if (!res.ok) {
        let errorMessage = "Something went wrong. Please try again.";

        try {
          const errorData = await res.json();
          errorMessage = errorData?.error || errorMessage;
        } catch {
          // response body wasn't JSON — keep default message
        }

        showDialog("error", `Failed to Publish (${res.status})`, errorMessage);
        return;
      }

      // ── Success ────────────────────────────────────────────────────────────
      showDialog(
        "success",
        "Post Published!",
        "Your blog post has been created successfully and is now live.",
      );

      form.reset();
      setMediaItems([]);
    } catch (error: any) {
      // ── Network / unexpected errors ────────────────────────────────────────
      console.error("Error submitting form:", error);

      const isNetworkError =
        error instanceof TypeError && error.message === "Failed to fetch";

      showDialog(
        "error",
        isNetworkError ? "Network Error" : "Unexpected Error",
        isNetworkError
          ? "Unable to reach the server. Please check your internet connection and try again."
          : error?.message || "An unexpected error occurred. Please try again.",
      );
    }
  };

  // ── Media Upload ────────────────────────────────────────────────────────────
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 50 * 1024 * 1024;
    const maxImageSize = 5 * 1024 * 1024;
    const maxFiles = 10;

    if (mediaItems.length + files.length > maxFiles) {
      showDialog(
        "warning",
        "Too Many Files",
        `You can upload a maximum of ${maxFiles} files.`,
      );
      return;
    }

    const validFiles = files.filter((file: File) => {
      const isVideo = file.type.startsWith("video/");
      const maxAllowedSize = isVideo ? maxSize : maxImageSize;

      if (file.size > maxAllowedSize) {
        showDialog(
          "error",
          "File Too Large",
          `"${file.name}" exceeds the ${isVideo ? "50MB video" : "5MB image"} limit.`,
        );
        return false;
      }

      if (!(file.type.startsWith("image/") || file.type.startsWith("video/"))) {
        showDialog(
          "error",
          "Unsupported Format",
          `"${file.name}" is not a supported image or video format.`,
        );
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    validFiles.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Ensure preview is a string
        const preview = reader.result as string;

        const newMediaItem: MediaItem = {
          file,
          preview, // Now guaranteed to be string
          type: file.type.startsWith("video/") ? "video" : "image",
          name: file.name,
        };

        setMediaItems((prev) => [...prev, newMediaItem]);
        const currentFiles = form.getValues("mediaFiles") || [];
        form.setValue("mediaFiles", [...currentFiles, file]);
      };
      reader.onerror = () => {
        showDialog(
          "error",
          "File Read Error",
          `Failed to read "${file.name}". Please try again.`,
        );
      };
      reader.readAsDataURL(file);
    });
  };

  // ── Remove Media ────────────────────────────────────────────────────────────
  const handleRemoveMediaItem = (index: number) => {
    setMediaItems((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
    const currentFiles = form.getValues("mediaFiles") || [];
    const updatedFiles = [...currentFiles];
    updatedFiles.splice(index, 1);
    form.setValue("mediaFiles", updatedFiles);
  };

  // ── Tags ────────────────────────────────────────────────────────────────────
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;

    if (tags.includes(trimmed)) {
      showDialog("warning", "Duplicate Tag", `"${trimmed}" is already added.`);
      return;
    }
    if (tags.length >= 10) {
      showDialog("warning", "Tag Limit Reached", "Maximum 10 tags allowed.");
      return;
    }
    form.setValue("tags", [...tags, trimmed]);
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue(
      "tags",
      tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // ── Dialog icon helper ──────────────────────────────────────────────────────
  const DialogIcon = () => {
    if (dialog.type === "success")
      return <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />;
    if (dialog.type === "error")
      return <XCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />;
    return <AlertCircle className="w-10 h-10 text-yellow-500 mx-auto mb-2" />;
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="mt-20 py-6 px-4 sm:px-6 lg:px-8 w-full">
      <div className="max-w-5xl mx-auto">
        {/* ── Alert Dialog ─────────────────────────────────────────────────── */}
        <AlertDialog open={dialog.open} onOpenChange={closeDialog}>
          <AlertDialogContent className="max-w-md text-center">
            <AlertDialogHeader className="items-center">
              <DialogIcon />
              <AlertDialogTitle className="text-xl font-semibold">
                {dialog.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                {dialog.message}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="justify-center">
              <AlertDialogAction onClick={closeDialog}>OK</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="mb-8 sm:mb-10 flex flex-col items-center justify-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            Create Blog Post
          </h1>
          <p className="text-muted-foreground mt-3 text-base sm:text-lg text-center max-w-2xl">
            Fill in the details below to create a new blog post with rich media
            content
          </p>
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <Tabs
          defaultValue="content"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mb-6"
        >
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
            <TabsTrigger value="content" className="text-sm sm:text-base">
              Content
            </TabsTrigger>
            <TabsTrigger value="media" className="text-sm sm:text-base">
              Media & Tags
            </TabsTrigger>
          </TabsList>

          <Card className="mt-6 shadow-md border-border">
            <CardHeader className="px-5 sm:px-6 lg:px-8 pb-4">
              <CardTitle className="text-xl sm:text-2xl font-semibold">
                Blog Post Details
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Provide all necessary information for your blog post. All fields
                are required unless marked optional.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-5 sm:px-6 lg:px-8 pb-8">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6 sm:space-y-8"
                >
                  {/* ── Content Tab ──────────────────────────────────────── */}
                  <TabsContent
                    value="content"
                    className="mt-0 space-y-6 sm:space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base sm:text-lg font-medium">
                            Title (Required)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter a compelling title for your post"
                              {...field}
                              className="w-full text-base sm:text-lg py-3"
                            />
                          </FormControl>
                          <FormDescription className="text-xs sm:text-sm">
                            Make it catchy and descriptive. This will be the
                            main headline.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base sm:text-lg font-medium">
                            Sub-Heading (Required)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write a brief summary of your post (will appear in previews)"
                              className="min-h-[80px] sm:min-h-[100px] resize-y w-full text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs sm:text-sm">
                            A short description that will appear in blog
                            listings and meta descriptions.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base sm:text-lg font-medium">
                            Content (Required)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Write your blog post content here..."
                              className="min-h-[250px] sm:min-h-[350px] lg:min-h-[450px] resize-y w-full text-base"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-xs sm:text-sm">
                            Write the main content of your blog post. Supports
                            Markdown formatting.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {/* ── Media & Tags Tab ─────────────────────────────────── */}
                  <TabsContent
                    value="media"
                    className="mt-0 space-y-6 sm:space-y-8"
                  >
                    <FormField
                      control={form.control}
                      name="mediaFiles"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base sm:text-lg font-medium">
                            Media Files (Images & Videos)
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <div className="flex flex-col items-center justify-center w-full">
                                <label
                                  htmlFor="media-upload"
                                  className="flex flex-col items-center justify-center w-full h-48 sm:h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:bg-muted/20 transition-colors"
                                >
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                                      <Film className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <p className="mb-2 text-sm sm:text-base text-muted-foreground text-center">
                                      <span className="font-semibold">
                                        Click to upload
                                      </span>{" "}
                                      or drag and drop
                                    </p>
                                    <p className="text-xs sm:text-sm text-muted-foreground text-center">
                                      Images: PNG, JPG, GIF, WEBP (MAX. 5MB
                                      each)
                                    </p>
                                    <p className="text-xs sm:text-sm text-muted-foreground text-center">
                                      Videos: MP4, WEBM (MAX. 50MB each)
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground text-center">
                                      Max 10 files total
                                    </p>
                                  </div>
                                  <input
                                    id="media-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={handleMediaUpload}
                                  />
                                </label>
                              </div>

                              {mediaItems.length > 0 && (
                                <div className="w-full">
                                  <h3 className="text-sm font-medium mb-3">
                                    Media Preview ({mediaItems.length})
                                  </h3>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                                    {mediaItems.map((item, index) => (
                                      <div
                                        key={index}
                                        className="relative group rounded-lg border overflow-hidden aspect-square"
                                      >
                                        {item.type === "image" ? (
                                          <img
                                            src={item.preview}
                                            alt={`Media ${index}`}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="relative w-full h-full flex items-center justify-center bg-black/10">
                                            <video
                                              src={item.preview}
                                              className="max-h-full max-w-full"
                                              controls
                                            />
                                          </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                                          {item.name}
                                        </div>
                                        <Button
                                          type="button"
                                          variant="destructive"
                                          size="icon"
                                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() =>
                                            handleRemoveMediaItem(index)
                                          }
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs sm:text-sm mt-3">
                            Upload images and videos to enhance your blog post.
                            First image will be used as the featured image.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base sm:text-lg font-medium">
                            Tags
                          </FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Add a tag and press Enter"
                                  value={tagInput}
                                  onChange={(e) => setTagInput(e.target.value)}
                                  onKeyPress={handleTagKeyPress}
                                  className="flex-1 text-base"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={handleAddTag}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 min-h-[40px] p-3 border border-input rounded-md">
                                  {tags.map((tag, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="flex items-center gap-1 px-3 py-1.5 text-sm"
                                    >
                                      <Tag className="h-3 w-3" />
                                      {tag}
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 ml-1 hover:bg-transparent"
                                        onClick={() => handleRemoveTag(tag)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs sm:text-sm">
                            Add relevant tags to help users find your content.
                            Maximum 10 tags.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <Separator className="my-4 sm:my-6" />

                  {/* ── Actions ──────────────────────────────────────────── */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-3 w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          form.reset();
                          setMediaItems([]);
                        }}
                        className="flex-1 sm:flex-none text-sm sm:text-base py-2.5"
                      >
                        Clear Form
                      </Button>
                      <Button
                        type="submit"
                        disabled={form.formState.isSubmitting}
                        className="flex-1 sm:flex-none text-sm sm:text-base py-2.5"
                      >
                        {form.formState.isSubmitting
                          ? "Publishing..."
                          : "Publish Post"}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
};

export default BlogPostForm;
