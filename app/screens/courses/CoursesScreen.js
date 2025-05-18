import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useAuth } from '../../navigation/AuthContext';
import { fetchCourses } from '../../services/api/courseService';
import { fetchSubjectById } from '../../services/api/subjectService';
import CourseCard from '../../components/courses/CourseCard';
import CreateCourseModal from '../../components/courses/CreateCourseModal';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

export default function CoursesScreen({ route, navigation }) {
  const { subjectId, curriculumId } = route.params;
  const { hasRole } = useAuth();
  const [courses, setCourses] = useState([]);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  const isFacilitator = hasRole('facilitator');
  
  useEffect(() => {
    loadData();
  }, [subjectId]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load subject details
      const subjectData = await fetchSubjectById(subjectId);
      setSubject(subjectData);
      
      // Load courses for this subject
      const coursesData = await fetchCourses(subjectId);
      setCourses(coursesData);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load courses. Please try again.');
      setLoading(false);
    }
  };
  
  const handleCourseCreated = (newCourse) => {
    // Add the new course to the list
    setCourses(prevCourses => [newCourse, ...prevCourses]);
  };
  
  const handleCoursePress = (courseId) => {
    navigation.navigate('CourseDetails', { courseId });
  };
  
  const renderBreadcrumbs = () => {
    return (
      <View style={styles.breadcrumbs}>
        <TouchableOpacity
          style={styles.breadcrumbItem}
          onPress={() => navigation.navigate('Curriculums')}
        >
          <Text style={styles.breadcrumbText}>Learning Pathways</Text>
        </TouchableOpacity>
        
        <Text style={styles.breadcrumbSeparator}>/</Text>
        
        <TouchableOpacity
          style={styles.breadcrumbItem}
          onPress={() => navigation.navigate('Subjects', { curriculumId })}
        >
          <Text style={styles.breadcrumbText}>{subject?.curriculums?.name || 'Curriculum'}</Text>
        </TouchableOpacity>
        
        <Text style={styles.breadcrumbSeparator}>/</Text>
        
        <TouchableOpacity
          style={[styles.breadcrumbItem, styles.breadcrumbItemActive]}
        >
          <Text style={styles.breadcrumbText}>{subject?.name || 'Subject'}</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderCoursesList = () => {
    if (courses.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No courses available for this subject</Text>
        </View>
      );
    }
    
    return courses.map(course => (
      <CourseCard 
        key={course.id} 
        course={course} 
        onPress={() => handleCoursePress(course.id)}
      />
    ));
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
      {renderBreadcrumbs()}
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Title and subtitle */}
          <Text style={styles.heading}>{subject?.name || 'Courses'}</Text>
          <Text style={styles.subheading}>Available courses</Text>
          
          {/* Courses list */}
          <View style={styles.listContainer}>
            {renderCoursesList()}
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
      
      {/* Create Course Modal */}
      <CreateCourseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        subjectId={subjectId}
        onCourseCreated={handleCourseCreated}
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
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexWrap: 'wrap',
  },
  breadcrumbItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  breadcrumbItemActive: {
    backgroundColor: '#E5E7EB',
  },
  breadcrumbText: {
    fontSize: 14,
    color: COLORS.text,
  },
  breadcrumbSeparator: {
    marginHorizontal: 8,
    color: COLORS.lightText,
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
