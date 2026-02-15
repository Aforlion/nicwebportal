"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadProps {
    value: string
    onChange: (url: string) => void
    bucket?: string
    label?: string
    disabled?: boolean
}

export function ImageUpload({
    value,
    onChange,
    bucket = "course-thumbnails",
    label = "Upload Image",
    disabled = false
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files || e.target.files.length === 0) return

            setUploading(true)
            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `uploads/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath)

            onChange(publicUrl)
            toast.success("Image uploaded successfully")
        } catch (error: any) {
            console.error('Error uploading image:', error)
            toast.error(error.message || "Failed to upload image")
        } finally {
            setUploading(false)
        }
    }

    const removeImage = () => {
        onChange("")
    }

    return (
        <div className="space-y-4 w-full">
            <Label>{label}</Label>

            {value ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border bg-muted">
                    <img
                        src={value}
                        alt="Preview"
                        className="h-full w-full object-cover"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={removeImage}
                        disabled={disabled || uploading}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="relative">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={disabled || uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg hover:bg-accent/5 transition-colors">
                        {uploading ? (
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        ) : (
                            <div className="flex flex-col items-center">
                                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                <span className="text-sm font-medium">Click or drag to upload image</span>
                                <span className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP (Max 2MB)</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Hidden input to ensure the value is captured by form submission if needed */}
            <input type="hidden" name="thumbnail_url" value={value} />
        </div>
    )
}
