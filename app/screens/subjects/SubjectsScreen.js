import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useAuth } from '../../navigation/AuthContext';
import { fetchSubjects } from '../../services/api/subjectService';
import { fetchCurriculumById } from '../../services/api/curriculumService';
import SubjectCard from '../../components/subjects/SubjectCard';
import CreateSubjectModal from '../../components/subjects/CreateSubjectModal';
import Breadcrumbs from '../../components/common/Breadcrumbs';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

export default function SubjectsScreen({ route, navigation }) {
  const { curriculumId } = route.params;
  const { hasRole } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [curriculum, setCurriculum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  const isFacilitator = hasRole('facilitator');
  
  useEffect(() => {
    loadData();
  }, [curriculumId]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load curriculum details
      let curriculumDetails = null;
      if (curriculumId) {
        curriculumDetails = await fetchCurriculumById(curriculumId);
        setCurriculum(curriculumDetails);
      }
      
      // Load subjects for this curriculum
      const subjectsData = await fetchSubjects(curriculumId);
      setSubjects(subjectsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load subjects. Please try again.');
      setLoading(false);
    }
  };
  
  const handleSubjectCreated = (newSubject) => {
    // Add the new subject to the list
    setSubjects(prevSubjects => [newSubject, ...prevSubjects]);
  };
  
  const handleSubjectPress = (subjectId) => {
    navigation.navigate('Courses', { subjectId, curriculumId });
  };
  
  const getBreadcrumbItems = () => {
    return [
      { 
        label: 'Learning Pathways', 
        onPress: () => navigation.navigate('Curriculums')
      },
      { 
        label: curriculum?.name || 'Curriculum', 
        isActive: true
      }
    ];
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
      <Breadcrumbs items={getBreadcrumbItems()} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Title and subtitle */}
          <Text style={styles.heading}>{curriculum?.name || 'Subjects'}</Text>
          <Text style={styles.subheading}>Select a subject to study</Text>
          
          {/* Subjects list */}
          <View style={styles.listContainer}>
            {subjects.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No subjects available for this curriculum</Text>
              </View>
            ) : (
              subjects.map(subject => (
                <SubjectCard 
                  key={subject.id} 
                  subject={subject} 
                  onPress={() => handleSubjectPress(subject.id)}
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
      
      {/* Create Subject Modal */}
      <CreateSubjectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        curriculumId={curriculumId}
        onSubjectCreated={handleSubjectCreated}
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
