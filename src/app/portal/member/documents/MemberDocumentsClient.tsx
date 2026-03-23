"use client"

import { useState, useRef, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Upload, FileText, Download, Trash2, Eye, Search,
    Filter, Loader2, CheckCircle, AlertCircle, X
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase"
import { saveDocumentRecord, deleteDocumentRecord } from "@/actions/member/documents"

interface Document {
    id: string
    name: string
    type: string
    uploadDate: string
    size: string
    status: string
    url: string
}

interface MemberDocumentsClientProps {
    initialDocuments: Document[]
}

const DOCUMENT_TYPES = [
    "Certificate",
    "Identification",
    "Photo",
    "CPD",
    "Degree / Diploma",
    "Reference Letter",
    "Other",
]

const FILTER_TYPES = ["All", ...DOCUMENT_TYPES]

export default function MemberDocumentsClient({ initialDocuments }: MemberDocumentsClientProps) {
    const [documents, setDocuments] = useState<Document[]>(initialDocuments)
    const [selectedFilter, setSelectedFilter] = useState("All")
    const [searchQuery, setSearchQuery] = useState("")

    // Upload form state
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [docType, setDocType] = useState(DOCUMENT_TYPES[0])
    const [docName, setDocName] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const filteredDocuments = documents.filter(doc => {
        const matchesType = selectedFilter === "All" || doc.type.toLowerCase() === selectedFilter.toLowerCase()
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesType && matchesSearch
    })

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (file.size > 10 * 1024 * 1024) {
            toast.error("File must be smaller than 10 MB")
            return
        }
        setSelectedFile(file)
        if (!docName) setDocName(file.name.replace(/\.[^.]+$/, ""))
    }

    const handleUpload = async () => {
        if (!selectedFile) { toast.error("Please select a file first"); return }
        if (!docName.trim()) { toast.error("Please enter a document name"); return }

        setIsUploading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { toast.error("You must be logged in"); return }

            const ext = selectedFile.name.split(".").pop()
            const storagePath = `${user.id}/${Date.now()}_${docName.replace(/\s+/g, "_")}.${ext}`

            // 1 — Upload file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from("member-documents")
                .upload(storagePath, selectedFile, { upsert: false })

            if (uploadError) {
                console.error("Storage upload error:", uploadError)
                toast.error(`Upload failed: ${uploadError.message}`)
                return
            }

            // 2 — Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from("member-documents")
                .getPublicUrl(storagePath)

            // 3 — Save record to DB via server action
            const result = await saveDocumentRecord({
                documentName: docName.trim(),
                documentType: docType,
                fileUrl: publicUrl,
                fileSize: selectedFile.size,
                mimeType: selectedFile.type,
            })

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success("Document uploaded successfully! It will be reviewed by our team.")

            // Optimistically add to local state
            const newDoc: Document = {
                id: `temp-${Date.now()}`,
                name: docName.trim(),
                type: docType,
                uploadDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
                status: "Pending",
                url: publicUrl,
            }
            setDocuments(prev => [newDoc, ...prev])

            // Reset form
            setSelectedFile(null)
            setDocName("")
            setDocType(DOCUMENT_TYPES[0])
            if (fileInputRef.current) fileInputRef.current.value = ""
        } catch (err: any) {
            console.error("Unexpected upload error:", err)
            toast.error("An unexpected error occurred. Please try again.")
        } finally {
            setIsUploading(false)
        }
    }

    const handleDelete = async (docId: string) => {
        if (!confirm("Are you sure you want to delete this document?")) return
        setDeletingId(docId)
        try {
            const result = await deleteDocumentRecord(docId)
            if (result.error) {
                toast.error(result.error)
            } else {
                setDocuments(prev => prev.filter(d => d.id !== docId))
                toast.success("Document deleted.")
            }
        } finally {
            setDeletingId(null)
        }
    }

    const getStatusClass = (status: string) => {
        const s = status.toLowerCase()
        if (s === "verified" || s === "approved") return "bg-emerald-50 text-emerald-700 border-emerald-200"
        if (s === "rejected") return "bg-red-50 text-red-700 border-red-200"
        return "bg-amber-50 text-amber-700 border-amber-200"
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-secondary">My Documents</h1>
                <p className="text-muted-foreground">Upload and manage your certificates and compliance documents</p>
            </div>

            {/* Upload Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload New Document</CardTitle>
                    <CardDescription>Add certificates, IDs, or CPD documents to your profile. Files are reviewed by our team.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Drop zone */}
                    <div
                        className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${selectedFile ? "border-primary/60 bg-primary/5" : "border-muted-foreground/20 bg-muted/30 hover:bg-muted/50"}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {selectedFile ? (
                            <div className="flex flex-col items-center gap-2">
                                <CheckCircle className="w-8 h-8 text-primary" />
                                <p className="text-sm font-medium text-primary">{selectedFile.name}</p>
                                <p className="text-xs text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                <button
                                    className="text-xs text-destructive hover:underline mt-1"
                                    onClick={e => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                                >Remove</button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <Upload className="w-10 h-10 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-primary">Click to browse</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">PDF, JPG, PNG — up to 10 MB</p>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </div>

                    {/* Metadata fields */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label htmlFor="doc-name">Document Name</Label>
                            <Input
                                id="doc-name"
                                placeholder="e.g. NYSC Certificate"
                                value={docName}
                                onChange={e => setDocName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="doc-type">Document Type</Label>
                            <select
                                id="doc-type"
                                value={docType}
                                onChange={e => setDocType(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>

                    <Button
                        className="w-full sm:w-auto bg-primary"
                        onClick={handleUpload}
                        disabled={isUploading || !selectedFile}
                    >
                        {isUploading
                            ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
                            : <><Upload className="mr-2 h-4 w-4" />Upload Document</>
                        }
                    </Button>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-2 flex-wrap">
                            {FILTER_TYPES.map(type => (
                                <Button
                                    key={type}
                                    variant={selectedFilter === type ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedFilter(type)}
                                    className={selectedFilter === type ? "bg-primary" : ""}
                                >
                                    <Filter className="mr-1.5 h-3 w-3" />{type}
                                </Button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-56">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search documents..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Documents List */}
            <Card>
                <CardHeader>
                    <CardTitle>Uploaded Documents</CardTitle>
                    <CardDescription>
                        Documents submitted for verification. Pending documents are under admin review.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {filteredDocuments.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <FileText className="mx-auto h-12 w-12 mb-4 opacity-10" />
                                <p className="font-medium">No documents found</p>
                                <p className="text-sm mt-1">Upload your first document using the form above.</p>
                            </div>
                        ) : (
                            filteredDocuments.map(doc => (
                                <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border bg-background hover:bg-muted/30 transition-colors gap-4">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <FileText className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-secondary truncate">{doc.name}</p>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                                <span className="capitalize">{doc.type}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span>{doc.uploadDate}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span>{doc.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                                        <Badge variant="outline" className={getStatusClass(doc.status)}>
                                            {doc.status.toUpperCase()}
                                        </Badge>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="View">
                                                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Download">
                                                <a href={doc.url} download>
                                                    <Download className="h-4 w-4" />
                                                </a>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                                title="Delete"
                                                onClick={() => handleDelete(doc.id)}
                                                disabled={deletingId === doc.id}
                                            >
                                                {deletingId === doc.id
                                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                                    : <Trash2 className="h-4 w-4" />
                                                }
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
