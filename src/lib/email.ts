'use server'

import { headers } from 'next/headers'
import { checkRateLimit } from '@/lib/rate-limit'
import { sanitize } from '@/lib/utils'
import { render } from '@react-email/render'
import { NICWelcomeEmail } from '../emails/NIC_Welcome'
import { NICEnrollmentEmail } from '../emails/NIC_EnrollmentConfirmation'
import { NICCertificateReadyEmail } from '../emails/NIC_CertificateReady'
import { NICAssessmentReceiptEmail } from '../emails/NIC_AssessmentReceipt'
import { NICPasswordResetEmail } from '../emails/NIC_PasswordReset'
import { NICFacilityWelcomeEmail } from '../emails/NIC_FacilityWelcome'
import { NICRegistrationStatusEmail } from '../emails/NIC_RegistrationStatus'
import { NICFacilityStatusEmail } from '../emails/NIC_FacilityStatus'
import { NICFoundingInvitationEmail } from '../emails/NIC_FoundingInvitation'
import { NICFoundingWelcomeEmail } from '../emails/NIC_FoundingWelcome'
import { NICInspectionScheduledEmail } from '../emails/NIC_InspectionScheduled'
import { NICFoundingPaymentReceiptEmail } from '../emails/NIC_FoundingPaymentReceipt'
import * as React from 'react'
import { env } from '@/env'
import logger from '@/lib/logger'

interface SendEmailParams {
    to: string;
    subject: string;
    html?: string;
    template?: React.ReactElement;
}

/**
 * Generic email utility for NIC Web Portal.
 * Production-hardened with rate limiting, sanitization, and restricted logging.
 */
export async function sendEmail({ to, subject, html, template }: SendEmailParams) {
    const apiKey = env.RESEND_API_KEY;

    // 1. Rate Limiting (Production Only/Upstash Enabled)
    const headerList = await headers()
    const ip = headerList.get('x-forwarded-for') ?? 'unknown'
    const isAllowed = await checkRateLimit('email', `email-send:${ip}`)

    if (!isAllowed) {
        console.warn(`[sendEmail] Rate limit exceeded for IP: ${ip}`);
        return { success: false, error: 'Rate limit exceeded. Please try again later.' };
    }

    // 2. Render Template if provided
    let finalHtml = html;
    if (template) {
        try {
            finalHtml = await render(template);
        } catch (renderError) {
            console.error("[sendEmail] Render Error:", renderError);
            return { success: false, error: "Failed to render email template" };
        }
    }

    if (!finalHtml) {
        return { success: false, error: "No email content provided" };
    }

    if (!apiKey) {
        console.warn(`[sendEmail] No API key found. Mocking email to ${to}`);
        console.log(`[Mock Email] To: ${to} | Subject: ${subject} | (Body truncated for security)`);
        return { success: true, mocked: true };
    }

    try {
        const { Resend } = await import('resend');
        const resend = new Resend(apiKey);

        const { data, error } = await resend.emails.send({
            from: 'NIC <notifications@nicnigeria.org>',
            to,
            subject,
            html: finalHtml
        });

        if (error) {
            console.error("[sendEmail] Resend Error:", error);
            return { success: false, error };
        }

        // Never log the full body in production
        console.log(`[sendEmail] Email successfully sent to recipient.`);
        return { success: true, data };
    } catch (error) {
        console.error("[sendEmail] Unexpected Error:", error);
        return { success: false, error };
    }
}


export async function sendRegistrationEmail(email: string, fullName: string, temporaryPassword?: string, loginUrl?: string) {
    const safeName = sanitize(fullName);
    const subject = "Welcome to the National Institute of Caregivers!";
    const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';
    const finalLoginUrl = loginUrl || `${baseUrl}/login`;

    return sendEmail({
        to: email,
        subject,
        template: React.createElement(NICWelcomeEmail, {
            fullName: safeName,
            temporaryPassword,
            loginUrl: finalLoginUrl
        })
    });
}
export async function sendEnrollmentEmail(email: string, fullName: string, courseTitle: string, courseId: string) {
    const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';
    const courseUrl = `${baseUrl}/portal/student/courses/${courseId}`;
    const subject = `Enrollment Confirmed: ${courseTitle}`;

    return sendEmail({
        to: email,
        subject,
        template: React.createElement(NICEnrollmentEmail, {
            fullName,
            courseTitle,
            courseUrl
        })
    });
}

export async function sendCertificateEmail(email: string, fullName: string, courseTitle: string, certificateCode: string) {
    const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org';
    const certificateUrl = `${baseUrl}/certificates/${certificateCode}`;
    const subject = `Congratulations! Your certificate for ${courseTitle} is ready`;

    return sendEmail({
        to: email,
        subject,
        template: React.createElement(NICCertificateReadyEmail, {
            fullName,
            courseTitle,
            certificateCode,
            certificateUrl
        })
    });
}

export async function sendAssessmentReceiptEmail(email: string, fullName: string, courseTitle: string, assessmentName: string) {
    const subject = `Assessment Received: ${assessmentName}`;

    return sendEmail({
        to: email,
        subject,
        template: React.createElement(NICAssessmentReceiptEmail, {
            fullName,
            courseTitle,
            assessmentName
        })
    });
}

export async function sendPasswordResetEmail(email: string, fullName: string, resetUrl: string) {
    const subject = "Reset your NIC Password";

    return sendEmail({
        to: email,
        subject,
        template: React.createElement(NICPasswordResetEmail, {
            fullName,
            resetUrl
        })
    });
}

export async function sendVerificationReminderEmail(email: string, fullName: string) {
    // Reusing Welcome template for verification encouragement
    const subject = "Complete your NIC Registration - Verification Reminder";

    return sendEmail({
        to: email,
        subject,
        template: React.createElement(NICWelcomeEmail, {
            fullName
        })
    });
}
export async function sendFacilityRegistrationEmail(email: string, ownerName: string, facilityName: string) {
    const subject = "Institutional Registration Received - NIC Care Partner Registry";

    return sendEmail({
        to: email,
        subject,
        template: React.createElement(NICFacilityWelcomeEmail, {
            facilityName,
            ownerName
        })
    });
}

export async function sendRegistrationStatusEmail(
    email: string,
    fullName: string,
    status: 'approved' | 'denied' | 'action_required',
    reason?: string,
    nicId?: string
) {
    const subjects = {
        approved: "Registration Approved - Welcome to NIC",
        denied: "Update regarding your NIC registration",
        action_required: "Action Required: NIC Registration Update"
    };

    return sendEmail({
        to: email,
        subject: subjects[status],
        template: React.createElement(NICRegistrationStatusEmail, {
            fullName,
            status,
            reason,
            nicId
        })
    });
}

export async function sendFacilityStatusEmail(
    email: string,
    facilityName: string,
    ownerName: string,
    status: 'approved' | 'denied' | 'action_required',
    reason?: string,
    regNumber?: string
) {
    const subjects = {
        approved: "Institutional Approval Confirmed - NIC Partner",
        denied: "Institutional Registration Update",
        action_required: "Institutional Review: Action Required"
    };

    return sendEmail({
        to: email,
        subject: subjects[status],
        template: React.createElement(NICFacilityStatusEmail, {
            facilityName,
            ownerName,
            status,
            reason,
            regNumber
        })
    });
}

export async function sendFoundingInvitationEmail(email: string, fullName: string, onboardingUrl: string) {
    const subject = "Official Invitation: NIC Founding Membership";

    return sendEmail({
        to: email,
        subject,
        template: React.createElement(NICFoundingInvitationEmail, {
            fullName,
            onboardingUrl
        })
    });
}

export async function sendFoundingWelcomeEmail(email: string, fullName: string) {
    const subject = "Welcome Pillar of the Institute: Your NIC Founding Membership";
    const portalUrl = (env.NEXT_PUBLIC_APP_URL || 'https://nicnigeria.org') + '/login';

    return sendEmail({
        to: email,
        subject,
        template: React.createElement(NICFoundingWelcomeEmail, {
            fullName,
            portalUrl
        })
    });
}

export async function sendInspectionScheduledEmail(
    email: string,
    facilityName: string,
    ownerName: string,
    scheduledDate: string,
    scheduledTime: string,
    inspectorName?: string
) {
    const subject = "Compliance Inspection Scheduled - NIC Registry";

    return sendEmail({
        to: email,
        subject,
        template: React.createElement(NICInspectionScheduledEmail, {
            facilityName,
            ownerName,
            scheduledDate,
            scheduledTime,
            inspectorName
        })
    });
}

export async function sendFoundingPaymentReceiptEmail(
    email: string,
    fullName: string,
    amount: string,
    reference: string
) {
    const subject = "Payment Confirmed: Your NIC Founding Membership Contribution";

    return sendEmail({
        to: email,
        subject,
        template: React.createElement(NICFoundingPaymentReceiptEmail, {
            fullName,
            amount,
            reference
        })
    });
}


