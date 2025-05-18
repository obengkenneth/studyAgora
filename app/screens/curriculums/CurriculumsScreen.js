import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useAuth } from '../../navigation/AuthContext';
import { fetchCurriculums } from '../../services/api/curriculumService';
import CurriculumCard from '../../components/curriculums/CurriculumCard';
import CreateCurriculumModal from '../../components/curriculums/CreateCurriculumModal';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

export default function CurriculumsScreen({ navigation }) {
  const { hasRole } = useAuth();
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  const isFacilitator = hasRole('facilitator');
  
  useEffect(() => {
    loadCurriculums();
  }, []);
  
  const loadCurriculums = async () => {
    try {
      setLoading(true);
      const curriculumsData = await fetchCurriculums();
      setCurriculums(curriculumsData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading curriculums:', error);
      Alert.alert('Error', 'Failed to load learning pathways. Please try again.');
      setLoading(false);
    }
  };
  
  const handleCurriculumCreated = (newCurriculum) => {
    // Add the new curriculum to the list
    setCurriculums(prevCurriculums => [newCurriculum, ...prevCurriculums]);
  };
  
  const handleCurriculumPress = (curriculumId) => {
    navigation.navigate('Subjects', { curriculumId });
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Title and subtitle */}
          <Text style={styles.heading}>Learning Pathways</Text>
          <Text style={styles.subheading}>Choose your curriculum</Text>
          
          {/* Curriculums list */}
          <View style={styles.listContainer}>
            {curriculums.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No learning pathways available</Text>
              </View>
            ) : (
              curriculums.map(curriculum => (
                <CurriculumCard 
                  key={curriculum.id} 
                  curriculum={curriculum} 
                  onPress={() => handleCurriculumPress(curriculum.id)}
                />
              ))
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Create Button (only visible for facilitators) */}
      {isFacilitator && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      )}
      
      {/* Create Curriculum Modal */}
      <CreateCurriculumModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCurriculumCreated={handleCurriculumCreated}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 16,
    color: COLORS.lightText,
    marginBottom: 24,
  },
  listContainer: {
    marginTop: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.lightText,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
