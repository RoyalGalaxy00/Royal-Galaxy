// app/api/deleteBlog/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/RGconn';
import { cloudinary } from '@/lib/RGcloud';
import { ObjectId } from 'mongodb';
import { auth, clerkClient } from '@clerk/nextjs/server';

const ALLOWED_ROLES = ['admin', 'moderator'];

export async function DELETE(req: NextRequest) {
    try {
        // ── 1. Auth check ────────────────────────────────────────────────────
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized. Please sign in.' },
                { status: 401 }
            );
        }

        // ── 2. Role check ────────────────────────────────────────────────────
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const role = user.publicMetadata?.role as string | undefined;

        if (!role || !ALLOWED_ROLES.includes(role)) {
            return NextResponse.json(
                { success: false, message: 'Forbidden. Admins and moderators only.' },
                { status: 403 }
            );
        }

        // ── 3. Validate body ─────────────────────────────────────────────────
        const body = await req.json();
        const { id, collection = 'Er-Blogs' } = body as {
            id: string;
            collection?: string;
        };

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid or missing post ID.' },
                { status: 400 }
            );
        }

        // ── 4. Fetch post to get Cloudinary public_ids ────────────────────────
        const db = await connectDB();
        if (!db) {
            return NextResponse.json(
                { success: false, message: 'Database connection failed.' },
                { status: 500 }
            );
        }

        const post = await db
            .collection(collection)
            .findOne({ _id: new ObjectId(id) });

        if (!post) {
            return NextResponse.json(
                { success: false, message: 'Post not found.' },
                { status: 404 }
            );
        }

        // ── 5. Delete media from Cloudinary ───────────────────────────────────
        if (Array.isArray(post.media) && post.media.length > 0) {
            await Promise.allSettled(
                post.media.map((m: { public_id: string; type: string }) =>
                    cloudinary.uploader.destroy(m.public_id, {
                        resource_type: m.type === 'video' ? 'video' : 'image',
                    })
                )
            );
        }

        // ── 6. Delete post from DB ────────────────────────────────────────────
        await db.collection(collection).deleteOne({ _id: new ObjectId(id) });

        // ── 7. Also delete associated comments ───────────────────────────────
        await db.collection('comments').deleteMany({ blog_id: id });

        return NextResponse.json({
            success: true,
            message: 'Post and its media deleted successfully.',
        });
    } catch (error) {
        console.error('deleteBlog error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete post.' },
            { status: 500 }
        );
    }
}