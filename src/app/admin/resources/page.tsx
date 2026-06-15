"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Textarea from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format } from "date-fns"
import {
    Plus,
    BookOpen,
    Download,
    Trash2,
    Edit,
    Save,
    X,
    Loader2,
    FileText,
    Image as ImageIcon,
    ExternalLink,
    Check,
    AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { getResources, createResource, updateResource, deleteResource } from "@/actions/resources"

export default function AdminResourcesPage() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [editItem, setEditItem] = useState<any>(null)
    const [isUploading, setIsUploading] = useState(false)

    const [form, setForm] = useState({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        resource_type: "article", // article, download
        category: "general",
        image_url: "",
        file_url: "",
        is_published: false
    })

    const fileInputRef = useRef<HTMLInputElement>(null)
    const imageInputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    useEffect(() => {
        fetchItems()
    }, [])

    async function fetchItems() {
        setLoading(true)
        const { resources, error } = await getResources({ onlyPublished: false })
        if (error) {
            toast.error(error)
        } else {
            setItems(resources || [])
        }
        setLoading(false)
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
            const filePath = `${type}s/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('knowledge-center')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('knowledge-center')
                .getPublicUrl(filePath)

            if (type === 'image') {
                setForm(prev => ({ ...prev, image_url: publicUrl }))
                toast.success("Image uploaded successfully")
            } else {
                setForm(prev => ({ ...prev, file_url: publicUrl }))
                toast.success("Resource file uploaded successfully")
            }
        } catch (error: any) {
            console.error("Upload error:", error)
            toast.error("Upload failed: " + error.message)
        } finally {
            setIsUploading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const payload = {
            ...form,
            slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        }

        let result
        if (editItem) {
            result = await updateResource(editItem.id, payload)
        } else {
            result = await createResource(payload)
        }

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(editItem ? "Resource updated" : "Resource created")
            resetForm()
            fetchItems()
        }
        setLoading(false)
    }

    function resetForm() {
        setIsAdding(false)
        setEditItem(null)
        setForm({
            title: "",
            slug: "",
            content: "",
            excerpt: "",
            resource_type: "article",
            category: "general",
            image_url: "",
            file_url: "",
            is_published: false
        })
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this resource?")) return
        const result = await deleteResource(id)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Resource deleted")
            fetchItems()
        }
    }

    function startEdit(item: any) {
        setEditItem(item)
        setForm({
            title: item.title,
            slug: item.slug,
            content: item.content || "",
            excerpt: item.excerpt || "",
            resource_type: item.resource_type,
            category: item.category,
            image_url: item.image_url || "",
            file_url: item.file_url || "",
            is_published: item.is_published
        })
        setIsAdding(true)
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Knowledge Center</h1>
                    <p className="text-muted-foreground">Manage articles, research papers, and downloadable resources.</p>
                </div>
                {!isAdding && (
                    <Button className="bg-primary hover:bg-primary/90 gap-2 h-11 px-6 rounded-xl shadow-lg shadow-primary/20" onClick={() => setIsAdding(true)}>
                        <Plus size={20} /> Create Resource
                    </Button>
                )}
            </div>

            {isAdding ? (
                <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="lg:col-span-2 border-none shadow-xl rounded-2xl overflow-hidden">
                        <CardHeader className="bg-secondary text-white p-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-2xl">{editItem ? "Edit Resource" : "Create New Resource"}</CardTitle>
                                    <CardDescription className="text-slate-300">Fill in the details for your article or download.</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={resetForm}>
                                    <X size={20} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-secondary">Resource Title</label>
                                        <Input
                                            required
                                            value={form.title}
                                            onChange={e => setForm({ ...form, title: e.target.value })}
                                            placeholder="e.g. Modern Caregiving Standards 2024"
                                            className="h-12 border-slate-200 focus:ring-primary/20 focus:border-primary rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-secondary">URL Slug (Auto-generated if empty)</label>
                                        <Input
                                            value={form.slug}
                                            onChange={e => setForm({ ...form, slug: e.target.value })}
                                            placeholder="caregiving-standards-2024"
                                            className="h-12 border-slate-200 focus:ring-primary/20 focus:border-primary rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-secondary">Type</label>
                                        <select
                                            className="w-full h-12 rounded-xl border border-slate-200 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                            value={form.resource_type}
                                            onChange={e => setForm({ ...form, resource_type: e.target.value })}
                                        >
                                            <option value="article">Article / Blog Post</option>
                                            <option value="download">Downloadable (PDF/Doc)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-secondary">Category</label>
                                        <select
                                            className="w-full h-12 rounded-xl border border-slate-200 bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:outline-none"
                                            value={form.category}
                                            onChange={e => setForm({ ...form, category: e.target.value })}
                                        >
                                            <option value="research">Research & Papers</option>
                                            <option value="policy">Policy Documents</option>
                                            <option value="guide">Caregiving Guides</option>
                                            <option value="news">Institute News</option>
                                            <option value="general">General</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center space-x-3 pt-8">
                                        <div
                                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${form.is_published ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
                                        >
                                            <div className={`bg-white w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${form.is_published ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </div>
                                        <span className="text-sm font-semibold text-secondary">{form.is_published ? 'Published' : 'Draft'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-secondary">Short Excerpt</label>
                                    <Textarea
                                        value={form.excerpt}
                                        onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                        placeholder="Brief summary for cards and search results..."
                                        className="rounded-xl border-slate-200 focus:ring-primary/20 focus:border-primary min-h-[80px]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-secondary">Main Content</label>
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Supports Markdown</span>
                                    </div>
                                    <Textarea
                                        className="min-h-[350px] rounded-xl border-slate-200 focus:ring-primary/20 focus:border-primary font-mono text-sm p-4"
                                        value={form.content}
                                        onChange={e => setForm({ ...form, content: e.target.value })}
                                        placeholder="Write your article or resource description here..."
                                    />
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="space-y-8">
                        {/* Media Card */}
                        <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                            <CardHeader className="bg-slate-50 border-b p-6">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <ImageIcon className="text-primary h-5 w-5" /> Media & Files
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Featured Image */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Featured Image</label>
                                    {form.image_url ? (
                                        <div className="relative aspect-video rounded-xl overflow-hidden group">
                                            <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setForm(f => ({ ...f, image_url: "" }))}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => imageInputRef.current?.click()}
                                            className="aspect-video rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all"
                                        >
                                            <ImageIcon className="text-slate-300 h-8 w-8" />
                                            <span className="text-xs font-medium text-slate-400">Upload Header Image</span>
                                        </div>
                                    )}
                                    <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'image')} />
                                </div>

                                {/* Link Override */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manual Image URL</label>
                                    <Input
                                        value={form.image_url}
                                        onChange={e => setForm({ ...form, image_url: e.target.value })}
                                        placeholder="https://images.unsplash.com/..."
                                        className="h-10 text-xs rounded-lg"
                                    />
                                </div>

                                <div className="h-px bg-slate-100 my-4" />

                                {/* Downloadable File */}
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Downloadable Resource</label>
                                    {form.file_url ? (
                                        <div className="flex items-center justify-between p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                                            <div className="flex items-center gap-2 text-sm font-medium truncate">
                                                <Check size={16} /> File attached
                                            </div>
                                            <button onClick={() => setForm(f => ({ ...f, file_url: "" }))} className="text-emerald-700 hover:text-red-500">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => fileInputRef.current?.click()}
                                            variant="outline"
                                            className="w-full h-12 rounded-xl border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 gap-2"
                                            disabled={isUploading}
                                        >
                                            {isUploading ? <Loader2 className="animate-spin h-4 w-4" /> : <Download size={18} />}
                                            Upload PDF / Document
                                        </Button>
                                    )}
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={e => handleFileUpload(e, 'file')} />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions Card */}
                        <Card className="border-none shadow-xl rounded-2xl overflow-hidden">
                            <CardContent className="p-6 space-y-4">
                                <Button
                                    onClick={handleSubmit}
                                    className="w-full bg-primary hover:bg-primary/90 h-14 rounded-xl text-lg font-bold gap-3 shadow-lg shadow-primary/20"
                                    disabled={loading || isUploading}
                                >
                                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Save size={22} />}
                                    {editItem ? "Save Changes" : "Create Resource"}
                                </Button>
                                <Button
                                    onClick={resetForm}
                                    variant="ghost"
                                    className="w-full h-12 rounded-xl text-slate-500 font-semibold"
                                >
                                    Cancel
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin h-10 w-10 text-primary" />
                            <p className="text-muted-foreground animate-pulse font-medium">Syncing knowledge center...</p>
                        </div>
                    ) : items.length === 0 ? (
                        <Card className="group border-dashed border-2 bg-slate-50/50 py-24 rounded-[2rem] flex flex-col items-center justify-center text-center">
                            <div className="h-24 w-24 bg-white rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-6">
                                <BookOpen className="h-10 w-10 text-primary/30" />
                            </div>
                            <h2 className="text-2xl font-bold text-secondary mb-2">No Resources Yet</h2>
                            <p className="text-muted-foreground max-w-sm mb-8">Your knowledge center is empty. Start by sharing your first article or research paper.</p>
                            <Button className="bg-primary hover:bg-primary/90 gap-2 h-11 px-8 rounded-xl shadow-lg shadow-primary/20" onClick={() => setIsAdding(true)}>
                                <Plus size={20} /> Create Your First Resource
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {items.map((item) => (
                                <Card key={item.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl bg-white border border-slate-100">
                                    <CardContent className="flex flex-col md:flex-row items-stretch p-0">
                                        {/* Image Preview */}
                                        <div className="w-full md:w-32 lg:w-48 relative bg-slate-100 shrink-0 aspect-[4/3] md:aspect-auto">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <ImageIcon size={32} />
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2">
                                                <Badge className={`uppercase text-[9px] font-black px-2 py-0.5 border-none ${item.is_published ? 'bg-emerald-500' : 'bg-slate-400'}`}>
                                                    {item.is_published ? 'Live' : 'Draft'}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-grow p-6 flex flex-col justify-center min-w-0">
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <span className="text-[10px] uppercase font-bold tracking-widest text-primary/60">
                                                    {item.category.replace(/-/g, ' ')}
                                                </span>
                                                <div className="h-1 w-1 rounded-full bg-slate-300" />
                                                <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                                    {item.resource_type === 'download' ? <Download size={12} className="text-amber-500" /> : <BookOpen size={12} className="text-indigo-500" />}
                                                    {item.resource_type}
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold text-secondary group-hover:text-primary transition-colors leading-snug line-clamp-1">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1 italic">{item.excerpt || "No summary provided."}</p>

                                            <div className="flex items-center gap-4 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                <span>Views: {item.view_count || 0}</span>
                                                {item.resource_type === 'download' && <span>Downloads: {item.download_count || 0}</span>}
                                                <span>Modified: {format(new Date(item.updated_at), 'MMM dd, yyyy')}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex md:flex-col justify-end p-4 md:p-6 gap-2 bg-slate-50/30 border-t md:border-t-0 md:border-l border-slate-100">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-10 w-10 md:h-11 md:w-11 rounded-xl hover:bg-white hover:text-primary hover:shadow-md transition-all"
                                                onClick={() => startEdit(item)}
                                            >
                                                <Edit size={18} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-10 w-10 md:h-11 md:w-11 rounded-xl hover:bg-white hover:text-destructive hover:shadow-md transition-all"
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                            {item.is_published && (
                                                <a
                                                    href={`/resources/${item.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="h-10 w-10 md:h-11 md:w-11 flex items-center justify-center rounded-xl hover:bg-white hover:text-emerald-500 hover:shadow-md transition-all text-slate-400"
                                                >
                                                    <ExternalLink size={18} />
                                                </a>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
