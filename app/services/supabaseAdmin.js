import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import ENV from '../config/env';

// Get Supabase credentials from environment config
const supabaseUrl = ENV.SUPABASE_URL;
const supabaseServiceKey = ENV.SUPABASE_ANON_KEY;

// Validate Supabase credentials
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or service key is missing. Please check your environment configuration.');
}

// Create a Supabase client with the service role key to bypass RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
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

// Create user profile (bypassing RLS)
export async function createUserProfile(userId, profileData) {
  console.log('Creating user profile for ID:', userId, 'with data:', profileData);
  
  return supabaseAdmin
    .from('user_profiles')
    .insert({
      user_id: userId,
      ...profileData,
      created_at: new Date(),
      updated_at: new Date()
    })
    .select();
}

// Update user group (bypassing RLS)
export async function updateUserGroup(userId, userGroup) {
  try {
    console.log('Updating user group with admin rights for user:', userId);
    
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ 
        user_group: userGroup,
        updated_at: new Date()
      })
      .eq('user_id', userId)
      .select();
    
    if (error) throw error;
    
    console.log('User group updated successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user group:', error.message);
    return { data: null, error };
  }
}

// Update curriculum (bypassing RLS)
export async function updateCurriculum(userId, curriculum) {
  console.log('Updating curriculum for user ID:', userId, 'to:', curriculum);
  
  return supabaseAdmin
    .from('user_profiles')
    .update({ 
      curriculum: curriculum,
      updated_at: new Date()
    })
    .eq('user_id', userId)
    .select();
}

// Get user profile (bypassing RLS)
export async function getUserProfile(userId) {
  console.log('Getting user profile for ID:', userId);
  
  return supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
}

// Soft delete a user profile (bypassing RLS)
export async function softDeleteUserProfile(userId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ deleted_at: new Date() })
      .eq('user_id', userId)
      .select();
    
    if (error) throw error;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error soft deleting user profile:', error.message);
    return { data: null, error };
  }
}

/**
 * Update a user profile using admin privileges
 * @param {string} userId - The user's auth ID
 * @param {object} updateData - Data to update
 * @returns {Promise} - Supabase query result
 */
export async function updateUserProfile(userId, updateData) {
  console.log('Updating user profile for ID:', userId, 'with data:', updateData);
  
  return supabaseAdmin
    .from('user_profiles')
    .update({
      ...updateData,
      updated_at: new Date()
    })
    .eq('user_id', userId)
    .select();
} 