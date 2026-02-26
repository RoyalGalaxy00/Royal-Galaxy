import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/RGconn";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from "cloudinary";

// ── Cloudinary config ─────────────────────────────────────────────────────
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// ── Types ─────────────────────────────────────────────────────────────────
interface MediaFile {
    url: string;
    public_id: string;
    type: "image" | "video";
}

interface DeleteResult {
    public_id: string;
    status: "deleted" | "failed";
    reason?: string;
}

// ── DELETE /api/deleteAPI ─────────────────────────────────────────────────
export async function DELETE(request: NextRequest) {
    try {
        // ── 1. Parse body ───────────────────────────────────────────────────
        const body = await request.json();
        const { id, collection } = body as { id?: string; collection?: string };

        if (!id || !collection) {
            return NextResponse.json(
                { success: false, error: "Missing required fields: id and collection" },
                { status: 400 }
            );
        }

        if (!ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: "Invalid ID format" },
                { status: 400 }
            );
        }

        // ── 2. Connect & fetch document ─────────────────────────────────────
        const db = await connectDB();
        const col = db.collection(collection);

        const document = await col.findOne({ _id: new ObjectId(id) });

        if (!document) {
            return NextResponse.json(
                { success: false, error: "Document not found" },
                { status: 404 }
            );
        }

        // ── 3. Delete media from Cloudinary ─────────────────────────────────
        const mediaFiles: MediaFile[] = Array.isArray(document.media)
            ? document.media
            : [];

        const cloudinaryResults: DeleteResult[] = await Promise.all(
            mediaFiles.map(async (media) => {
                // Prefer public_id; fall back to extracting it from the URL
                const publicId = media.public_id || extractPublicId(media.url);

                if (!publicId) {
                    return { public_id: media.url, status: "failed", reason: "Could not resolve public_id" };
                }

                try {
                    // resource_type must match — "image" or "video"
                    const resourceType = media.type === "video" ? "video" : "image";
                    const result = await cloudinary.uploader.destroy(publicId, {
                        resource_type: resourceType,
                    });

                    // Cloudinary returns { result: "ok" } on success
                    if (result.result === "ok" || result.result === "not found") {
                        return { public_id: publicId, status: "deleted" };
                    }

                    return {
                        public_id: publicId,
                        status: "failed",
                        reason: result.result ?? "Unknown Cloudinary error",
                    };
                } catch (err) {
                    return {
                        public_id: publicId,
                        status: "failed",
                        reason: err instanceof Error ? err.message : "Cloudinary error",
                    };
                }
            })
        );

        // ── 4. Delete document from MongoDB ─────────────────────────────────
        const deleteResult = await col.deleteOne({ _id: new ObjectId(id) });

        if (deleteResult.deletedCount === 0) {
            return NextResponse.json(
                { success: false, error: "Failed to delete document from database" },
                { status: 500 }
            );
        }

        // ── 5. Respond ───────────────────────────────────────────────────────
        const failedMedia = cloudinaryResults.filter((r) => r.status === "failed");

        return NextResponse.json(
            {
                success: true,
                message: "Post deleted successfully",
                media: {
                    total: mediaFiles.length,
                    deleted: cloudinaryResults.filter((r) => r.status === "deleted").length,
                    failed: failedMedia.length,
                    // Only include failure details if something went wrong
                    ...(failedMedia.length > 0 && { failures: failedMedia }),
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[deleteAPI] Unhandled error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}

// ── Utility: extract Cloudinary public_id from a URL ─────────────────────
// e.g. https://res.cloudinary.com/<cloud>/image/upload/v123456/folder/filename.jpg
//                                                                 ^^^^^^^^^^^^^^^^^ → public_id
function extractPublicId(url: string): string | null {
    try {
        const { pathname } = new URL(url);
        // pathname: /cloud_name/image/upload/v123456/folder/filename.jpg
        // Strip everything up to and including /upload/
        const uploadIndex = pathname.indexOf("/upload/");
        if (uploadIndex === -1) return null;

        const afterUpload = pathname.slice(uploadIndex + 8); // skip "/upload/"

        // Remove the version segment if present (e.g. "v1234567/")
        const withoutVersion = afterUpload.replace(/^v\d+\//, "");

        // Remove file extension
        const dotIndex = withoutVersion.lastIndexOf(".");
        return dotIndex !== -1 ? withoutVersion.slice(0, dotIndex) : withoutVersion;
    } catch {
        return null;
    }
}