import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let supabaseServerInstance: SupabaseClient | null = null

export function getSupabaseServer(): SupabaseClient {
  if (!supabaseServerInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase server environment variables are not configured")
    }

    supabaseServerInstance = createClient(supabaseUrl, supabaseServiceKey)
  }
  return supabaseServerInstance
}
