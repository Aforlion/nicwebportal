"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"
import { usePaystackPayment } from "react-paystack"
import { toast } from "sonner"
import { initializeTransaction } from "@/lib/payments/paystack"
import { useRouter } from "next/navigation"

interface PaystackPaymentHandlerProps {
    email: string
    amount: number
    onSuccess?: () => void
    onBefore?: () => Promise<{ success: boolean, metadata?: Record<string, any>, error?: string }>
    className?: string
    buttonText?: string
    showIcon?: boolean
    useRedirect?: boolean
    metadata?: Record<string, any>
    callbackUrl?: string
}

export default function PaystackPaymentHandler({
    email,
    amount,
    onSuccess,
    onBefore,
    className,
    buttonText = "Pay with Paystack",
    showIcon = false,
    useRedirect = false,
    metadata = {},
    callbackUrl
}: PaystackPaymentHandlerProps) {
    const [mounted, setMounted] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    const config = {
        reference: (new Date()).getTime().toString(),
        email: email,
        amount: amount * 100, // Paystack works in kobo
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
        metadata: {
            ...metadata,
            custom_fields: metadata.custom_fields || []
        }
    } as any // Use any to bypass strict react-paystack typings if they conflict

    const initializeInlinePayment = usePaystackPayment(config)

    const handlePayment = async () => {
        if (!email) {
            toast.error("Please provide an email address.")
            return
        }

        setLoading(true)
        let mergedMetadata = { ...metadata }

        if (onBefore) {
            try {
                const res = await onBefore()
                if (!res.success) {
                    toast.error(res.error || "Preparation failed. Please try again.")
                    setLoading(false)
                    return
                }
                if (res.metadata) {
                    mergedMetadata = { ...mergedMetadata, ...res.metadata }
                }
            } catch (err) {
                toast.error("An error occurred during preparation.")
                setLoading(false)
                return
            }
        }

        if (useRedirect) {
            try {
                const res = await initializeTransaction(email, amount, mergedMetadata, callbackUrl)
                if (res.success && res.authorization_url) {
                    window.location.href = res.authorization_url
                } else {
                    toast.error(res.error || "Failed to initialize payment redirect.")
                    setLoading(false)
                }
            } catch (err) {
                toast.error("An error occurred. Please try again.")
                setLoading(false)
            }
        } else {
            setLoading(false)
            const inlineConfig = {
                ...config,
                metadata: {
                    ...mergedMetadata,
                    custom_fields: (mergedMetadata as any).custom_fields || []
                }
            }
            // Note: usePaystackPayment hook doesn't easily allow dynamic config updates after init
            // But for inline, we usually don't need a redirect callback.
            // We'll just trigger the popup.
            initializeInlinePayment({
                onSuccess: () => onSuccess?.(),
                onClose: () => toast.info("Payment window closed.")
            })
        }
    }

    if (!mounted) {
        return (
            <Button className={className} disabled>
                {showIcon && <CreditCard className="mr-2 h-4 w-4" />}
                Loading...
            </Button>
        )
    }

    return (
        <Button
            onClick={handlePayment}
            className={className}
            disabled={loading}
        >
            {loading ? (
                <span className="flex items-center gap-2 italic">Initializing...</span>
            ) : (
                <>
                    {showIcon && <CreditCard className="mr-2 h-4 w-4" />}
                    {buttonText}
                </>
            )}
        </Button>
    )
}
