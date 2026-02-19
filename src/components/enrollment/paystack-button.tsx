'use client'

import { usePaystackPayment } from 'react-paystack'
import { Button } from "@/components/ui/button"
import { verifyPaymentAndEnroll } from "@/actions/enrollment"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Lock } from "lucide-react"
import { toast } from "sonner" // Assuming sonner is installed or we use basic alert/toast

interface PaystackButtonProps {
    amount: number // in Naira
    email: string
    courseId: string
    courseTitle: string
}

export default function PaystackButton({ amount, email, courseId, courseTitle }: PaystackButtonProps) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    // Paystack expects amount in kobo
    const config = {
        reference: (new Date()).getTime().toString(),
        email: email,
        amount: amount * 100, // Convert to kobo
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
    }

    const initializePayment = usePaystackPayment(config)

    const onSuccess = async (reference: any) => {
        setIsLoading(true)
        // reference object contains {message: "Approved", reference: "...", status: "success", trans: "..."}
        // reference.reference is the ID we need.
        // Actually, sometimes the argument is just the reference string depending on version, 
        // but typically it's an object. Let's log to be safe in real app, but here strictly:
        // Handle different reference formats (sometimes object {reference: '...'}, sometimes just string)
        const refId = typeof reference === 'object' ? reference.reference : reference;

        try {
            const result = await verifyPaymentAndEnroll(refId, courseId)

            if (result.success) {
                toast.success("Enrollment successful!")
                router.push(`/portal/student/courses/${courseId}`)
            } else {
                toast.error(result.error || "Enrollment failed. Please contact support.")
            }
        } catch (e) {
            toast.error("An error occurred during verification.")
        } finally {
            setIsLoading(false)
        }
    }

    const onClose = () => {
        console.log('Payment closed')
        setIsLoading(false)
    }

    const handlePayment = () => {
        if (!config.publicKey) {
            console.error('Paystack Public Key is missing from environment variables (NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY)')
            toast.error("Payment configuration error. Please ensure you have redeployed after setting environment variables.")
            return
        }

        console.log('Initializing Paystack with key:', config.publicKey.substring(0, 10) + '...')
        setIsLoading(true)
        try {
            initializePayment({ onSuccess, onClose })
        } catch (error) {
            console.error('Paystack initialization error:', error)
            setIsLoading(false)
            toast.error("Failed to start payment process.")
        }
    }

    return (
        <Button
            size="lg"
            className="w-full text-lg font-semibold h-12"
            onClick={handlePayment}
            disabled={isLoading}
        >
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
            ) : (
                <>
                    Pay ₦{amount.toLocaleString()} <Lock className="ml-2 h-4 w-4" />
                </>
            )}
        </Button>
    )
}
