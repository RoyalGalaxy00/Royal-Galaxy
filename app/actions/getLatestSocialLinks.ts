"use server";

import { connectDB } from "@/lib/RGconn";

export async function getLatestSocialLinks() {
    try {
        const db = await connectDB();
        if (!db) return null;

        const latestLinks = await db
            .collection("Links")
            .find({})
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray();

        if (latestLinks.length === 0) return null;

        const links = latestLinks[0];
        return {
            facebook: links.facebook || null,
            instagram: links.instagram || null,
            tiktok: links.tiktok || null,
        };
    } catch (error) {
        console.error("Error fetching social links:", error);
        return null;
    }
}