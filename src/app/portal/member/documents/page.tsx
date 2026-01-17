"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Upload,
    FileText,
    Download,
    Trash2,
    Eye,
    Search,
    Filter
} from "lucide-react"

const documents = [
    { id: 1, name: "HCA Certificate.pdf", type: "Certificate", uploadDate: "March 15, 2024", size: "2.4 MB", status: "Verified" },
    { id: 2, name: "National ID Card.pdf", type: "Identification", uploadDate: "March 15, 2024", size: "1.1 MB", status: "Verified" },
    { id: 3, name: "Passport Photograph.jpg", type: "Photo", uploadDate: "March 15, 2024", size: "856 KB", status: "Verified" },
    { id: 4, name: "CPD Certificate - Dementia Care.pdf", type: "CPD", uploadDate: "Dec 12, 2023", size: "1.8 MB", status: "Approved" },
]

const documentTypes = ["All", "Certificate", "Identification", "Photo", "CPD", "Other"]

export default function MemberDocumentsPage() {
    const [selectedType, setSelectedType] = useState("All")
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">My Documents</h1>
                    <p className="text-muted-foreground">Manage your certificates and compliance documents</p>
                </div>
                <Button className="bg-primary">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Document
                </Button>
            </div>

            {/* Upload Area */}
            <Card>
                <CardHeader>
                    <CardTitle>Upload New Document</CardTitle>
                    <CardDescription>Add certificates, IDs, or CPD documents to your profile</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
                            </div>
                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
                        </label>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex gap-2 flex-wrap">
                            {documentTypes.map((type) => (
                                <Button
                                    key={type}
                                    variant={selectedType === type ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedType(type)}
                                    className={selectedType === type ? "bg-primary" : ""}
                                >
                                    <Filter className="mr-2 h-3 w-3" />
                                    {type}
                                </Button>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search documents..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Documents List */}
            <Card>
                <CardHeader>
                    <CardTitle>Uploaded Documents</CardTitle>
                    <CardDescription>Your verified and pending documents</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border bg-background hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <FileText className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-secondary truncate">{doc.name}</p>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <span>{doc.type}</span>
                                            <span>•</span>
                                            <span>{doc.uploadDate}</span>
                                            <span>•</span>
                                            <span>{doc.size}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge
                                        variant="outline"
                                        className={
                                            doc.status === "Verified" || doc.status === "Approved"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : "bg-amber-50 text-amber-700 border-amber-200"
                                        }
                                    >
                                        {doc.status}
                                    </Badge>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
