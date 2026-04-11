import { createClient } from '@supabase/supabase-js'
import { env } from '@/env'

/**
 * A Supabase client with Service Role privileges.
 * WARNING: ONLY use this in Server Actions or API routes. 
 * NEVER expose this to the client side.
 * 
 * Used for aggregate progress updates and core system tasks that 
 * bypass standard RLS (e.g., updating enrollments table).
 */
export const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
