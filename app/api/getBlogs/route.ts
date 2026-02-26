import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/RGconn';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const collection = await searchParams.get("collection");
        const db = await connectDB();
        if (!db) {
            return NextResponse.json({ success: false, message: "Error in database connection." });
        }
        if (!collection) {
            return NextResponse.json({ success: false, message: "Collection name required" });

        }
        const data = await db.collection(collection).find({}).sort({ _id: -1 }).toArray();
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching notices:");
        return NextResponse.json({ error: "Failed to fetch notices." }, { status: 500 });
    }
}