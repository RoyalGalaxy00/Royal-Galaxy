// app/api/getRequestById/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/RGconn';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const collection = searchParams.get('collection');
        const id = searchParams.get('_id');

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, message: 'Invalid or missing ID.' },
                { status: 400 }
            );
        }
        if (!collection) {
            return NextResponse.json(
                { success: false, message: 'collection param is required.' },
                { status: 400 }
            );
        }

        const db = await connectDB();
        if (!db) {
            return NextResponse.json(
                { success: false, message: 'Database connection failed.' },
                { status: 500 }
            );
        }

        const data = await db
            .collection(collection)
            .findOne({ _id: new ObjectId(id) });

        if (!data) {
            return NextResponse.json(
                { success: false, message: 'Document not found.' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { ...data, _id: data._id.toString() },
        });
    } catch (error) {
        console.error('getRequestById error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch document.' },
            { status: 500 }
        );
    }
}