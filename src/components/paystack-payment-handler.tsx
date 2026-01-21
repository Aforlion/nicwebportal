"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CreditCard } from "lucide-react"
import { usePaystackPayment } from "react-paystack"
import { toast } from "sonner"

interface PaystackPaymentHandlerProps {
    email: string
    amount: number
    onSuccess: () => void
    className?: string
    buttonText?: string
    showIcon?: boolean
}

export default function PaystackPaymentHandler({
    email,
    amount,
    onSuccess,
    className,
    buttonText = "Pay with Paystack",
    showIcon = false
}: PaystackPaymentHandlerProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const config = {
        reference: (new Date()).getTime().toString(),
        email: email,
        amount: amount * 100, // Paystack works in kobo
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
    }

    const initializePayment = usePaystackPayment(config)

    if (!mounted) {
        return (
            <Button className={className} disabled>
                {showIcon && <CreditCard className="mr-2 h-4 w-4" />}
                Loading Payment...
            </Button>
        )
    }

    return (
        <Button
            onClick={() => {
                if (!email) {
                    toast.error("Please provide an email address.")
                    return
                }
                initializePayment({
                    onSuccess: () => onSuccess(),
                    onClose: () => toast.info("Payment window closed.")
                })
            }}
            className={className}
        >
            {showIcon && <CreditCard className="mr-2 h-4 w-4" />}
            {buttonText}
        </Button>
    )
}
