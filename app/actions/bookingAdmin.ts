'use server'

import { connectDB } from '@/lib/RGconn';
import { ObjectId } from 'mongodb';
import nodemailer from "nodemailer";

import { NextResponse } from "next/server";

// ── Types ─────────────────────────────────────────────────────────────────
export interface BookingInfo {
    _id: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
    checkInDate: string;
    checkInTime: string;
    checkOutDate: string;
    checkOutTime: string;
    numberOfGuests: string;
    room: string;
    collection: string;
    userId: string;
    Sender_email: string;
    Sender_name: string;
    Sender_avatar?: string;
    created_at?: string;
    replied?: boolean;
    replied_at?: string;
}

// ── Fetch all bookings ────────────────────────────────────────────────────
export async function getBookings(): Promise<{
    success: boolean;
    data?: BookingInfo[];
    error?: string;
}> {
    try {
        const db = await connectDB();
        if (!db) return { success: false, error: 'Database connection failed' };

        const docs = await db
            .collection('Bookings')
            .find({})
            .sort({ created_at: -1 })
            .toArray();

        const data = docs.map((doc) => ({
            ...doc,
            _id: doc._id.toString(),
        })) as BookingInfo[];

        return { success: true, data };
    } catch (error) {
        console.error('[getBookings]', error);
        return { success: false, error: 'Failed to fetch bookings' };
    }
}



export async function sendBookingReply({
    to, toName, subject, body, bookingId
}: {
    to: string;
    toName: string;
    subject: string;
    body: string;
    bookingId: string;
}): Promise<{ success: boolean; error?: string }> {
    try {


        const transporter = nodemailer.createTransport({

            host: "smtp-relay.brevo.com",

            port: 587,

            secure: false,

            requireTLS: true,

            auth: {
                user: "ab21ac001@smtp-brevo.com",
                pass: "xsmtpsib-2a75827b094bc41596a384885744d815a4241c3b465074bf0f2753436d55f472-gbHhMBZ28oDAx5Uw",
            },
        });

        // TEST SMTP CONNECTION
        await transporter.verify();

        console.log("SMTP Connected Successfully");

        // SEND TEST EMAIL
        const info = await transporter.sendMail({

            from: `"Royal Galaxy Hotel" <luxuryhotel0000@gmail.com>`,

            to: to,

            subject: "Booking Reply: " + subject,

            text: "Dear " + toName + ",\n\n" + body + "\n\nBest regards,\nRoyal Galaxy Hotel",

            html: body.replace(/\n/g, "<br>"),
        });

        console.log(info);

        return {
            success: true,
        };

    } catch (error) {

        console.error(error, "failed to send email");

        return {
            success: false,
        };
    }
}
// ── Delete a booking ──────────────────────────────────────────────────────
export async function deleteBooking(
    id: string
): Promise<{ success: boolean; error?: string }> {
    try {
        if (!id || !ObjectId.isValid(id)) {
            return { success: false, error: 'Invalid ID' };
        }

        const db = await connectDB();
        if (!db) return { success: false, error: 'Database connection failed' };

        const result = await db
            .collection('Bookings')
            .deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return { success: false, error: 'Booking not found' };
        }

        return { success: true };
    } catch (error) {
        console.error('[deleteBooking]', error);
        return { success: false, error: 'Failed to delete booking' };
    }
}

// ── Post a new booking (called from the public booking page) ──────────────
export async function postBookings(BookerData: any) {
    try {
        const {
            firstName, lastName, address, city, state, zipCode,
            phone, email,
            checkInDate, checkInTime, checkOutDate, checkOutTime,
            numberOfGuests, room, collection, userId,
            Sender_email, Sender_name, Sender_avatar
        } = BookerData;

        if (!firstName || !lastName || !address || !city || !state || !zipCode ||
            !phone || !email || !checkInDate || !checkInTime ||
            !checkOutDate || !checkOutTime || !numberOfGuests || !room ||
            !collection || !userId || !Sender_email || !Sender_name) {
            return { success: false, error: 'All fields are required' };
        }

        const db = await connectDB();
        if (!db) return { success: false, error: 'Database connection failed' };

        const BookingInfo = await db.collection(collection).insertOne({
            ...BookerData,
            created_at: new Date().toISOString(),
            replied: false,
        });

        if (!BookingInfo) return { success: false, error: 'Failed to book a room' };

        return { success: true };
    } catch (error) {
        console.error('Error in postBookings:', error);
        return { success: false, error: 'Failed to book a room' };
    }
}