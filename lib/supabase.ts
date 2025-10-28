import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Create Supabase client only if credentials are available
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

// Types for database tables
export interface CustomLocation {
  id: string
  name: string
  image: string
  city: string
  user_id?: string
  created_at: string
}

export interface CustomOutfit {
  id: string
  name: string
  image: string
  category: string
  user_id?: string
  created_at: string
}
