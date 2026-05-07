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
