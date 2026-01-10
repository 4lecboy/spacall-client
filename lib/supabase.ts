import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { YOUR_SUPABASE_URL_FROM_PHASE_1, YOUR_SUPABASE_ANON_KEY_FROM_PHASE_1 } from '@env'

// ⚠️ FAST FIX: Paste the keys directly here as strings.
// (Do not use process.env for this prototype phase)

const supabaseUrl = YOUR_SUPABASE_URL_FROM_PHASE_1
const supabaseAnonKey = YOUR_SUPABASE_ANON_KEY_FROM_PHASE_1

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // This keeps the user logged in even if they close the app
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})