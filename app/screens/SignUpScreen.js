import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { supabase } from '../services/supabase';
import Button from '../components/Button';
import Input from '../components/Input';
import { validateEmail, validatePassword } from '../utils/validation';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  async function signUp() {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Sign up with Supabase
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
      
      Alert.alert(
        'Verification email sent', 
        'Please check your email to verify your account before signing in.',
        [{ text: 'OK', onPress: () => navigation.navigate('SignIn') }]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
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
      />
      
      <Button
        title="Sign Up"
        onPress={signUp}
        loading={loading}
        variant="primary"
        fullWidth
        style={styles.button}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1f2937', // gray-800
  },
  button: {
    marginTop: 8,
  },
  signInLink: {
    marginTop: 16,
  },
  signInText: {
    color: '#3b82f6', // blue-500
    textAlign: 'center',
  },
}); 