"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getNewsEvents() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data, error } = await supabase
        .from('news_events')
        .select('*')
        .order('published_at', { ascending: false })

    if (error) {
        console.error("Error fetching news:", error)
        return []
    }

    return data
}

export async function getNewsBySlug(slug: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data, error } = await supabase
        .from('news_events')
        .select('*')
        .eq('slug', slug)
        .single()

    if (error) {
        console.error("Error fetching news item:", error)
        return null
    }

    return data
}

export async function getPublications() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data, error } = await supabase
        .from('publications')
        .select('*')
        .order('published_at', { ascending: false })

    if (error) {
        console.error("Error fetching publications:", error)
        return []
    }

    return data
}
