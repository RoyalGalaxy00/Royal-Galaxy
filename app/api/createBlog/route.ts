// app/api/blogPost/route.js
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/RGconn';
import { ObjectId } from 'mongodb';
import { cloudinary } from '@/lib/RGcloud';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const title = formData.get('title') as string;
        const excerpt = formData.get('excerpt') as string;
        const content = formData.get('content') as string;
        const uploader = formData.get('uploader') as string;
        const uploader_email = formData.get('uploader_email') as string;
        const uploader_avatar = formData.get('uploader_avatar') as string;
        const user_id = formData.get('user_id') as string;
        const tags = JSON.parse((formData.get('tags') as string) || '[]');

        if (!title || !excerpt || !content) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const mediaFilesCount = parseInt((formData.get('mediaFilesCount') as string) || '0');
        const mediaTypes = JSON.parse((formData.get('mediaTypes') as string) || '[]');

        const mediaFiles = [];

        // ✅ fixed: was returning early from POST, now properly awaits each upload
        for (let i = 0; i < mediaFilesCount; i++) {
            const file = formData.get(`mediaFile_${i}`) as File | null;
            if (!file) continue;

            const fileType = mediaTypes[i] || 'image'; // ✅ fixed: fileType was undefined

            try {
                const result = await uploadToCloudinary(file, fileType);
                mediaFiles.push({
                    url: result.secure_url,
                    type: fileType,
                    public_id: result.public_id,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                    created_at: new Date()
                });
            } catch (uploadError: any) {
                return NextResponse.json(
                    { error: `Failed to upload file ${i}: ${uploadError.message}` },
                    { status: 500 }
                );
            }
        }

        const db = await connectDB();

        const blogPost = {
            title,
            excerpt,
            content,
            uploader,
            uploader_email,
            uploader_avatar,
            user_id,
            tags,
            media: mediaFiles,
            created_at: new Date(),
            comments: []
        };

        const result = await db.collection('Journal').insertOne(blogPost);

        return NextResponse.json({
            success: true,
            message: "Blog post created successfully",

        });

    } catch (error: any) {
        console.error("Error creating blog post:", error);
        return NextResponse.json(
            { error: "Failed to create blog post: " + error.message },
            { status: 500 }
        );
    }
}

async function uploadToCloudinary(file: File, fileType: string) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64}`;

        const options = {
            folder: 'Journal',
            resource_type: fileType === 'video' ? 'video' : 'image' as 'video' | 'image',
            transformation: fileType === 'image' ? [
                { quality: 'auto:best', fetch_format: 'auto' }
            ] : [
                { quality: 'auto:best' }
            ]
        };

        return await cloudinary.uploader.upload(dataURI, options);
    } catch (error: any) {
        console.error("Error uploading to Cloudinary:", error);
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
}