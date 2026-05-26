"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Upload, FileText, Download, Trash2, Eye, Loader2, CheckCircle, AlertCircle, Award, FileSpreadsheet, ShieldAlert
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

const REQUIRED_DOCUMENTS = [
    { type: "Regulatory License", description: "Current CAC registration or state operating license." },
    { type: "Insurance Policy", description: "Professional indemnity or third-party liability insurance." },
    { type: "Fire Safety Certificate", description: "Latest fire safety inspection or clearance certificate." }
]

const DOCUMENT_TYPES = [
    "Regulatory License",
    "Insurance Policy",
    "Fire Safety Certificate",
    "Quality Assurance Report",
    "Staff Training Matrix",
    "Other"
]

export default function FacilityCertificatesPage() {
    const [loading, setLoading] = useState(true)
    const [documents, setDocuments] = useState<Document[]>([])
    const [membershipId, setMembershipId] = useState<string | null>(null)

    // Upload form state
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [docType, setDocType] = useState(DOCUMENT_TYPES[0])
    const [docName, setDocName] = useState("")
    const [isUploading, setIsUploading] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchDocuments()
    }, [])

    const fetchDocuments = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Get user's membership_id
            const { data: membership } = await supabase
                .from('memberships')
                .select('id')
                .eq('user_id', user.id)
                .single()

            if (!membership) {
                console.error("No membership record found for user.")
                return
            }

            setMembershipId(membership.id)

            // Get uploaded documents
            const { data: docData, error } = await supabase
                .from('documents')
                .select('*')
                .eq('membership_id', membership.id)
                .order('uploaded_at', { ascending: false })

            if (error) throw error

            if (docData) {
                const formatted = docData.map(doc => ({
                    id: doc.id,
                    name: doc.document_name,
                    type: doc.document_type,
                    uploadDate: new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    size: doc.file_size ? `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB` : 'Unknown size',
                    status: (doc.status ?? 'pending').charAt(0).toUpperCase() + (doc.status ?? 'pending').slice(1),
                    url: doc.file_url,
                }))
                setDocuments(formatted)
            }
        } catch (err) {
            console.error("Error loading documents:", err)
            toast.error("Failed to load documents")
        } finally {
            setLoading(false)
        }
    }

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
        if (!membershipId) { toast.error("Membership details missing"); return }

        setIsUploading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) { toast.error("You must be logged in"); return }

            const ext = selectedFile.name.split(".").pop()
            const storagePath = `${user.id}/${Date.now()}_${docName.replace(/\s+/g, "_")}.${ext}`

            // 1. Upload to Storage bucket (using member-documents)
            const { error: uploadError } = await supabase.storage
                .from("member-documents")
                .upload(storagePath, selectedFile, { upsert: false })

            if (uploadError) {
                console.error("Storage upload error:", uploadError)
                toast.error(`Upload failed: ${uploadError.message}`)
                return
            }

            // 2. Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from("member-documents")
                .getPublicUrl(storagePath)

            // 3. Save to database using saveDocumentRecord action
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

            toast.success("Document uploaded successfully for review.")

            // Refresh documents list
            await fetchDocuments()

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
                toast.success("Document deleted.")
                await fetchDocuments()
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

    if (loading) {
        return <div className="p-8 text-center">Loading Compliance & Documents...</div>
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-secondary">Compliance & Documents</h1>
                <p className="text-muted-foreground">Upload and manage your institutional credentials, licenses, and safety policies.</p>
            </div>

            {/* Compliance Status Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                {REQUIRED_DOCUMENTS.map((req) => {
                    const foundDoc = documents.find(d => d.type === req.type)
                    const status = foundDoc?.status?.toUpperCase() || "MISSING"

                    return (
                        <Card key={req.type} className={`border-l-4 ${
                            status === "VERIFIED" || status === "APPROVED" ? "border-l-emerald-500" :
                            status === "PENDING" ? "border-l-amber-500" : "border-l-red-500"
                        }`}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-sm font-bold text-secondary">{req.type}</CardTitle>
                                    <Badge variant="outline" className={
                                        status === "VERIFIED" || status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                        status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"
                                    }>
                                        {status}
                                    </Badge>
                                </div>
                                <CardDescription className="text-xs pt-1">{req.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="text-xs text-muted-foreground">
                                {foundDoc ? (
                                    <div className="flex items-center justify-between bg-muted/30 p-2 rounded mt-2">
                                        <span className="truncate max-w-[150px] font-medium">{foundDoc.name}</span>
                                        <a href={foundDoc.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold flex items-center gap-1">
                                            <Eye className="h-3 w-3" /> View Doc
                                        </a>
                                    </div>
                                ) : (
                                    <div className="text-destructive font-medium flex items-center gap-1.5 mt-2">
                                        <ShieldAlert className="h-3.5 w-3.5" /> Action Required: Please upload.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Upload Form */}
                <Card className="lg:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle>Upload Document</CardTitle>
                        <CardDescription>Submit compliance files for administrator review.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${selectedFile ? "border-primary/60 bg-primary/5" : "border-muted-foreground/20 bg-muted/30 hover:bg-muted/50"}`}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {selectedFile ? (
                                <div className="flex flex-col items-center gap-1 text-center p-2">
                                    <CheckCircle className="w-6 h-6 text-primary" />
                                    <p className="text-xs font-semibold text-primary truncate max-w-[200px]">{selectedFile.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    <button
                                        className="text-[10px] text-destructive hover:underline mt-1"
                                        onClick={e => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                                    >Remove</button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 p-4 text-center">
                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">
                                        <span className="font-semibold text-primary">Click to browse</span>
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">PDF, JPG, PNG — up to 10 MB</p>
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

                        <div className="space-y-2">
                            <Label htmlFor="doc-name" className="text-xs font-bold">Document Title</Label>
                            <Input
                                id="doc-name"
                                placeholder="e.g. CAC Certificate of Incorporation"
                                value={docName}
                                onChange={e => setDocName(e.target.value)}
                                className="text-xs"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="doc-type" className="text-xs font-bold">Document Category</Label>
                            <select
                                id="doc-type"
                                value={docType}
                                onChange={e => setDocType(e.target.value)}
                                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <Button
                            className="w-full bg-primary mt-2 text-xs font-bold"
                            onClick={handleUpload}
                            disabled={isUploading || !selectedFile}
                        >
                            {isUploading ? (
                                <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Uploading...</>
                            ) : (
                                <><Upload className="mr-2 h-3.5 w-3.5" />Submit Document</>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Document List */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Repository</CardTitle>
                        <CardDescription>All uploaded files and their current review status.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {documents.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <FileText className="mx-auto h-12 w-12 mb-2 opacity-10" />
                                    <p className="text-sm font-medium">No documents uploaded yet</p>
                                    <p className="text-xs mt-1">Submit your verification documents using the upload panel.</p>
                                </div>
                            ) : (
                                documents.map(doc => (
                                    <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border bg-background hover:bg-muted/30 transition-colors gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="h-9 w-9 rounded bg-primary/15 flex items-center justify-center flex-shrink-0">
                                                <FileText className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-secondary text-sm truncate">{doc.name}</p>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                                                    <span className="capitalize">{doc.type}</span>
                                                    <span>•</span>
                                                    <span>{doc.uploadDate}</span>
                                                    <span>•</span>
                                                    <span>{doc.size}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
                                            <Badge variant="outline" className={`text-[10px] font-bold ${getStatusClass(doc.status)}`}>
                                                {doc.status.toUpperCase()}
                                            </Badge>
                                            <div className="flex gap-0.5">
                                                <Button variant="ghost" size="icon" className="h-7 w-7" asChild title="View">
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </a>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7" asChild title="Download">
                                                    <a href={doc.url} download>
                                                        <Download className="h-3.5 w-3.5 text-muted-foreground" />
                                                    </a>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/5"
                                                    title="Delete"
                                                    onClick={() => handleDelete(doc.id)}
                                                    disabled={deletingId === doc.id}
                                                >
                                                    {deletingId === doc.id ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    )}
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
        </div>
    )
}
