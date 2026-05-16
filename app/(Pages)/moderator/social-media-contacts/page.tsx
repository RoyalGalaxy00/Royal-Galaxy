"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Facebook, Instagram, Music, ImagePlus, Trash2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { saveSocialProfile } from "@/app/actions/saveSocialProfile";
import { useRouter } from "next/navigation";

// Schema without additionalLinks
const formSchema = z.object({
  facebook: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  instagram: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  tiktok: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

export default function SocialMediaContactsPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      facebook: "",
      instagram: "",
      tiktok: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setImageFile(null);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const formData = new FormData();
    if (data.facebook) formData.append("facebook", data.facebook);
    if (data.instagram) formData.append("instagram", data.instagram);
    if (data.tiktok) formData.append("tiktok", data.tiktok);
    if (imageFile) formData.append("ownerImage", imageFile);

    try {
      const result = await saveSocialProfile(formData);
      if (result.success) {
        toast.success("Profile saved successfully!");
        router.refresh();
        form.reset();
        removeImage();
      } else {
        toast.error(result.error || "Failed to save profile");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-right" richColors />
      <Card className="w-full max-w-4xl mx-auto shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-t-xl">
          <CardTitle className="text-2xl font-bold text-center text-gray-800 dark:text-white">
            Owner Social & Image Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Responsive grid for social fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Facebook */}
                <FormField
                  control={form.control}
                  name="facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Facebook className="w-4 h-4 text-blue-600" />
                        Facebook Page URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://facebook.com/yourpage"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Instagram */}
                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-600" />
                        Instagram Page URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://instagram.com/yourhandle"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* TikTok */}
                <FormField
                  control={form.control}
                  name="tiktok"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-black dark:text-white" />
                        TikTok Account URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://tiktok.com/@yourhandle"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Owner Image Upload with Preview */}
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                <FormLabel className="flex items-center gap-2 mb-3">
                  <ImagePlus className="w-4 h-4 text-green-600" />
                  Owner Image
                </FormLabel>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 w-full">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a profile picture (JPG, PNG, WebP)
                    </p>
                  </div>
                  {imagePreview && (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Owner preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-2 text-base"
              >
                {isSubmitting ? "Saving..." : "Save Social & Image Info"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
