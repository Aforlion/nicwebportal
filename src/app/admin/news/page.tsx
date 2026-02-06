"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import {
    Plus,
    Newspaper,
    Calendar,
    Trash2,
    Edit,
    Save,
    X,
    Loader2
} from "lucide-react"
import { toast } from "sonner"

export default function AdminNewsPage() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [editItem, setEditItem] = useState<any>(null)
    const [form, setForm] = useState({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        type: "news",
        location: "",
        image_url: ""
    })

    const supabase = createClient()

    useEffect(() => {
        fetchItems()
    }, [])

    async function fetchItems() {
        setLoading(true)
        const { data, error } = await supabase
            .from('news_events')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            toast.error("Failed to load news items")
        } else {
            setItems(data || [])
        }
        setLoading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const payload = {
            ...form,
            slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')
        }

        let error
        if (editItem) {
            const { error: err } = await supabase
                .from('news_events')
                .update(payload)
                .eq('id', editItem.id)
            error = err
        } else {
            const { error: err } = await supabase
                .from('news_events')
                .insert([payload])
            error = err
        }

        if (error) {
            toast.error("Operation failed: " + error.message)
        } else {
            toast.success(editItem ? "Updated successfully" : "Added successfully")
            setIsAdding(false)
            setEditItem(null)
            setForm({ title: "", slug: "", content: "", excerpt: "", type: "news", location: "", image_url: "" })
            fetchItems()
        }
        setLoading(false)
    }

    async function deleteItem(id: string) {
        if (!confirm("Are you sure you want to delete this?")) return

        const { error } = await supabase.from('news_events').delete().eq('id', id)
        if (error) {
            toast.error("Delete failed")
        } else {
            toast.success("Deleted")
            fetchItems()
        }
    }

    function startEdit(item: any) {
        setEditItem(item)
        setForm({
            title: item.title,
            slug: item.slug,
            content: item.content,
            excerpt: item.excerpt || "",
            type: item.type,
            location: item.location || "",
            image_url: item.image_url || ""
        })
        setIsAdding(true)
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-secondary">News & Events Management</h1>
                    <p className="text-muted-foreground">Post updates and announce upcoming events.</p>
                </div>
                {!isAdding && (
                    <Button className="bg-primary gap-2" onClick={() => setIsAdding(true)}>
                        <Plus size={18} /> New Post
                    </Button>
                )}
            </div>

            {isAdding ? (
                <Card className="animate-in fade-in slide-in-from-top-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{editItem ? "Edit Post" : "Create New Post"}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => { setIsAdding(false); setEditItem(null); }}>
                            <X size={18} />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-6">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input
                                        required
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        placeholder="e.g. Annual Convention 2024"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Slug (URL path)</label>
                                    <Input
                                        value={form.slug}
                                        onChange={e => setForm({ ...form, slug: e.target.value })}
                                        placeholder="convention-2024"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Type</label>
                                    <select
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={form.type}
                                        onChange={e => setForm({ ...form, type: e.target.value })}
                                    >
                                        <option value="news">News / Press Release</option>
                                        <option value="event">Upcoming Event</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Location (Events only)</label>
                                    <Input
                                        value={form.location}
                                        onChange={e => setForm({ ...form, location: e.target.value })}
                                        placeholder="Abuja, Nigeria"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Image URL (Unsplash or Supabase storage)</label>
                                <Input
                                    value={form.image_url}
                                    onChange={e => setForm({ ...form, image_url: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Excerpt (Short Summary)</label>
                                <Textarea
                                    value={form.excerpt}
                                    onChange={e => setForm({ ...form, excerpt: e.target.value })}
                                    placeholder="Brief summary for the listing page..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content (Full article)</label>
                                <Textarea
                                    required
                                    className="min-h-[200px]"
                                    value={form.content}
                                    onChange={e => setForm({ ...form, content: e.target.value })}
                                    placeholder="Write your article here..."
                                />
                            </div>

                            <div className="flex gap-4 justify-end">
                                <Button type="button" variant="outline" onClick={() => { setIsAdding(false); setEditItem(null); }}>Cancel</Button>
                                <Button type="submit" className="bg-primary gap-2" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={18} />}
                                    {editItem ? "Update Changes" : "Publish Post"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed rounded-xl">
                            <Newspaper className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                            <p className="text-muted-foreground">No news items found. Create your first post!</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <Card key={item.id} className="group transition-all hover:border-primary/50">
                                <CardContent className="flex items-center gap-6 p-6">
                                    <div className={`p-4 rounded-xl ${item.type === 'event' ? 'bg-amber-50 text-amber-600' : 'bg-primary/5 text-primary'}`}>
                                        {item.type === 'event' ? <Calendar /> : <Newspaper />}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
                                                {format(new Date(item.published_at), 'MMM dd, yyyy')}
                                            </span>
                                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${item.type === 'event' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {item.type}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-secondary group-hover:text-primary transition-colors">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{item.excerpt || item.content}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => startEdit(item)}><Edit size={16} /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteItem(item.id)}><Trash2 size={16} /></Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
