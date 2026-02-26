'use server'

import { connectDB } from '@/lib/RGconn';
import { ObjectId } from 'mongodb';

// ── Types ─────────────────────────────────────────────────────────────────
export interface FeedbackEntry {
    _id: string;
    // From Clerk
    userId: string;
    Sender_name: string;
    Sender_email: string;
    Sender_avatar?: string;
    // Stay details
    roomStayed: string;
    checkInMonth: string;
    travelType: string;
    // Ratings (1–5)
    ratingOverall: number;
    ratingCleanliness: number;
    ratingService: number;
    ratingFood: number;
    ratingValue: number;
    ratingLocation: number;
    // Written feedback
    title: string;
    body: string;
    wouldRecommend: boolean;
    // Meta
    created_at: string;
}

// ── Fetch all feedbacks ───────────────────────────────────────────────────
export async function getFeedbacks(): Promise<{
    success: boolean;
    data?: FeedbackEntry[];
    error?: string;
}> {
    try {
        const db = await connectDB();
        if (!db) return { success: false, error: 'Database connection failed' };

        const docs = await db
            .collection('feedbacks')
            .find({})
            .sort({ created_at: -1 })
            .toArray();

        const data = docs.map((doc) => ({
            ...doc,
            _id: doc._id.toString(),
        })) as FeedbackEntry[];

        return { success: true, data };
    } catch (error) {
        console.error('[getFeedbacks]', error);
        return { success: false, error: 'Failed to fetch feedbacks' };
    }
}

// ── Post new feedback ────────────────────────────────────────────────────
export async function postFeedback(data: Omit<FeedbackEntry, '_id'>): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        const {
            userId, Sender_name, Sender_email,
            roomStayed, checkInMonth, travelType,
            ratingOverall, ratingCleanliness, ratingService,
            ratingFood, ratingValue, ratingLocation,
            title, body, wouldRecommend,
        } = data;

        if (
            !userId || !Sender_name || !Sender_email ||
            !roomStayed || !checkInMonth || !travelType ||
            !ratingOverall || !title || !body
        ) {
            return { success: false, error: 'Please fill in all required fields' };
        }

        const db = await connectDB();
        if (!db) return { success: false, error: 'Database connection failed' };

        await db.collection('feedbacks').insertOne({
            ...data,
            created_at: new Date().toISOString(),
        });

        return { success: true };
    } catch (error) {
        console.error('[postFeedback]', error);
        return { success: false, error: 'Failed to submit feedback' };
    }
}

// ── Delete feedback ───────────────────────────────────────────────────────
export async function deleteFeedback(id: string): Promise<{
    success: boolean;
    error?: string;
}> {
    try {
        if (!id || !ObjectId.isValid(id)) {
            return { success: false, error: 'Invalid ID' };
        }

        const db = await connectDB();
        if (!db) return { success: false, error: 'Database connection failed' };

        const result = await db
            .collection('feedbacks')
            .deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return { success: false, error: 'Feedback not found' };
        }

        return { success: true };
    } catch (error) {
        console.error('[deleteFeedback]', error);
        return { success: false, error: 'Failed to delete feedback' };
    }
}