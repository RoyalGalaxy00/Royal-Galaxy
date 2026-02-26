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
        const title = formData.get('title');
        const excerpt = formData.get('excerpt');
        const content = formData.get('content');
        const uploader = formData.get('uploader');
        const uploader_email = formData.get('uploader_email');
        const uploader_avatar = formData.get('uploader_avatar');
        const user_id = formData.get('user_id');
        const tags = JSON.parse(formData.get('tags') || '[]');

        // Validate required fields
        if (!title || !excerpt || !content) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get media files information
        const mediaFilesCount = parseInt(formData.get('mediaFilesCount') || '0');
        const mediaTypes = JSON.parse(formData.get('mediaTypes') || '[]');

        // Array to store Cloudinary upload results
        const mediaFiles = [];

        // Upload each media file to Cloudinary
        for (let i = 0; i < mediaFilesCount; i++) {
            const file = formData.get(`mediaFile_${i}`);
            if (!file) continue;

            const fileType = mediaTypes[i] || (file.type.startsWith('video/') ? 'video' : 'image');
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
        return NextResponse.json(
            { error: "Failed to create blog post: " + error.message },
            { status: 500 }
        );
    }
}

/**
 * Uploads a file to Cloudinary
 * @param {File} file - The file to upload
 * @param {string} fileType - Either 'image' or 'video'
 * @returns {Promise<Object>} Cloudinary upload result
 */
async function uploadToCloudinary(file, fileType) {
    try {
        // Convert file to buffer and then to base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64}`;

        // Set upload options
        const options = {
            folder: 'Er-Blogs',
            resource_type: fileType === 'video' ? 'video' : 'image',
            // Add additional options as needed
            transformation: fileType === 'image' ? [
                { quality: 'auto:good', fetch_format: 'auto' }
            ] : [
                { quality: 'auto:good' }
            ]
        };

        // Upload to Cloudinary
        return await cloudinary.uploader.upload(dataURI, options);
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
}