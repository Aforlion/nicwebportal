"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, FileText, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

interface FileUploadProps {
    value: string
    onChange: (url: string) => void
    bucket?: string
    label?: string
    disabled?: boolean
    accept?: string
    apiEndpoint?: string
    name?: string
}

export function FileUpload({
    value,
    onChange,
    bucket = "course-resources",
    label = "Upload File",
    disabled = false,
    accept = ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip",
    name = "file_url"
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files || e.target.files.length === 0) return

            setUploading(true)
            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}_${file.name.replace(/\s+/g, '_')}` // Append original name for clarity
            const filePath = `uploads/${fileName}`

            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath)

            onChange(publicUrl)
            toast.success("File uploaded successfully")
        } catch (error: any) {
            console.error('Error uploading file:', error)
            toast.error(error.message || "Failed to upload file")
        } finally {
            setUploading(false)
        }
    }

    const removeFile = () => {
        onChange("")
    }

    // Extract filename from URL for display
    const displayFileName = value ? value.split('/').pop() : ""

    return (
        <div className="space-y-2 w-full">
            {label && <Label>{label}</Label>}

            {value ? (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-xs transition-all">
                                {displayFileName}
                            </p>
                            <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                            >
                                View File
                            </a>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={removeFile}
                        disabled={disabled || uploading}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="relative group">
                    <input
                        type="file"
                        accept={accept}
                        onChange={handleUpload}
                        disabled={disabled || uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                    />
                    <div className={`
                        flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors
                        ${disabled ? 'opacity-50 bg-muted' : 'hover:bg-accent/5 hover:border-primary/50'}
                    `}>
                        {uploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <span className="text-sm text-muted-foreground">Uploading...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-center">
                                <Upload className="h-8 w-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                                <span className="text-sm font-medium">Click to upload file</span>
                                <span className="text-xs text-muted-foreground mt-1">PDF, Docs, Excel (Max 10MB)</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Hidden input for form submission */}
            <input type="hidden" name={name} value={value} />
        </div>
    )
}
