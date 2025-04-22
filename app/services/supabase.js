import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import ENV from '../config/env';

// Get Supabase credentials from our environment config
const supabaseUrl = ENV.SUPABASE_URL;
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY;

// Validate Supabase credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or anon key is missing. Please check your environment configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
});

// Example function to check if Supabase connection is working
export async function testSupabaseConnection() {
  try {
    // First, check if we can connect to Supabase
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Supabase auth connection error:', authError.message);
      return false;
    }
    
    console.log('Supabase auth connection successful');
    
    // Then try to access the user_profiles table
    const { data, error } = await supabase.from('user_profiles').select('*').limit(1);
    
    if (error) {
      console.error('Table access error:', error.message);
      if (error.message.includes('Network request failed')) {
        console.log('Network error - please check your internet connection and Supabase URL');
      } else if (error.message.includes('does not exist')) {
        console.log('Tables not created yet - please run the SQL setup script');
      }
      return false;
    }
    
    console.log('Supabase tables connection successful:', data);
    return true;
  } catch (error) {
    console.error('Supabase connection failed:', error.message);
    return false;
  }
} 