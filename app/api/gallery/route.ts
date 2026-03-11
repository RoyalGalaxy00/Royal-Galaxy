import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/RGconn";
import { cloudinary } from "@/lib/RGcloud";
import { auth, currentUser } from "@clerk/nextjs/server";

// ── GET: Fetch all gallery images ──────────────────────────────────────────
export async function GET() {
    try {
        const db = await connectDB();
        const images = await db
            .collection("Gallery")
            .find({})
            .sort({ created_at: -1 })
            .toArray();

        return NextResponse.json({ success: true, images });
    } catch (error) {
        console.error("Error fetching gallery images:", error);
        return NextResponse.json(
            { error: "Failed to fetch images" },
            { status: 500 }
        );
    }
}

// ── POST: Upload images to Cloudinary + save metadata to MongoDB ───────────
export async function POST(request: NextRequest) {
    try {
        // Auth check
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get Clerk user metadata
        const user = await currentUser();
        const role = user?.publicMetadata?.role as string | undefined;
        const isAllowed = role === "admin" || role === "moderator";
        if (!isAllowed) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const formData = await request.formData();
        const filesCount = parseInt(
            (formData.get("filesCount") as string) || "0"
        );

        if (filesCount === 0) {
            return NextResponse.json(
                { error: "No files provided" },
                { status: 400 }
            );
        }

        const db = await connectDB();
        const uploadedImages = [];

        for (let i = 0; i < filesCount; i++) {
            const file = formData.get(`file_${i}`);
            if (!file || typeof file === "string") continue;

            // Convert to base64 and upload to Cloudinary
            const arrayBuffer = await (file as File).arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const base64 = buffer.toString("base64");
            const dataURI = `data:${(file as File).type};base64,${base64}`;

            const cloudResult = await cloudinary.uploader.upload(dataURI, {
                folder: "Gallery",
                resource_type: "image",
                transformation: [{ quality: "auto:good", fetch_format: "auto" }],
            });

            const imageDoc = {
                url: cloudResult.secure_url,
                public_id: cloudResult.public_id,
                width: cloudResult.width,
                height: cloudResult.height,
                format: cloudResult.format,
                uploader_id: userId,
                uploader_name:
                    `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() ||
                    user?.username ||
                    "Unknown",
                uploader_email:
                    user?.emailAddresses?.[0]?.emailAddress ?? "unknown@email.com",
                uploader_avatar: user?.imageUrl ?? "",
                created_at: new Date(),
            };

            const result = await db.collection("Gallery").insertOne(imageDoc);
            uploadedImages.push({ ...imageDoc, _id: result.insertedId });
        }

        return NextResponse.json({
            success: true,
            message: `${uploadedImages.length} image(s) uploaded successfully`,
            images: uploadedImages,
        });
    } catch (error) {
        console.error("Error uploading gallery images:", error);
        const msg =
            error instanceof Error ? error.message : "Unknown error occurred";
        return NextResponse.json(
            { error: `Failed to upload: ${msg}` },
            { status: 500 }
        );
    }
}