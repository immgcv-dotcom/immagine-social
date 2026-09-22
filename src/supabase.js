import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vmitpfyqnlsrrrbvgjeo.supabase.co'
const supabasePublishableKey = 'sb_publishable_yIRdwYwvuAWa9xqkm8ISlg_C_lXYBG3'

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export const STORAGE_BUCKET = 'immagine-assets'
