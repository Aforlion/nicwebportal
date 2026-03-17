import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { env } from "@/env";
import { finalizeRegistrationAction } from "@/lib/actions/registration";
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
            logger.info("Paystack webhook received charge.success", { reference });

            // Call the exact same action the frontend uses
            const result = await finalizeRegistrationAction(reference);

            if (!result.success && result.message !== "Already completed.") {
                logger.error("Paystack webhook finalize failed", { reference, error: result.message });
            } else {
                logger.info("Paystack webhook finalize processed successfully", { reference, type: result.type });
            }
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        logger.error("Paystack webhook error", { error: error.message });
        return NextResponse.json({ message: "Webhook handler failed" }, { status: 500 });
    }
}
