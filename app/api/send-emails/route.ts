import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { NextRequest, NextResponse } from 'next/server';

// Initialize MailerSend
const apiKey = process.env.MAILERSEND_API_KEY;
const fromEmail = process.env.MAILERSEND_FROM_EMAIL;
const fromName = process.env.MAILERSEND_FROM_NAME || 'Royal Galaxy Hotel';

if (!apiKey) {
    throw new Error('Missing environment variable: MAILERSEND_API_KEY');
}

if (!fromEmail) {
    throw new Error('Missing environment variable: MAILERSEND_FROM_EMAIL');
}

const mailerSend = new MailerSend({ apiKey });

export async function GET(request: NextRequest) {
    return await sendReplyEmail(request);
}

export async function POST(request: NextRequest) {
    return await sendReplyEmail(request);
}

async function sendReplyEmail(request: NextRequest) {
    try {
        console.log("📧 Starting email send process...");

        const { searchParams } = new URL(request.url);
        const toEmail = searchParams.get("user_email") as string;
        const content = searchParams.get("content") as string;
        const subject = searchParams.get("subject") as string;
        const toName = searchParams.get("to_name") || 'Guest' as string;

        console.log("📨 Email Parameters:", {
            toEmail,
            subject: subject?.substring(0, 50),
            contentLength: content?.length,
        });

        // Validate required fields
        if (!toEmail) {
            return NextResponse.json(
                { success: false, error: 'Recipient email is required' },
                { status: 400 }
            );
        }

        if (!content) {
            return NextResponse.json(
                { success: false, error: 'Message content is required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(toEmail)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Create sender - using environment variables
        const sentFrom = new Sender(
            fromEmail!, // Your verified MailerSend domain
            fromName
        );

        // Create recipient
        const recipients = [
            new Recipient(toEmail.trim(), toName)
        ];

        console.log("📤 Sending to:", recipients[0].email);

        // Create email parameters with reply-to
        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setReplyTo(sentFrom) // Add reply-to
            .setSubject(subject || "Reply from Royal Galaxy Hotel")
            .setHtml(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: 'Exo 2', Arial, sans-serif;
                            line-height: 1.6;
                            color: #1a2e2e;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #0e1a2e 0%, #162440 100%);
                            padding: 32px 20px;
                            text-align: center;
                            border-radius: 12px 12px 0 0;
                            color: #ffffff;
                            border-bottom: 1px solid rgba(255,255,255,0.1);
                        }
                        .header h1 {
                            color: #d4a853;
                            margin: 0;
                            font-weight: 300;
                            letter-spacing: 0.04em;
                        }
                        .content {
                            background: #faf7f2;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                            border: 1px solid #ddd5c4;
                        }
                        .message-box {
                            background: white;
                            padding: 25px;
                            border-radius: 8px;
                            border-left: 3px solid #b8943f;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                        }
                        .footer {
                            margin-top: 20px;
                            padding-top: 20px;
                            border-top: 1px solid #ddd5c4;
                            text-align: center;
                            color: #8a7f6e;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 style="margin: 0; font-size: 24px;">Royal Galaxy Hotel & Lodge</h1>
                    </div>
                    <div class="content">
                        <div class="message-box">
                            ${content.replace(/\n/g, '<br>')}
                        </div>
                        <div class="footer">
                            <p>This is a response from Royal Galaxy Hotel & Lodge.</p>
                            <p>For any further questions, please contact us directly.</p>
                        </div>
                    </div>
                </body>
                </html>
            `)
            .setText(content);

        // Send email
        const response = await mailerSend.email.send(emailParams);
        if (response) {
            return NextResponse.json({
                success: true,
                message: `Email sent successfully to ${toEmail}`,
            });

        }
        return NextResponse.json({
            success: false,
            message: `Failed to send reply to ${toEmail}`,
        });

    } catch (error: any) {
        console.error('❌ Error sending email:');
        console.error('Error message:', error.message);
        console.error('Error details:', error.response?.data || {});

        // Check for specific MailerSend errors
        let errorMessage = error.message || 'Failed to send email';
        let statusCode = 500;

        if (errorMessage.includes('sender')) {
            errorMessage = 'Invalid sender email. Please use a verified domain from MailerSend.';
            statusCode = 400;
        } else if (errorMessage.includes('rate limit')) {
            errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
            statusCode = 429;
        } else if (errorMessage.includes('recipient')) {
            errorMessage = 'Invalid recipient email address.';
            statusCode = 400;
        }

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                details: error.response?.data || {}
            },
            { status: statusCode }
        );
    }
}