'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Printer, Download, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import html2canvas from "html2canvas-pro"
import { toast } from "sonner"

interface CertificateActionsProps {
    verificationUrl: string
}

export default function CertificateActions({ verificationUrl }: CertificateActionsProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleDownload = async () => {
        setIsExporting(true)
        toast.info("Generating certificate image...")

        try {
            const certElement = document.getElementById("printable-certificate")
            if (!certElement) {
                toast.error("Certificate view element not found.")
                setIsExporting(false)
                return
            }

            const canvas = await html2canvas(certElement, {
                scale: 3, // Crisp 3x DPI print resolution
                useCORS: true,
                allowTaint: true,
                backgroundColor: "#FAF9F6",
                logging: false,
            })

            const image = canvas.toDataURL("image/png")
            const link = document.createElement("a")
            link.href = image
            link.download = `NIC_Certificate.png`
            link.click()

            toast.success("Certificate downloaded successfully!")
        } catch (err: any) {
            console.error("Certificate download error:", err)
            toast.error("Failed to generate download image.")
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="w-full max-w-[920px] mb-6 flex justify-between items-center print:hidden">
            <Link href="/" className="font-bold text-lg text-white flex items-center gap-2 hover:opacity-90 transition-opacity">
                <Image src="/logo.jpg" alt="NIC" width={28} height={28} className="rounded" />
                <span>NIC Nigeria Portal</span>
            </Link>
            <div className="flex gap-3">
                <Button
                    onClick={handleDownload}
                    disabled={isExporting}
                    className="bg-[#D97706] hover:bg-[#b45309] text-white font-bold text-xs"
                >
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Download Image
                </Button>
                <Button
                    variant="outline"
                    onClick={() => window.print()}
                    className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 font-bold text-xs"
                >
                    <Printer className="mr-2 h-4 w-4" />
                    Print / Save as PDF
                </Button>
            </div>
        </div>
    )
}
