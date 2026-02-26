// app/api/incrementView/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/RGconn';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
    try {
        const { id, collection = 'Er-Blogs' } = await req.json();

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ success: false });
        }

        const db = await connectDB();
        if (!db) return NextResponse.json({ success: false });

        await db
            .collection(collection)
            .updateOne({ _id: new ObjectId(id) }, { $inc: { viewCount: 1 } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('incrementView error:', error);
        return NextResponse.json({ success: false });
    }
}