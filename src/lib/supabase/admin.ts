import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

/**
 * Service-role Supabase client — bypasses RLS and can use the Auth admin API.
 * SERVER-ONLY. Never import this into client code; the `server-only` import
 * above makes such an import a build error.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  )
}
