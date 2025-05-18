import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Modal, ActivityIndicator, Dimensions } from 'react-native';
import { Clock, Users2, Edit2, Trash2, ArrowLeft, FileText, Book } from 'lucide-react-native';
import { useAuth } from '../../navigation/AuthContext';
import Button from '../../components/Button';
import CourseForm from '../../components/courses/CourseForm';
import { fetchCourseById, updateCourse, deleteCourse } from '../../services/api/courseService';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

export default function CourseDetailsScreen({ route, navigation }) {
  const { courseId } = route.params;
  const { userProfile, hasRole } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editCourse, setEditCourse] = useState({
    title: '',
    description: '',
    duration: '',
    level: 'Beginner',
    image: null
  });
  
  const windowWidth = Dimensions.get('window').width;
  const isFacilitator = hasRole('facilitator');
  
  useEffect(() => {
    loadCourseDetails();
  }, [courseId]);
  
  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      const courseData = await fetchCourseById(courseId);
      
      setCourse(courseData);
      
      // Prepare edit form data
      setEditCourse({
        id: courseData.id,
        title: courseData.title || '',
        description: courseData.description || '',
        duration: courseData.duration || '',
        level: courseData.level || 'Beginner',
        image: courseData.image || null
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading course details:', error);
      Alert.alert('Error', 'Failed to load course details');
      setLoading(false);
    }
  };
  
  const handleUpdateCourse = async (updatedCourseData) => {
    try {
      // Update course in database
      const updatedCourse = await updateCourse(courseId, updatedCourseData);
      
      // Update local state
      setCourse(prev => ({
        ...prev,
        ...updatedCourse
      }));
      
      // Close modal
      setModalVisible(false);
      
      // Show success message
      Alert.alert('Success', 'Course updated successfully');
    } catch (error) {
      console.error('Error updating course:', error);
      Alert.alert('Error', 'Failed to update course');
    }
  };
  
  const handleDeleteCourse = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this course? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCourse(courseId);
              
              // Navigate back to the courses list
              navigation.goBack();
              
              // Show success message
              Alert.alert('Success', 'Course deleted successfully');
            } catch (error) {
              console.error('Error deleting course:', error);
              Alert.alert('Error', 'Failed to delete course');
            }
          }
        }
      ]
    );
  };
  
  // Render edit course modal
  const renderEditCourseModal = () => {
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Course</Text>
            
            <CourseForm
              initialData={editCourse}
              subjectId={course?.subject_id}
              onSubmit={handleUpdateCourse}
              onCancel={() => setModalVisible(false)}
              isEditing={true}
            />
          </View>
        </View>
      </Modal>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  if (!course) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Course not found</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={24} color={COLORS.text} />
      </TouchableOpacity>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Course Image */}
        <Image 
          source={{ uri: course.image || 'https://via.placeholder.com/800x450?text=No+Image' }} 
          style={styles.courseImage}
          resizeMode="cover"
        />
        
        {/* Course Content */}
        <View style={styles.courseContentContainer}>
          {/* Course Header */}
          <View style={styles.courseHeader}>
            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbText}>
                {course.subjects?.curriculums?.name} / {course.subjects?.name}
              </Text>
            </View>
            
            <Text style={styles.courseTitle}>{course.title}</Text>
            
            <View style={styles.courseMetaContainer}>
              {course.duration && (
                <View style={styles.metaItem}>
                  <Clock size={16} color={COLORS.lightText} />
                  <Text style={styles.metaText}>{course.duration}</Text>
                </View>
              )}
              
              <View style={styles.metaItem}>
                <Users2 size={16} color={COLORS.lightText} />
                <Text style={styles.metaText}>{course.level || 'All Levels'}</Text>
              </View>
            </View>
          </View>
          
          {/* Course Description */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.courseDescription}>
              {course.description || 'No description available.'}
            </Text>
          </View>
          
          {/* Course Materials */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Course Materials</Text>
            
            <View style={styles.materialsContainer}>
              <TouchableOpacity style={styles.materialCard}>
                <View style={styles.materialIconContainer}>
                  <FileText size={24} color={COLORS.primary} />
                </View>
                <View style={styles.materialContent}>
                  <Text style={styles.materialTitle}>Course Notes</Text>
                  <Text style={styles.materialDescription}>PDF document</Text>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.materialCard}>
                <View style={styles.materialIconContainer}>
                  <Book size={24} color={COLORS.primary} />
                </View>
                <View style={styles.materialContent}>
                  <Text style={styles.materialTitle}>Reading List</Text>
                  <Text style={styles.materialDescription}>Recommended books</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Action Buttons (for facilitators only) */}
          {isFacilitator && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => setModalVisible(true)}
              >
                <Edit2 size={18} color={COLORS.primary} />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDeleteCourse}
              >
                <Trash2 size={18} color={COLORS.secondary} />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Edit Course Modal */}
      {renderEditCourseModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  courseImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#E5E7EB',
  },
  courseContentContainer: {
    padding: 20,
  },
  courseHeader: {
    marginBottom: 24,
  },
  breadcrumb: {
    marginBottom: 12,
  },
  breadcrumbText: {
    fontSize: 14,
    color: COLORS.lightText,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  courseMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.lightText,
    marginLeft: 4,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  courseDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
  },
  materialsContainer: {
    marginTop: 8,
  },
  materialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  materialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  materialContent: {
    flex: 1,
  },
  materialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  materialDescription: {
    fontSize: 14,
    color: COLORS.lightText,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: COLORS.primary + '20', // 20% opacity
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: COLORS.secondary + '20', // 20% opacity
    marginLeft: 8,
  },
  actionButtonText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  deleteButtonText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
});
