import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { supabase } from '../services/supabase';
import Button from '../components/Button';
import Input from '../components/Input';
import { validateEmail } from '../utils/validation';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  async function signIn() {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      // If successful, the user will be navigated automatically by our auth state change listener
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
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
      />
      
      <Button
        title="Sign In"
        onPress={signIn}
        loading={loading}
        variant="primary"
        fullWidth
        style={styles.button}
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
  signUpLink: {
    marginTop: 16,
  },
  signUpText: {
    color: '#3b82f6', // blue-500
    textAlign: 'center',
  },
});