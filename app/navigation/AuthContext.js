import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({
  user: null,
  session: null,
  userProfile: null,
  loading: true,
  isVerified: false,
  pendingVerification: false,
  resendVerificationEmail: () => {},
  refreshProfile: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  useEffect(() => {
    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Allow users to proceed whether verified or not
        setIsVerified(true);
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Allow users to proceed whether verified or not
          setIsVerified(true);
          await fetchUserProfile(session.user.id);
          
          // If we just created a user, force a profile refresh to get the user_group
          if (event === 'SIGNED_UP' || event === 'SIGNED_IN') {
            // Multiple refresh attempts to ensure profile is loaded
            setTimeout(async () => {
              console.log('First profile refresh after sign-up/sign-in');
              await fetchUserProfile(session.user.id, true);
              
              // Try again after a longer delay
              setTimeout(async () => {
                console.log('Second profile refresh attempt');
                await fetchUserProfile(session.user.id, true);
              }, 2000);
            }, 1000);
          }
        } else {
          setUserProfile(null);
          setLoading(false);
          
          // We're no longer setting pendingVerification to true since we won't block
          // users from continuing, but we'll keep this flag for showing verification notices
          if (event === 'SIGNED_UP' && !session?.user?.email_confirmed_at) {
            setPendingVerification(true);
          } else {
            setPendingVerification(false);
          }
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);
  
  const fetchUserProfile = async (userId, forceRefresh = false) => {
    try {
      console.log('Fetching user profile in AuthContext for ID:', userId);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error fetching user profile:', error.message);
        }
      } else {
        console.log('User profile fetched in AuthContext:', data);
      }
      
      // Store profile data in state
      setUserProfile(data || null);
      
      // If forcing refresh and no profile yet, try again after a short delay
      if (forceRefresh && !data) {
        console.log('No profile found, will retry after delay');
        setTimeout(() => fetchUserProfile(userId), 2000);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      // Use a local variable for tracking refresh state
      // instead of modifying the global loading state
      // This prevents navigation changes during refresh
      let localLoading = true;
      
      try {
        console.log('refreshProfile: starting for user ID', user.id);
        
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') {
            console.error('Error fetching user profile:', error.message);
          }
        } else {
          console.log('refreshProfile: profile data retrieved', data);
          // Update profile state only if different
          if (JSON.stringify(data) !== JSON.stringify(userProfile)) {
            setUserProfile(data || null);
          }
        }
        
        // If no data was found and we're forcing a refresh, try again after a short delay
        if (!data) {
          console.log('refreshProfile: No profile found, will retry after delay');
          setTimeout(() => fetchUserProfile(user.id), 2000);
    }
      } catch (error) {
        console.error('Error in refreshProfile:', error.message);
      } finally {
        localLoading = false;
      }
      
      return { success: true };
    }
    return { success: false };
  };

  const resendVerificationEmail = async (email) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      return { success: true, error: null };
    } catch (error) {
      console.error('Error resending verification email:', error.message);
      return { success: false, error };
    }
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    isVerified,
    pendingVerification,
    resendVerificationEmail,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
} 