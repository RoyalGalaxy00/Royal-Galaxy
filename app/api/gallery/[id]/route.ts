import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/RGconn";
import { cloudinary } from "@/lib/RGcloud";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ObjectId } from "mongodb";

// ── DELETE: Remove image from Cloudinary + MongoDB ─────────────────────────
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Auth check
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await currentUser();
        const role = user?.publicMetadata?.role as string | undefined;
        const isAllowed = role === "admin" || role === "moderator";
        if (!isAllowed) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id } = await params;

        if (!ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid image ID" }, { status: 400 });
        }

        const db = await connectDB();
        const image = await db
            .collection("Gallery")
            .findOne({ _id: new ObjectId(id) });

        if (!image) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(image.public_id, {
            resource_type: "image",
        });

        // Delete from MongoDB
        await db.collection("Gallery").deleteOne({ _id: new ObjectId(id) });

        return NextResponse.json({
            success: true,
            message: "Image deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting gallery image:", error);
        const msg =
            error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json(
            { error: `Failed to delete: ${msg}` },
            { status: 500 }
        );
    }
}