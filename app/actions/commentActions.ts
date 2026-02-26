'use server'

import { connectDB } from '@/lib/RGconn';

interface ContactData {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    message: string;
    collection: string;
    userId: string;
    Sender_email: string;
    Sender_name: string;
    Sender_avatar?: string;
}

export async function postInfo(contactData: ContactData) {
    try {
        const {
            firstName, lastName, phone, email,
            message, collection, userId, Sender_email, Sender_name,
        } = contactData;

        // Validate required fields
        if (!firstName || !lastName || !phone || !email || !message || !collection || !userId || !Sender_email || !Sender_name) {
            return { success: false, error: 'All fields are required' };
        }

        const db = await connectDB();
        if (!db) {
            return { success: false, error: 'Database connection failed' };
        }

        const result = await db.collection(collection).insertOne(contactData);

        // ✅ correct check — insertedId is null/undefined on failure
        if (!result.insertedId) {
            return { success: false, error: 'Failed to save contact info' };
        }

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to send message' };
    }
}

export async function postBookings(BookerData: any) {
    try {
        // Destructure all fields that the client actually sends
        const {
            firstName, lastName, address, city, state, zipCode,
            phone, email,
            checkInDate, checkInTime, checkOutDate, checkOutTime,
            numberOfGuests, room, collection, userId,
            Sender_email, Sender_name, Sender_avatar
        } = BookerData;

        // Validate required fields (Sender_avatar is optional, but if sent it's fine)
        if (!firstName || !lastName || !address || !city || !state || !zipCode ||
            !phone || !email || !checkInDate || !checkInTime ||
            !checkOutDate || !checkOutTime || !numberOfGuests || !room ||
            !collection || !userId || !Sender_email || !Sender_name) {
            return { success: false, error: 'All fields are required' };
        }

        const db = await connectDB();
        if (!db) {
            return { success: false, error: 'Database connection failed' };
        }

        const BookingInfo = await db.collection(collection).insertOne(BookerData);
        if (!BookingInfo) {
            return { success: false, error: 'Failed to book a room' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error in postBookings:', error);
        return { success: false, error: 'Failed to book a room' };
    }
}