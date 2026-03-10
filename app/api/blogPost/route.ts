// app/api/blogPost/route.js
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/RGconn';
import { ObjectId } from 'mongodb';
import { cloudinary } from '@/lib/RGcloud';

export async function POST(request: NextRequest) {
    try {
        // Get form data from the request
        const formData = await request.formData();

        // Extract basic blog post data
        const title = formData.get('title') as string;
        const excerpt = formData.get('excerpt') as string;
        const content = formData.get('content') as string;
        const uploader = formData.get('uploader') as string;
        const uploader_email = formData.get('uploader_email') as string;
        const uploader_avatar = formData.get('uploader_avatar') as string;
        const user_id = formData.get('user_id');
        const tags = JSON.parse(formData.get('tags') as string || '[]');

        // Validate required fields
        if (!title || !excerpt || !content) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get media files information
        const mediaFilesCount = parseInt(formData.get('mediaFilesCount') as string || '0');
        const mediaTypes = JSON.parse(formData.get('mediaTypes') as string || '[]');

        // Array to store Cloudinary upload results
        const mediaFiles = [];

        // Upload each media file to Cloudinary
        for (let i = 0; i < mediaFilesCount; i++) {
            const file = formData.get(`mediaFile_${i}`);
            if (!file) continue;

            // Check if it's actually a File object
            if (typeof file === 'string') {
                console.warn(`Expected file but got string for mediaFile_${i}`);
                continue;
            }

            // Now TypeScript knows file is File type
            const fileTypeValue = mediaTypes[i] || (file.type.startsWith('video/') ? 'video' : 'image');
            const fileType = fileTypeValue as 'image' | 'video'; // Type assertion
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
        }

        // Connect to MongoDB
        const db = await connectDB();

        // Create the blog post object
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

        // Insert into MongoDB
        const result = await db.collection('Er-Blogs').insertOne(blogPost);

        // Return success response
        return NextResponse.json({
            success: true,
            message: "Blog post created successfully",
            id: result.insertedId
        });

    } catch (error) {
        console.error("Error creating blog post:", error);

        const errorMessage = error instanceof Error
            ? `Failed to create blog post: ${error.message}`
            : "Failed to create blog post: An unexpected error occurred";

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}

/**
 * Uploads a file to Cloudinary
 * @param file - The file to upload
 * @param fileType - Either 'image' or 'video'
 * @returns Cloudinary upload result
 */
async function uploadToCloudinary(file: File, fileType: 'image' | 'video') {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64}`;

        const options = {
            folder: 'Er-Blogs',
            resource_type: fileType as 'image' | 'video', // Type assertion
            transformation: fileType === 'image'
                ? [{ quality: 'auto:good', fetch_format: 'auto' }]
                : [{ quality: 'auto:good' }]
        };

        return await cloudinary.uploader.upload(dataURI, options);
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        throw new Error(`Cloudinary upload failed: ${errorMessage}`);
    }
}