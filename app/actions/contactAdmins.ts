'use server'

import { connectDB } from '@/lib/RGconn';
import { ObjectId } from 'mongodb';
import nodemailer from "nodemailer";

import { NextResponse } from "next/server";
// ── Types ─────────────────────────────────────────────────────────────────
export interface ContactInfo {
    _id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;          // ← the email the visitor typed in the form
    message: string;
    collection: string;
    userId: string;
    Sender_email: string;   // ← the Clerk account email of whoever submitted
    Sender_name: string;
    Sender_avatar?: string;
    created_at?: string;
    replied?: boolean;
    replied_at?: string;
}

// ── Fetch all contact messages ────────────────────────────────────────────
export async function getContactMessages(): Promise<{
    success: boolean;
    data?: ContactInfo[];
    error?: string;
}> {
    try {
        const db = await connectDB();
        if (!db) return { success: false, error: 'Database connection failed' };

        const docs = await db
            .collection('ContactInfo')
            .find({})
            .sort({ created_at: -1 })
            .toArray();

        const data = docs.map((doc) => ({
            ...doc,
            _id: doc._id.toString(),
        })) as ContactInfo[];

        return { success: true, data };
    } catch (error) {
        console.error('[getContactMessages]', error);
        return { success: false, error: 'Failed to fetch messages' };
    }
}

// ── Send reply to the email the visitor typed in the form ─────────────────
export async function sendReply({
    to,           // msg.email — the form email, e.g. visitor@gmail.com
    toName,       // visitor's full name
    subject,
    body,
    messageId,
}: {
    to: string;
    toName: string;
    subject: string;
    body: string;
    messageId: string;
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

// ── Delete a contact message ──────────────────────────────────────────────
export async function deleteContactMessage(
    id: string
): Promise<{ success: boolean; error?: string }> {
    try {
        if (!id || !ObjectId.isValid(id)) {
            return { success: false, error: 'Invalid ID' };
        }

        const db = await connectDB();
        if (!db) return { success: false, error: 'Database connection failed' };

        const result = await db
            .collection('ContactInfo')
            .deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return { success: false, error: 'Message not found' };
        }

        return { success: true };
    } catch (error) {
        console.error('[deleteContactMessage]', error);
        return { success: false, error: 'Failed to delete message' };
    }
}