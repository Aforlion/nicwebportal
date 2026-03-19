import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
    // Only allow in development or if a specific secret is provided
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    async function createTestUser(email, password, category, fullName) {
        console.log(`Creating user: ${email}...`)

        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, role: 'member' }
        })

        if (authError) {
            if (authError.message.includes('already registered')) {
                // Get user ID
                const { data: { users } } = await supabase.auth.admin.listUsers()
                const existingUser = users.find(u => u.email === email)
                if (existingUser) {
                    return await updateAssociatedRecords(existingUser.id, email, category, fullName)
                }
            }
            return { email, success: false, error: authError.message }
        }

        return await updateAssociatedRecords(authData.user.id, email, category, fullName)
    }

    async function updateAssociatedRecords(userId, email, category, fullName) {
        // 2. Upsert Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: userId,
                full_name: fullName,
                email: email,
                role: 'member',
                updated_at: new Date().toISOString()
            })

        if (profileError) console.error(profileError)

        // 3. Upsert Membership
        const nicId = `NIC-${category.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
        const { error: membershipError } = await supabase
            .from('memberships')
            .upsert({
                user_id: userId,
                nic_id: nicId,
                category: category,
                status: 'active',
                is_active: true,
                expiry_date: new Date(new Date().getFullYear() + 1, 11, 31).toISOString(),
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

        if (membershipError) console.error(membershipError)

        return { email, success: true }
    }

    const results = [
        await createTestUser('pro@test.com', 'Password123', 'full', 'Test Professional Member'),
        await createTestUser('associate@test.com', 'Password123', 'associate', 'Test Associate Member')
    ]

    return NextResponse.json({ results })
}
