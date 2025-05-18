import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({
  user: null,
  session: null,
  userProfile: null,
  userRoles: [],
  userCurriculums: [],
  loading: true,
  isVerified: false,
  pendingVerification: false,
  resendVerificationEmail: () => {},
  refreshProfile: () => {},
  hasRole: () => false,
  getPrimaryCurriculum: () => null,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [userCurriculums, setUserCurriculums] = useState([]);
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
      
      // Fetch basic profile
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
      
      // Fetch user roles (with role details)
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select(`
          id,
          role:role_id(id, name, description)
        `)
        .eq('user_id', userId);
        
      if (!roleError && roleData) {
        // Extract role information
        const roles = roleData.map(item => item.role);
        console.log('User roles fetched:', roles);
        setUserRoles(roles);
      } else {
        console.error('Error fetching user roles:', roleError?.message);
        setUserRoles([]);
      }
      
      // Fetch user curriculums (with curriculum details)
      const { data: curriculumData, error: curriculumError } = await supabase
        .from('user_curriculums')
        .select(`
          id,
          is_primary,
          curriculum:curriculum_id(id, name, description)
        `)
        .eq('user_id', userId);
        
      if (!curriculumError && curriculumData) {
        // Extract curriculum information
        const curriculums = curriculumData.map(item => ({
          ...item.curriculum,
          is_primary: item.is_primary
        }));
        console.log('User curriculums fetched:', curriculums);
        setUserCurriculums(curriculums);
      } else {
        console.error('Error fetching user curriculums:', curriculumError?.message);
        setUserCurriculums([]);
      }
      
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
        // Simply call our full profile fetch function
        await fetchUserProfile(user.id);
        return { success: true };
      } catch (error) {
        console.error('Error in refreshProfile:', error.message);
        return { success: false };
      } finally {
        localLoading = false;
      }
    }
    return { success: false };
  };
  
  // Helper function to check if user has a specific role
  const hasRole = (roleName) => {
    if (!userRoles || userRoles.length === 0) return false;
    return userRoles.some(role => role.name === roleName);
  };
  
  // Helper function to get primary curriculum or first available
  const getPrimaryCurriculum = () => {
    if (!userCurriculums || userCurriculums.length === 0) return null;
    
    // First try to find the primary curriculum
    const primary = userCurriculums.find(curr => curr.is_primary);
    if (primary) return primary;
    
    // If no primary is set, return the first one
    return userCurriculums[0];
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
    userRoles,
    userCurriculums,
    loading,
    isVerified,
    pendingVerification,
    resendVerificationEmail,
    refreshProfile,
    hasRole,
    getPrimaryCurriculum,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
} 