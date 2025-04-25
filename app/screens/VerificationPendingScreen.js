import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Button from '../components/Button';
import { useAuth } from '../navigation/AuthContext';
import { supabase } from '../services/supabase';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

export default function VerificationPendingScreen({ route, navigation }) {
  const { resendVerificationEmail, user } = useAuth();
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [counter, setCounter] = useState(0);
  
  useEffect(() => {
    // Get email from route params or current user
    if (route.params?.email) {
      setEmail(route.params.email);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [route.params, user]);

  const handleResendEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'No email address available.');
      return;
    }

    try {
      setResendLoading(true);
      const { success, error } = await resendVerificationEmail(email);
      
      if (error) throw error;
      
      if (success) {
        Alert.alert('Success', 'Verification email has been resent. Please check your inbox.');
        setCounter(counter + 1);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to resend verification email');
    } finally {
      setResendLoading(false);
    }
  };

  const checkVerificationStatus = async () => {
    if (!email) {
      Alert.alert('Error', 'Email address not available');
      return;
    }

    try {
      setCheckingStatus(true);
      // Try to sign in with a temporary session to check verification status
      // We won't actually complete the sign-in, just check the response
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        // Check if the error indicates email is verified
        if (error.message.includes('Email not confirmed')) {
          Alert.alert('Not Verified', 'Your email is still not verified. Please check your inbox and click the verification link.');
        } else {
          // Email might be verified
          Alert.alert('Success', 'Your email appears to be verified.');
        }
      } else {
        // If OTP was sent without error, email exists and might be verified
        Alert.alert('Success', 'Your email appears to be verified.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCheckingStatus(false);
    }
  };

  const continueToOnboarding = () => {
    // Continue with onboarding regardless of verification status
    navigation.navigate('UserGroup');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>✉️</Text>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.description}>
          We've sent a verification email to:
        </Text>
        <Text style={styles.email}>{email}</Text>
        <Text style={styles.instructions}>
          Please check your inbox and click the verification link to activate your account.
          If you don't see the email, check your spam folder.
        </Text>
        
        <Button
          title={resendLoading ? "Sending..." : "Resend verification email"}
          onPress={handleResendEmail}
          loading={resendLoading}
          variant="outline"
          fullWidth
          style={styles.resendButton}
          disabled={resendLoading}
        />
        
        <Button
          title={checkingStatus ? "Checking..." : "I've verified my email"}
          onPress={checkVerificationStatus}
          loading={checkingStatus}
          variant="primary"
          fullWidth
          style={styles.verifiedButton}
          disabled={checkingStatus}
        />
        
        <Button
          title="Continue to setup"
          onPress={continueToOnboarding}
          variant="primary"
          fullWidth
          style={styles.continueButton}
        />

        <Text style={styles.noteText}>
          You can verify your email later, but some features may be limited until verification.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.lightText,
    marginBottom: 8,
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  instructions: {
    fontSize: 14,
    color: COLORS.lightText,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  resendButton: {
    marginBottom: 16,
    borderColor: COLORS.primary,
  },
  verifiedButton: {
    marginBottom: 16,
    backgroundColor: COLORS.primary,
  },
  continueButton: {
    marginBottom: 16,
    backgroundColor: COLORS.secondary,
  },
  noteText: {
    fontSize: 12,
    color: COLORS.lightText,
    textAlign: 'center',
    marginTop: 8,
  },
}); 