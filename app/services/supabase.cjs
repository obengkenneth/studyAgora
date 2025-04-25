const { createClient } = require('@supabase/supabase-js');
require('react-native-url-polyfill/auto');
const WebBrowser = require('expo-web-browser');
const AuthSession = require('expo-auth-session');
const Constants = require('expo-constants');
const ENV = require('../config/env');

// Get Supabase credentials from our environment config
const supabaseUrl = ENV.SUPABASE_URL;
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY;

// Validate Supabase credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or anon key is missing. Please check your environment configuration.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

// Sign in with email and password
async function signInWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing in:', error.message);
    return { data: null, error };
  }
}

// Sign up with email and password
async function signUpWithEmail(email, password, fullName = '') {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing up:', error.message);
    return { data: null, error };
  }
}

// Sign in with Google
async function signInWithGoogle() {
  try {
    // Get the redirect URL
    const redirectUrl = AuthSession.makeRedirectUri({ 
      path: 'auth/callback',
    });
    
    console.log("Redirect URL:", redirectUrl);
    
    // Create sign in URL
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });
    
    if (error) throw error;
    
    // Open the browser for authentication
    const result = await WebBrowser.openAuthSessionAsync(
      data && data.url ? data.url : '',
      redirectUrl
    );
    
    if (result && result.type === 'success') {
      // Extract auth code from URL
      const url = result.url;
      const params = new URL(url).searchParams;
      const code = params.get('code');
      
      if (code) {
        // Exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) throw error;
        return { data, error: null };
      }
    }
    
    return { data: null, error: new Error('Google sign in was cancelled or failed') };
  } catch (error) {
    console.error('Error signing in with Google:', error.message);
    return { data: null, error };
  }
}

// Sign out user
async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error.message);
    return { error };
  }
}

// Example function to check if Supabase connection is working
async function testSupabaseConnection() {
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

module.exports = {
  supabase,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut,
  testSupabaseConnection
}; 