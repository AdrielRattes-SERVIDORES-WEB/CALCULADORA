import { createBrowserClient } from "@supabase/ssr"

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
      console.error("Supabase credentials missing. Check .env.local")
      throw new Error("Configuração do Supabase ausente")
    }

    supabaseClient = createBrowserClient(url, key)
  }
  return supabaseClient
}

export const supabase = {
  get client() {
    return getSupabaseClient()
  },
}
