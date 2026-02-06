"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Textarea from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import {
    Plus,
    FileText,
    Trash2,
    Edit,
    Save,
    X,
    Loader2,
    BookOpen,
    Download
} from "lucide-react"
import { toast } from "sonner"

export default function AdminPublicationsPage() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [editItem, setEditItem] = useState<any>(null)
    const [form, setForm] = useState({
        title: "",
        author: "",
        abstract: "",
        file_url: "",
        category: "research"
    })

    const supabase = createClient()

    useEffect(() => {
        fetchItems()
    }, [])

    async function fetchItems() {
        setLoading(true)
        const { data, error } = await supabase
            .from('publications')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            toast.error("Failed to load publications")
        } else {
            setItems(data || [])
        }
        setLoading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        let error
        if (editItem) {
            const { error: err } = await supabase
                .from('publications')
                .update(form)
                .eq('id', editItem.id)
            error = err
        } else {
            const { error: err } = await supabase
                .from('publications')
                .insert([form])
            error = err
        }

        if (error) {
            toast.error("Operation failed: " + error.message)
        } else {
            toast.success(editItem ? "Updated successfully" : "Added successfully")
            setIsAdding(false)
            setEditItem(null)
            setForm({ title: "", author: "", abstract: "", file_url: "", category: "research" })
            fetchItems()
        }
        setLoading(false)
    }

    async function deleteItem(id: string) {
        if (!confirm("Are you sure?")) return
        const { error } = await supabase.from('publications').delete().eq('id', id)
        if (error) toast.error("Delete failed")
        else fetchItems()
    }

    function startEdit(item: any) {
        setEditItem(item)
        setForm({
            title: item.title,
            author: item.author || "",
            abstract: item.abstract || "",
            file_url: item.file_url || "",
            category: item.category
        })
        setIsAdding(true)
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">Publications & Research</h1>
                    <p className="text-muted-foreground">Manage policy briefs and research papers.</p>
                </div>
                {!isAdding && (
                    <Button className="bg-primary gap-2" onClick={() => setIsAdding(true)}>
                        <Plus size={18} /> New Publication
                    </Button>
                )}
            </div>

            {isAdding ? (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{editItem ? "Edit Publication" : "Add Publication"}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditItem(null); }}><X size={18} /></Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Author / Dept</label>
                                    <Input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                        <option value="research">Research Paper</option>
                                        <option value="policy">Policy Brief</option>
                                        <option value="standard">Operating Standard</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">PDF File URL</label>
                                    <Input value={form.file_url} onChange={e => setForm({ ...form, file_url: e.target.value })} placeholder="https://..." />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Abstract / Description</label>
                                <Textarea className="min-h-[120px]" value={form.abstract} onChange={e => setForm({ ...form, abstract: e.target.value })} />
                            </div>
                            <div className="flex gap-4 justify-end">
                                <Button type="button" variant="outline" onClick={() => { setIsAdding(false); setEditItem(null); }}>Cancel</Button>
                                <Button type="submit" className="bg-primary" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
                                    Save Publication
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {items.map((item) => (
                        <Card key={item.id} className="hover:border-primary/50 transition-colors">
                            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-6">
                                <div className="p-3 sm:p-4 rounded-xl bg-primary/5 text-primary shrink-0">
                                    <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">{format(new Date(item.published_at), 'MMM yyyy')}</span>
                                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-blue-100 text-blue-700 whitespace-nowrap">{item.category}</span>
                                    </div>
                                    <h3 className="text-base sm:text-lg font-bold text-secondary truncate">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{item.abstract}</p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => startEdit(item)}><Edit size={16} /></Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 sm:h-9 sm:w-9 text-destructive" onClick={() => deleteItem(item.id)}><Trash2 size={16} /></Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
