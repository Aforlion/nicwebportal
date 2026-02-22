'use server'

/**
 * Generic email utility for NIC Web Portal.
 * 
 * TO ENABLE LIVE EMAILS:
 * 1. Install 'resend' or 'nodemailer'
 * 2. Add API keys to .env.local
 * 3. Update the implementation below.
 */

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        console.warn(`[sendEmail] No API key found. Mocking email to ${to}`);
        console.log(`[Mock Email]
To: ${to}
Subject: ${subject}
Content: ${html.substring(0, 100)}... (truncated)`);
        return { success: true, mocked: true };
    }

    try {
        const { Resend } = await import('resend');
        const resend = new Resend(apiKey);

        const { data, error } = await resend.emails.send({
            from: 'NIC <notifications@nicnigeria.org>',
            to,
            subject,
            html
        });

        if (error) {
            console.error("[sendEmail] Resend Error:", error);
            return { success: false, error };
        }

        console.log(`[sendEmail] Email sent to ${to}`, data);
        return { success: true, data };
    } catch (error) {
        console.error("[sendEmail] Unexpected Error:", error);
        return { success: false, error };
    }
}

export async function sendRegistrationEmail(email: string, fullName: string) {
    const subject = "Registration Successful - National Institute of Caregivers";
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #0d3b66;">NIC Registration Successful!</h1>
            </div>
            <p>Dear ${fullName},</p>
            <p>Thank you for joining the <strong>National Institute of Caregivers (NIC)</strong>. Your application has been received and your payment has been verified.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #0d3b66;">Next Steps:</h3>
                <ul style="padding-left: 20px;">
                    <li><strong>Verification:</strong> Our registry team will review your uploaded documents within 3-5 business days.</li>
                    <li><strong>NIC-ID:</strong> Once verified, you will receive your official NIC-ID and digital membership card.</li>
                    <li><strong>LMS Access:</strong> You can now log into the student portal to start your training programs.</li>
                </ul>
            </div>
            <p>If you have any questions, please contact our support team at <a href="mailto:support@nicnigeria.org">support@nicnigeria.org</a>.</p>
            <p>Best Regards,<br><strong>NIC Registry Team</strong></p>
        </div>
    `;

    return sendEmail({ to: email, subject, html });
}
