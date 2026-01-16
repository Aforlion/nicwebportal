"use server"

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

if (!PAYSTACK_SECRET_KEY) {
    console.warn("PAYSTACK_SECRET_KEY is not defined in environment variables.")
}

/**
 * Initialize a Paystack transaction
 * @param email - Customer email
 * @param amount - Amount in Naira (will be converted to Kobo)
 * @param metadata - Optional metadata (e.g., student_id, program_id)
 * @param callbackUrl - URL to redirect to after payment
 */
export async function initializeTransaction(
    email: string,
    amount: number,
    metadata: Record<string, unknown> = {},
    callbackUrl?: string
) {
    try {
        const response = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                amount: amount * 100, // Paystack expects amount in kobo
                metadata,
                callback_url: callbackUrl || `${process.env.NEXT_PUBLIC_SITE_URL || ''}/payment/verify`,
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || "Failed to initialize Paystack transaction")
        }

        return { success: true, authorization_url: data.data.authorization_url, reference: data.data.reference }
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error))
        console.error("Paystack Initialization Error:", err)
        return { success: false, error: err.message }
    }
}

/**
 * Verify a Paystack transaction
 * @param reference - Transaction reference from Paystack
 */
export async function verifyTransaction(reference: string) {
    try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || "Failed to verify Paystack transaction")
        }

        return { success: true, data: data.data }
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error))
        console.error("Paystack Verification Error:", err)
        return { success: false, error: err.message }
    }
}
