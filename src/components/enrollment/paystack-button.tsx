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

        try {
            const result = await verifyPaymentAndEnroll(reference.reference, courseId)

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
        setIsLoading(true)
        initializePayment({ onSuccess, onClose })
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
