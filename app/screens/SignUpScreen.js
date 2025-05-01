import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image, ImageBackground } from 'react-native';
import { signUpWithEmail, signInWithGoogle, supabase } from '../services/supabase';
import Button from '../components/Button';
import Input from '../components/Input';
import { validateEmail, validatePassword } from '../utils/validation';
import { useAuth } from '../navigation/AuthContext';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

export default function SignUpScreen({ navigation }) {
  const { user, refreshProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // For debugging - monitor auth state
  useEffect(() => {
    console.log('Current auth user in SignUpScreen:', user);
  }, [user]);

  function validateForm() {
    const newErrors = {};
    
    if (!fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSignUp() {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      console.log('Starting signup process...');
      
      // Sign up with Supabase
      const { data, error } = await signUpWithEmail(email, password, fullName);
      console.log('Signup response:', data ? 'Success' : 'Failed', error ? `Error: ${error.message}` : 'No error');

      if (error) throw error;
      
      // Direct user to onboarding regardless of email verification status
      if (data.user) {
        console.log('User signed up with ID:', data.user.id);
        
        try {
          console.log('Creating user profile...');
          // Create user profile if it doesn't exist
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
              user_id: data.user.id,
              full_name: fullName,
              created_at: new Date(),
              updated_at: new Date()
            });
            
          if (profileError) {
            console.error('Error creating profile:', profileError);
          } else {
            console.log('Profile created successfully:', profileData);
          }
          
          // Force refresh to ensure profile data is loaded
          await refreshProfile();
          
        } catch (profileError) {
          console.error('Profile creation exception:', profileError);
        }
        
        try {
          console.log('Attempting manual sign-in...');
          // Perform manual sign-in
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          });
          
          if (signInError) {
            console.error('Error signing in after signup:', signInError);
          } else {
            console.log('Manual sign-in successful:', signInData ? 'Session created' : 'No session');
            // Force a profile refresh after successful sign-in
            setTimeout(() => {
              console.log('Forcing profile refresh after sign-in');
              refreshProfile();
            }, 1000);
          }
        } catch (signInError) {
          console.error('Sign-in exception:', signInError);
        }
        
        // Show a non-blocking notification about verification
        console.log('Showing account created alert...');
        Alert.alert(
          'Account Created',
          'Your account has been created successfully! We\'ve sent a verification email to your inbox.',
          [{ 
            text: 'Continue', 
            style: 'default',
            onPress: () => {
              console.log('Continue button pressed, navigating to UserGroup...');
              // Force navigation regardless of auth state
              navigation.reset({
                index: 0,
                routes: [{ name: 'UserGroup', params: { userId: data.user.id } }],
              });
            }
          }]
        );
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleGoogleSignUp() {
    try {
      setGoogleLoading(true);
      const { error } = await signInWithGoogle();
      
      if (error) throw error;
      // Force profile refresh after successful Google sign-in
      setTimeout(() => {
        console.log('Forcing profile refresh after Google sign-in');
        refreshProfile();
      }, 1000);
      // Auth state listener will handle navigation on success
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <ImageBackground 
      source={require('../../assets/login.png')} 
      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Create Account</Text>
          
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (errors.fullName) {
                setErrors({ ...errors, fullName: undefined });
              }
            }}
            placeholder="Enter your full name"
            error={errors.fullName}
            labelStyle={{ color: '#FFFFFF' }}
          />
          
          <Input
            label="Email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors({ ...errors, email: undefined });
              }
            }}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            labelStyle={{ color: '#FFFFFF' }}
          />
          
          <Input
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors({ ...errors, password: undefined });
              }
            }}
            placeholder="Create a password"
            secureTextEntry
            error={errors.password}
            labelStyle={{ color: '#FFFFFF' }}
          />
          
          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: undefined });
              }
            }}
            placeholder="Confirm your password"
            secureTextEntry
            error={errors.confirmPassword}
            labelStyle={{ color: '#FFFFFF' }}
          />
          
          <Button
            title="Sign Up"
            onPress={handleSignUp}
            loading={loading}
            variant="primary"
            fullWidth
            style={styles.button}
          />
          
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>
          
          <Button
            title="Sign up with Google"
            onPress={handleGoogleSignUp}
            loading={googleLoading}
            variant="outline"
            fullWidth
            style={styles.googleButton}
            icon={() => (
              <Image 
                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }} 
                style={styles.googleIcon} 
              />
            )}
          />
          
          <TouchableOpacity 
            style={styles.signInLink}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.signInText}>
              Already have an account? Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#FFFFFF',
  },
  button: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    marginHorizontal: 8,
    color: '#FFFFFF',
    fontSize: 12,
  },
  googleButton: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'transparent',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  signInLink: {
    marginTop: 16,
  },
  signInText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
}); 