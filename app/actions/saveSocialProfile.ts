"use server";

import { connectDB } from "@/lib/RGconn";
import { ObjectId } from "mongodb";
import { cloudinary } from "@/lib/RGcloud";
import { revalidatePath } from "next/cache";

// Helper to upload image buffer to Cloudinary
async function uploadToCloudinary(fileBuffer: Buffer, fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "OwnerProfile",
                public_id: `${Date.now()}-${fileName}`,
                resource_type: "image",
            },
            (error, result) => {
                if (error || !result) reject(error || new Error("Upload failed"));
                else resolve(result.secure_url);
            }
        );
        uploadStream.end(fileBuffer);
    });
}

// Server Action
export async function saveSocialProfile(formData: FormData) {
    try {
        // Extract only the three social links
        const facebook = formData.get("facebook") as string | null;
        const instagram = formData.get("instagram") as string | null;
        const tiktok = formData.get("tiktok") as string | null;
        const ownerImage = formData.get("ownerImage") as File | null;

        // At least one social link or image is required
        if (!facebook && !instagram && !tiktok && !ownerImage) {
            return { success: false, error: "At least one social link or an image is required" };
        }

        const db = await connectDB();
        if (!db) return { success: false, error: "Database connection failed" };

        // Save social links to 'Links' collection
        let linksDocId: string | null = null;
        if (facebook || instagram || tiktok) {
            const linksData: any = { createdAt: new Date() };
            if (facebook) linksData.facebook = facebook;
            if (instagram) linksData.instagram = instagram;
            if (tiktok) linksData.tiktok = tiktok;

            const result = await db.collection("Links").insertOne(linksData);
            linksDocId = result.insertedId.toString();
        }

        // Handle image upload to Cloudinary and store URL in 'OwnerProfile' collection
        let imageUrl: string | null = null;
        let profileDocId: string | null = null;

        if (ownerImage && ownerImage.size > 0) {
            const buffer = Buffer.from(await ownerImage.arrayBuffer());
            const fileName = ownerImage.name.replace(/\s/g, "_");
            imageUrl = await uploadToCloudinary(buffer, fileName);

            const profileData = {
                imageUrl,
                uploadedAt: new Date(),
                linksId: linksDocId ? new ObjectId(linksDocId) : null,
            };
            const result = await db.collection("OwnerProfile").insertOne(profileData);
            profileDocId = result.insertedId.toString();
        }

        revalidatePath("/moderator/social-media-contacts");

        return {
            success: true,
            data: {
                linksId: linksDocId,
                profileId: profileDocId,
                imageUrl,
            },
        };
    } catch (error: any) {
        console.error("Server action error:", error);
        return {
            success: false,
            error: error.message || "Failed to save profile",
        };
    }
}