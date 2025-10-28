import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
