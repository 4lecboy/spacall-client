import 'react-native-url-polyfill/auto'
import Constants from 'expo-constants'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
// Local/dev fallback via babel plugin (keeps current behavior)
import { YOUR_SUPABASE_URL_FROM_PHASE_1, YOUR_SUPABASE_ANON_KEY_FROM_PHASE_1 } from '@env'

// Prefer EAS injected vars (expo.extra), fallback to @env for local dev
const envExtra = (Constants.expoConfig?.extra || {}) as Record<string, string | undefined>
const supabaseUrl = envExtra.YOUR_SUPABASE_URL_FROM_PHASE_1 || YOUR_SUPABASE_URL_FROM_PHASE_1
const supabaseAnonKey = envExtra.YOUR_SUPABASE_ANON_KEY_FROM_PHASE_1 || YOUR_SUPABASE_ANON_KEY_FROM_PHASE_1

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // This keeps the user logged in even if they close the app
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})