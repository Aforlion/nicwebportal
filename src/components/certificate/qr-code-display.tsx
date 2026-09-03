'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Skeleton } from "@/components/ui/skeleton"

interface QRCodeDisplayProps {
    value: string
    size?: number
}

export default function QRCodeDisplay({ value, size = 120 }: QRCodeDisplayProps) {
    const [dataUrl, setDataUrl] = useState<string>('')

    useEffect(() => {
        if (value) {
            // Ensure URL is a valid public HTTPS link for camera scanners
            let scannableUrl = value
            if (scannableUrl.includes('localhost') || scannableUrl.includes('127.0.0.1')) {
                // Extract path after host, e.g. /certificates/NCNA-2026-66856
                const path = scannableUrl.substring(scannableUrl.indexOf('/', scannableUrl.indexOf('//') + 2))
                scannableUrl = `https://www.nicnigeria.org${path}`
            }

            QRCode.toDataURL(scannableUrl, {
                width: size * 3, // High resolution image for ultra-sharp scanning
                margin: 3,
                errorCorrectionLevel: 'H', // High error correction level
                color: {
                    dark: '#0f172a',
                    light: '#ffffff'
                }
            })
                .then(url => setDataUrl(url))
                .catch(err => console.error("QR Code Generation Error:", err))
        }
    }, [value, size])

    if (!dataUrl) {
        return <Skeleton className="rounded-md" style={{ width: size, height: size }} />
    }

    return (
        <img 
            src={dataUrl} 
            alt="Scan to Verify Certificate Authenticity" 
            width={size} 
            height={size} 
            className="border border-slate-300 rounded shadow-sm object-contain bg-white" 
        />
    )
}

