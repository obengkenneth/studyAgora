import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';
import { updateUserGroup, getUserProfile } from '../services/supabaseAdmin';
import { GraduationCap, Users, BookOpen } from 'lucide-react-native';
import Button from '../components/Button';
import { useAuth } from '../navigation/AuthContext';

const USER_GROUPS = [
  { id: 'student', label: 'Student', icon: GraduationCap },
  { id: 'parent', label: 'Parent', icon: Users },
  { id: 'facilitator', label: 'Facilitator', icon: BookOpen },
];

export default function UserGroupScreen({ navigation, route }) {
  const { user } = useAuth();
  // Get userId from route params or from authenticated user
  const userId = route.params?.userId || user?.id;
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  console.log('UserGroupScreen rendered with route params:', route.params);
  console.log('Current auth user:', user);
  console.log('Using userId:', userId);

  // Check if user profile exists when component mounts
  useEffect(() => {
    async function checkUserProfile() {
      if (!userId) {
        console.log('No userId available, skipping profile check');
        setInitialLoading(false);
        return;
      }

      try {
        console.log('Checking user profile for ID:', userId);
        
        // Check if user profile exists using admin client to bypass RLS
        const { data, error } = await getUserProfile(userId);
        
        console.log('Profile check result:', data ? 'Found' : 'Not found', error ? `Error: ${error.message}` : 'No error');
        
        if (error) {
          console.error('Error checking user profile:', error);
        }
        
        if (data?.user_group) {
          // User already has a group, pre-select it
          console.log('User group found:', data.user_group);
          setSelectedGroup(data.user_group);
        }
      } catch (error) {
        console.error('Error in checkUserProfile:', error);
      } finally {
        setInitialLoading(false);
      }
    }
    
    checkUserProfile();
  }, [userId]);

  async function handleContinue() {
    if (!selectedGroup) {
      Alert.alert('Selection Required', 'Please select your role to continue.');
      return;
    }
    
    if (!userId) {
      console.error('No userId available for profile update');
      Alert.alert('Error', 'User ID is not available. Please try signing in again.');
      return;
    }

    try {
      setLoading(true);
      console.log('Updating user group for ID:', userId);
      
      // Update the user's metadata with the selected group using admin client
      const { data, error } = await updateUserGroup(userId, selectedGroup);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('User group updated successfully:', data);
      console.log('Navigating to CurriculumSelect with userId:', userId);
      
      // Navigate to the curriculum selection screen with a reset to prevent going back
      navigation.reset({
        index: 0,
        routes: [{ name: 'CurriculumSelect', params: { userId } }],
      });
    } catch (error) {
      console.error('Error saving user group:', error.message);
      Alert.alert('Error', 'Failed to save your selection. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show a message if no userId is available
  if (!userId) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>Error: No user ID available</Text>
        <Button
          title="Go to Sign In"
          onPress={() => navigation.navigate('SignIn')}
          variant="primary"
          fullWidth
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>I am a...</Text>
      <Text style={styles.subtitle}>Select your role</Text>
      
      <View style={styles.optionsContainer}>
        {USER_GROUPS.map((group) => (
          <TouchableOpacity
            key={group.id}
            style={[
              styles.option,
              selectedGroup === group.id && styles.selectedOption
            ]}
            onPress={() => setSelectedGroup(group.id)}
          >
            <group.icon 
              size={32} 
              color={selectedGroup === group.id ? 'white' : COLORS.primary} 
            />
            <Text style={[
              styles.optionTitle,
              selectedGroup === group.id && styles.selectedOptionText
            ]}>
              {group.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Button
        title="Continue"
        onPress={handleContinue}
        variant="primary"
        disabled={!selectedGroup}
        loading={loading}
        style={styles.button}
        fullWidth
      />
    </View>
  );
}

const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'white',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 8,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
  },
  optionsContainer: {
    marginBottom: 32,
  },
  option: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  selectedOption: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1f2937',
  },
  selectedOptionText: {
    color: 'white',
  },
  button: {
    marginTop: 16,
  },
}); 