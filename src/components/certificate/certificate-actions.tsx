'use client'

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface CertificateActionsProps {
    /** The fully-qualified verification URL for this certificate */
    verificationUrl: string
}

/**
 * Client component wrapper for all interactive controls on the certificate page.
 * Isolated here because onClick/window.print() cannot be used in Server Components.
 */
export default function CertificateActions({ verificationUrl }: CertificateActionsProps) {
    return (
        <div className="w-full max-w-[800px] mb-6 flex justify-between items-center print:hidden">
            <Link href="/" className="font-bold text-lg flex items-center gap-2">
                <Image src="/logo.jpg" alt="NIC" width={24} height={24} className="rounded" />
                NIC Portal
            </Link>
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={() => window.print()}
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                </Button>
            </div>
        </div>
    )
}
