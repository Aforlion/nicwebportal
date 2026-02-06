"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Image as ImageIcon, Trash2, Save, X, Loader2, Film } from "lucide-react"
import { toast } from "sonner"

export default function AdminGalleryPage() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [form, setForm] = useState({
        title: "",
        image_url: "",
        category: "General",
        type: "image"
    })

    const supabase = createClient()

    useEffect(() => {
        fetchItems()
    }, [])

    async function fetchItems() {
        setLoading(true)
        const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false })
        if (!error) setItems(data || [])
        setLoading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        const { error } = await supabase.from('gallery').insert([form])
        if (error) toast.error("Failed to add image")
        else {
            toast.success("Added to gallery")
            setIsAdding(false)
            setForm({ title: "", image_url: "", category: "General", type: "image" })
            fetchItems()
        }
        setLoading(false)
    }

    async function deleteItem(id: string) {
        const { error } = await supabase.from('gallery').delete().eq('id', id)
        if (!error) fetchItems()
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-secondary">Media Gallery Management</h1>
                {!isAdding && <Button onClick={() => setIsAdding(true)} className="gap-2"><Plus size={18} /> Add Media</Button>}
            </div>

            {isAdding && (
                <Card>
                    <CardHeader><CardTitle>Add New Media</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid gap-4">
                            <Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                            <Input placeholder="Image/Thumbnail URL" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} required />
                            <div className="grid grid-cols-2 gap-4">
                                <Input placeholder="Category (e.g. Training)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
                                <select className="rounded-md border p-2" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                                <Button type="submit" disabled={loading}>Save Media</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {items.map(item => (
                    <Card key={item.id} className="overflow-hidden group">
                        <div className="aspect-video relative">
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button variant="destructive" size="icon" onClick={() => deleteItem(item.id)}><Trash2 size={16} /></Button>
                            </div>
                        </div>
                        <div className="p-3">
                            <p className="text-xs font-bold text-primary mb-1 uppercase">{item.category}</p>
                            <h4 className="font-bold text-sm truncate">{item.title}</h4>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
