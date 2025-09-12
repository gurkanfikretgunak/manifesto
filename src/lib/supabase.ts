import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Check if we're in development mode and Supabase is not configured
const isSupabaseConfigured = supabaseUrl !== 'https://placeholder.supabase.co' && 
                           supabaseAnonKey !== 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test Supabase connection
export const testSupabaseConnection = async (): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    return false;
  }
  
  try {
    // Test basic connection by trying to fetch from a table
    const { error } = await supabase.from('profiles').select('count').limit(1);
    return !error;
  } catch (err) {
    console.log('Supabase connection test failed:', err);
    return false;
  }
};

// Export a flag to check if Supabase is properly configured
export const isSupabaseReady = isSupabaseConfigured

// Types for our database
export interface Profile {
  id: string
  github_username: string
  full_name: string
  avatar_url: string
  created_at: string
  updated_at: string
}

export interface Signature {
  id: string
  user_id: string
  message?: string
  location?: string
  privacy_consent: boolean
  signed_at: string
  created_at: string
  profiles: Profile
}
