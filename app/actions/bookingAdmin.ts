'use server'

import { connectDB } from '@/lib/RGconn';
import { ObjectId } from 'mongodb';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';

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

// ── Send reply to the guest's email ──────────────────────────────────────
export async function sendBookingReply({
    to,
    toName,
    subject,
    body,
    bookingId,
}: {
    to: string;
    toName: string;
    subject: string;
    body: string;
    bookingId: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        if (!to || !subject || !body) {
            return { success: false, error: 'All fields are required' };
        }

        const mailerSend = new MailerSend({
            apiKey: process.env.MAINERSEND_BOOKING_KEY!,
        });

        const sentFrom = new Sender(
            process.env.MAILERSEND_FROM_EMAIL!,
            process.env.MAILERSEND_FROM_NAME ?? 'Royal Galaxy Hotel & Lodge'
        );

        const recipients = [new Recipient(to, toName)];

        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setSubject(subject)
            .setHtml(`
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
        <body style="margin:0;padding:0;background:#f0ebe0;font-family:'Segoe UI',Arial,sans-serif">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
            <tr>
              <td align="center">
                <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">

                  <!-- Header -->
                  <tr>
                    <td style="background:#0e1a2e;padding:28px 36px;text-align:center">
                      <p style="margin:0 0 6px;color:#b8943f;letter-spacing:0.3em;font-size:10px;text-transform:uppercase">
                        Royal Galaxy Hotel &amp; Lodge
                      </p>
                      <h1 style="margin:0;color:#ffffff;font-weight:300;font-size:22px;line-height:1.3">
                        ${subject}
                      </h1>
                    </td>
                  </tr>

                  <!-- Gold line -->
                  <tr>
                    <td style="background:linear-gradient(90deg,#b8943f,#d4a853,#b8943f);height:3px;font-size:0;line-height:0">&nbsp;</td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="background:#faf7f2;padding:36px;border:1px solid #ddd5c4;border-top:none">
                      <div style="font-size:15px;line-height:1.8;color:#162440;white-space:pre-wrap">${body}</div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f0ebe0;padding:18px 36px;border:1px solid #ddd5c4;border-top:none;text-align:center">
                      <p style="margin:0 0 4px;font-size:11px;color:#8a7f6e;letter-spacing:0.12em;text-transform:uppercase">
                        Royal Galaxy Hotel &amp; Lodge
                      </p>
                      <p style="margin:0;font-size:11px;color:#8a7f6e">
                        Sauraha, Chitwan, Nepal
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `)
            .setText(
                `Dear ${toName},\n\n${body}\n\n---\nRoyal Galaxy Hotel & Lodge\nSauraha, Chitwan, Nepal`
            );

        await mailerSend.email.send(emailParams);

        // Mark the booking as replied in MongoDB
        const db = await connectDB();
        if (db) {
            await db.collection('Bookings').updateOne(
                { _id: new ObjectId(bookingId) },
                { $set: { replied: true, replied_at: new Date().toISOString() } }
            );
        }

        return { success: true };
    } catch (error) {
        console.error('[sendBookingReply]', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send reply',
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