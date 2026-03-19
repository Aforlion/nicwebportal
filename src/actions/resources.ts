'use server'

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getResources(options?: {
    category?: string;
    type?: string;
    limit?: number;
    onlyPublished?: boolean;
}) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    let query = supabase
        .from('resources')
        .select(`
            *,
            author:profiles(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })

    if (options?.onlyPublished !== false) {
        query = query.eq('is_published', true)
    }

    if (options?.category && options.category !== 'all') {
        query = query.eq('category', options.category)
    }

    if (options?.type && options.type !== 'all') {
        query = query.eq('resource_type', options.type)
    }

    if (options?.limit) {
        query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching resources:', error)
        return { error: 'Failed to fetch resources' }
    }

    return { resources: data }
}

export async function getResourceBySlug(slug: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data, error } = await supabase
        .from('resources')
        .select(`
            *,
            author:profiles(full_name, avatar_url)
        `)
        .eq('slug', slug)
        .single()

    if (error) {
        console.error('Error fetching resource by slug:', error)
        return { error: 'Resource not found' }
    }

    // Increment view count (fire and forget)
    supabase.rpc('increment_resource_views', { resource_id: data.id }).then(() => { })

    return { resource: data }
}

export async function createResource(formData: any) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Check if user is admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') return { error: 'Forbidden' }

    const { data, error } = await supabase
        .from('resources')
        .insert({
            ...formData,
            author_id: user.id,
            updated_at: new Date().toISOString()
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating resource:', error)
        return { error: 'Failed to create resource' }
    }

    revalidatePath('/resources')
    revalidatePath('/admin/resources')
    return { success: true, resource: data }
}

export async function updateResource(id: string, formData: any) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('resources')
        .update({
            ...formData,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating resource:', error)
        return { error: 'Failed to update resource' }
    }

    revalidatePath('/resources')
    revalidatePath('/admin/resources')
    return { success: true }
}

export async function deleteResource(id: string) {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting resource:', error)
        return { error: 'Failed to delete resource' }
    }

    revalidatePath('/resources')
    revalidatePath('/admin/resources')
    return { success: true }
}
