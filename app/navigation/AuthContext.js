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
  
  const fetchUserProfile = async (userId) => {
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
      
      setUserProfile(data || null);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error.message);
    } finally {
      setLoading(false);
    }
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
} 