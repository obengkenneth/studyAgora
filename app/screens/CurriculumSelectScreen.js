import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../services/supabase';
import { getUserProfile, updateCurriculum } from '../services/supabaseAdmin';
import { GraduationCap, BookOpen, Languages } from 'lucide-react-native';
import Button from '../components/Button';
import { useAuth } from '../navigation/AuthContext';

const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

const CURRICULUMS = [
  { 
    id: 'cambridge', 
    label: 'Cambridge', 
    icon: GraduationCap
  },
  { 
    id: 'sat', 
    label: 'SAT', 
    icon: BookOpen
  },
  { 
    id: 'ielts', 
    label: 'IELTS', 
    icon: Languages
  }
];

export default function CurriculumSelectScreen({ navigation, route }) {
  const { user } = useAuth();
  // Get userId from route params or from authenticated user
  const userId = route.params?.userId || user?.id;
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch existing user profile
  useEffect(() => {
    async function fetchUserProfile() {
      if (!userId) {
        console.error('User ID not available in CurriculumSelectScreen');
        setInitialLoading(false);
        return;
      }
      
      try {
        console.log('Fetching user profile for ID:', userId);
        
        // Use admin client to bypass RLS policies
        const { data, error } = await getUserProfile(userId);
          
        if (error) {
          console.error('Error fetching user profile:', error);
          throw error;
        }
        
        console.log('User profile data:', data);
        setUserProfile(data || null);
        
        if (data?.curriculum) {
          console.log('Curriculum found:', data.curriculum);
          setSelectedCurriculum(data.curriculum);
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error.message);
      } finally {
        setInitialLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [userId]);

  async function handleContinue() {
    if (!selectedCurriculum) {
      Alert.alert('Selection Required', 'Please select a curriculum to continue.');
      return;
    }
    
    if (!userId) {
      Alert.alert('Error', 'User ID is not available. Please try signing in again.');
      return;
    }

    try {
      setLoading(true);
      console.log('Updating curriculum for user ID:', userId);
      
      // Use admin client to bypass RLS policies
      const { data, error } = await updateCurriculum(userId, selectedCurriculum);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Curriculum updated successfully, navigating to Dashboard');
      // Navigate to the App stack instead of directly to Dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'App' }],
      });
    } catch (error) {
      console.error('Error saving curriculum selection:', error.message);
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Your Curriculum</Text>
        <Text style={styles.subtitle}>Choose your preferred program</Text>
        
        <View style={styles.optionsContainer}>
          {CURRICULUMS.map((curriculum) => (
            <TouchableOpacity
              key={curriculum.id}
              style={[
                styles.option,
                selectedCurriculum === curriculum.id && styles.selectedOption
              ]}
              onPress={() => setSelectedCurriculum(curriculum.id)}
            >
              <curriculum.icon
                size={32}
                color={selectedCurriculum === curriculum.id ? 'white' : COLORS.primary}
              />
              <Text style={[
                styles.optionTitle,
                selectedCurriculum === curriculum.id && styles.selectedOptionText
              ]}>
                {curriculum.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Button
          title="Complete Setup"
          onPress={handleContinue}
          variant="primary"
          disabled={!selectedCurriculum || !userId}
          loading={loading}
          style={styles.button}
          fullWidth
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    padding: 24,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  selectedOptionText: {
    color: 'white',
  },
  button: {
    marginTop: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
}); 