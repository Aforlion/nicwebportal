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
            QRCode.toDataURL(value, {
                width: size,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            })
                .then(url => setDataUrl(url))
                .catch(err => console.error(err))
        }
    }, [value, size])

    if (!dataUrl) {
        return <Skeleton className="rounded-md" style={{ width: size, height: size }} />
    }

    return (
        <img src={dataUrl} alt="Certificate QR Code" width={size} height={size} className="border border-slate-200" />
    )
}
