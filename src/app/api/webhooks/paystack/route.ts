import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { env } from "@/env";
import { finalizeRegistrationAction } from "@/lib/actions/registration";
import { enrollFromWebhookAction } from "@/actions/enrollment";
import logger from "@/lib/logger";

export async function POST(req: NextRequest) {
    try {
        const signature = req.headers.get("x-paystack-signature");
        if (!signature) {
            return NextResponse.json({ message: "No signature" }, { status: 400 });
        }

        const bodyText = await req.text();
        const hash = crypto.createHmac("sha512", env.PAYSTACK_SECRET_KEY).update(bodyText).digest("hex");

        if (hash !== signature) {
            return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
        }

        const event = JSON.parse(bodyText);

        if (event.event === "charge.success") {
            const reference = event.data.reference;
            const metadata = event.data.metadata ?? {};
            const paymentType = metadata.payment_type;
            const customerEmail = event.data.customer?.email;

            logger.info("Paystack webhook received charge.success", { reference, paymentType, customerEmail });

            if (paymentType === "course_enrollment") {
                // Route to enrollment handler
                const courseId = metadata.course_id;

                if (!courseId || !customerEmail) {
                    logger.error("Paystack webhook: missing course_id or email in course_enrollment payload", { reference, metadata });
                    return NextResponse.json({ received: true });
                }

                const result = await enrollFromWebhookAction(reference, courseId, customerEmail);

                if (!result.success && result.message !== "Already enrolled.") {
                    logger.error("Paystack webhook: enrollFromWebhookAction failed", { reference, courseId, customerEmail, error: result.message });
                } else {
                    logger.info("Paystack webhook: course enrollment processed", { reference, courseId, customerEmail, message: result.message });
                }

            } else if (paymentType === "cpd_microcredential") {
                logger.info("Paystack webhook: cpd_microcredential payment confirmed", {
                    reference,
                    customerEmail,
                    cpdTitle: metadata.cpd_title,
                    fullName: metadata.full_name,
                    amount: event.data.amount / 100
                });

                try {
                    const { sendEmail } = await import("@/lib/email");
                    await sendEmail({
                        to: customerEmail,
                        subject: `🎉 Enrolment Confirmed: ${metadata.cpd_title || "NIC CPD Micro-Credential"}`,
                        html: `
                            <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 24px;">
                                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0;">
                                    <div style="text-align: center; margin-bottom: 24px;">
                                        <span style="background: #fef3c7; color: #b45309; font-weight: bold; font-size: 11px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase;">CPD Micro-Credential Confirmed</span>
                                        <h2 style="color: #0f172a; font-size: 22px; margin-top: 12px;">Welcome to Your Professional CPD Course!</h2>
                                    </div>
                                    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hi <strong>${metadata.full_name || "Caregiver"}</strong>,</p>
                                    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Thank you for enrolling in <strong>${metadata.cpd_title || "NIC CPD Micro-Credential"}</strong>. Your payment of <strong>₦${(event.data.amount / 100).toLocaleString()}</strong> was successfully processed.</p>
                                    
                                    <div style="background: #f1f5f9; padding: 16px; border-radius: 12px; margin: 20px 0; font-size: 14px;">
                                        <p style="margin: 4px 0; color: #475569;"><strong>Transaction Reference:</strong> ${reference}</p>
                                        <p style="margin: 4px 0; color: #475569;"><strong>Learner Email:</strong> ${customerEmail}</p>
                                    </div>

                                    <p style="color: #334155; font-size: 15px; line-height: 1.6;">Your study handbook and micro-credential modules are now unlocked. You can log into your portal anytime to complete your assessment and download your verifiable CPD certificate.</p>
                                    
                                    <p style="margin-top: 28px; font-weight: 600; color: #0f172a;">
                                        Happy Learning!<br>
                                        <span style="color: #64748b; font-size: 13px;">National Institute of Caregivers (NIC Nigeria)</span>
                                    </p>
                                </div>
                            </div>
                        `
                    });
                } catch (emailErr) {
                    logger.error("Failed sending CPD confirmation email", { reference, customerEmail, error: emailErr });
                }

            } else {
                // Route to registration handler (founding / individual / facility)
                const result = await finalizeRegistrationAction(reference);

                if (!result.success && result.message !== "Already completed.") {
                    logger.error("Paystack webhook: finalizeRegistrationAction failed", { reference, error: result.message });
                } else {
                    logger.info("Paystack webhook: registration finalized", { reference, type: result.type });
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        logger.error("Paystack webhook error", { error: error.message });
        return NextResponse.json({ message: "Webhook handler failed" }, { status: 500 });
    }
}
