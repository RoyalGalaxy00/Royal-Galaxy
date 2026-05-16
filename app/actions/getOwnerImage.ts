"use server";

import { connectDB } from "@/lib/RGconn";

export async function getLatestOwnerImage(): Promise<string | null> {
    try {
        const db = await connectDB();
        if (!db) return null;

        const latestProfile = await db
            .collection("OwnerProfile")
            .find({})
            .sort({ uploadedAt: -1 })
            .limit(1)
            .toArray();

        if (latestProfile.length > 0 && latestProfile[0].imageUrl) {
            return latestProfile[0].imageUrl;
        }
        return null;
    } catch (error) {
        console.error("Error fetching owner image:", error);
        return null;
    }
}