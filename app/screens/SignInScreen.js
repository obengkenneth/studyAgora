import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image, ImageBackground } from 'react-native';
import { signInWithEmail, signInWithGoogle, supabase } from '../services/supabase';
import Button from '../components/Button';
import Input from '../components/Input';
import { validateEmail } from '../utils/validation';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

export default function SignInScreen({ route, navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check if we have an email from verification
    if (route.params?.verifiedEmail) {
      setEmail(route.params.verifiedEmail);
    }
  }, [route.params]);

  function validateForm() {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSignIn() {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await signInWithEmail(email, password);

      if (error) {
        // Remove email verification check and just throw the error
        throw error;
      }
      
      // If successful, the auth state listener in AuthContext will handle navigation
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleGoogleSignIn() {
    try {
      setGoogleLoading(true);
      const { error } = await signInWithGoogle();
      
      if (error) throw error;
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
          <Text style={styles.title}>Sign In</Text>
          
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
            placeholder="Enter your password"
            secureTextEntry
            error={errors.password}
            labelStyle={{ color: '#FFFFFF' }}
          />
          
          <Button
            title="Sign In"
            onPress={handleSignIn}
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
            title="Sign in with Google"
            onPress={handleGoogleSignIn}
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
            style={styles.signUpLink}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.signUpText}>
              Don't have an account? Sign Up
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
  signUpLink: {
    marginTop: 16,
  },
  signUpText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});