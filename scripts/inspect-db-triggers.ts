import { createClient } from "@supabase/supabase-js"
import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") })
dotenv.config({ path: path.resolve(process.cwd(), ".env") })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const adminClient = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
    console.log("Fetching triggers on profiles table...")
    // We can query pg_trigger through a rpc or check if we can query it directly (sometimes service_role cannot select from pg_catalog directly depending on config, but let's try)
    const { data: triggers, error } = await adminClient.rpc('exec_sql', {
        sql_query: "SELECT tgname FROM pg_trigger WHERE tgrelid = 'profiles'::regclass;"
    })

    if (error) {
        console.error("Error querying triggers:", error)
        
        // Let's try executing standard queries through a fallback if exec_sql doesn't exist
        console.log("Trying select from pg_trigger...")
        // Wait, pg_trigger is not exposed via PostgREST unless there is a view or RPC.
    } else {
        console.log("Triggers:", triggers)
    }
}

run().catch(console.error)
