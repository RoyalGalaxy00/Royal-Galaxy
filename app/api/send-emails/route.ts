import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { NextRequest, NextResponse } from 'next/server';

// Initialize MailerSend
const apiKey = process.env.MAILERSEND_API_KEY;
if (!apiKey) {
    throw new Error('Missing environment variable: MAILERSEND_API_KEY');
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
        const toEmail = searchParams.get("user_email");
        const content = searchParams.get("content");
        const subject = searchParams.get("subject");

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

        // Create sender - MUST use your verified MailerSend domain
        const sentFrom = new Sender(
            'noreply@test-zxk54v8qmqzljy6v.mlsender.net', // ✅ Use your MailerSend domain
            'iLearning'
        );

        // Create recipient
        const recipients = [
            new Recipient(toEmail.trim(), 'User')
        ];

        console.log("📤 Sending to:", recipients[0].email);

        // Create email parameters
        const emailParams = new EmailParams()
            .setFrom(sentFrom)
            .setTo(recipients)
            .setSubject(subject || "Reply from iLearning")
            .setHtml(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                       .header {
    background: linear-gradient(135deg, 
        #0f172a 0%,    /* slate-900 */
        #1e293b 25%,   /* slate-800 */
        #334155 50%,   /* slate-700 */
        #475569 75%,   /* slate-600 */
        #64748b 100%   /* slate-500 */
    );
    padding: 32px 20px;
    text-align: center;
    border-radius: 12px 12px 0 0;
    color: white;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
                        .content {
                            background: #f9f9f9;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                            border: 1px solid #e5e5e5;
                        }
                        .message-box {
                            background: white;
                            padding: 25px;
                            border-radius: 8px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                        .footer {
                            margin-top: 20px;
                            padding-top: 20px;
                            border-top: 1px solid #e5e5e5;
                            text-align: center;
                            color: #666;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1 style="margin: 0; font-size: 24px;">iLearning Support</h1>
                    </div>
                    <div class="content">
                        <div class="message-box">
                            ${content.replace(/\n/g, '<br>')}
                        </div>
                        <div class="footer">
                            <p>This is an automated response from iLearning Support Team.</p>
                            <p>Please do not reply directly to this email.</p>
                        </div>
                    </div>
                </body>
                </html>
            `)
            .setText(content);

        // Send email
        const response = await mailerSend.email.send(emailParams);

        return NextResponse.json({
            success: true,
            message: `Email sent successfully `,

        });

    } catch (error: any) {
        console.error('❌ Error sending email:');
        console.error('Error message:', error.message);
        console.error('Error details:', error.response?.data || {});

        // Check for specific MailerSend errors
        let errorMessage = error.message || 'Failed to send email';

        if (errorMessage.includes('sender')) {
            errorMessage = 'Invalid sender email. Please use a verified domain from MailerSend.';
        }
        if (errorMessage.includes('rate limit')) {
            errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
        }

        return NextResponse.json(
            {
                success: false,
                error: errorMessage,
                details: error.response?.data || {}
            },
            { status: 500 }
        );
    }
}