import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
dotenv.config({ path: path.resolve(process.cwd(), ".env") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase configuration env variables.")
    process.exit(1)
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function run() {
    console.log("Starting Training Partner migration...")

    const partners = [
        {
            regNum: "NIC/FAC/2026/9GUKF",
            name: "MEDICARE LIMITED",
            code: "NIC-MED-2026",
            level: 2, // Accredited Partner
            status: "active"
        },
        {
            regNum: "NIC/FAC/2026/JB4LC",
            name: "CARING HEARTS GLOBAL LIMITED",
            code: "NIC-CAR-2026",
            level: 1, // Registered Partner
            status: "active"
        },
        {
            regNum: "NIC/FAC/2026/QD4LP",
            name: "Visting angels Nigeria LTD",
            code: "NIC-VIS-2026",
            level: 3, // Centre of Excellence
            status: "active"
        }
    ]

    for (const partner of partners) {
        console.log(`Migrating ${partner.name}...`)
        const { data, error } = await adminClient
            .from("facilities")
            .update({
                institution_code: partner.code,
                accreditation_level: partner.level,
                status: partner.status,
                curriculum_status: "approved",
                accreditation_expires_at: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString()
            })
            .eq("registration_number", partner.regNum)
            .select()

        if (error) {
            console.error(`Error migrating ${partner.name}:`, error.message)
        } else {
            console.log(`Successfully migrated ${partner.name}. Records updated:`, data?.length)
        }
    }

    console.log("Migration complete!")
}

run().catch(console.error)
