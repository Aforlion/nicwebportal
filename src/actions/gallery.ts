"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function getGalleryItems() {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching gallery:", error)
        return []
    }

    return data
}
