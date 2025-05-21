import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Alert, ScrollView } from 'react-native';
import CourseForm from './CourseForm';
import { createCourse } from '../../services/api/courseService';
import { fetchSubjectById } from '../../services/api/subjectService';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

const CreateCourseModal = ({ 
  visible, 
  onClose, 
  subjectId, 
  onCourseCreated 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  
  // Fetch subject details when modal becomes visible
  useEffect(() => {
    if (visible && subjectId) {
      fetchSubjectDetails();
    }
  }, [visible, subjectId]);
  
  // Fetch subject details
  const fetchSubjectDetails = async () => {
    try {
      const subject = await fetchSubjectById(subjectId);
      if (subject) {
        setSubjectName(subject.name);
      }
    } catch (error) {
      console.error('Error fetching subject details:', error);
    }
  };

  const handleCreateCourse = async (courseData) => {
    try {
      setIsSubmitting(true);
      
      // Create the course with the API service
      const newCourse = await createCourse(courseData);
      
      // Reset form state and close modal
      setIsSubmitting(false);
      onClose();
      
      // Call the callback with the new course
      if (onCourseCreated) {
        onCourseCreated(newCourse);
      }
      
      // Show success message
      Alert.alert('Success', 'Course created successfully');
    } catch (error) {
      console.error('Error creating course:', error);
      Alert.alert('Error', 'Failed to create course. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Course</Text>
          </View>
          
          <ScrollView style={styles.modalScrollContent} contentContainerStyle={styles.modalScrollContentContainer}>
            <CourseForm
              subjectId={subjectId}
              subjectName={subjectName}
              onSubmit={handleCreateCourse}
              onCancel={onClose}
              isSubmitting={isSubmitting}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    padding: 0,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalHeader: {
    padding: 24,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  modalScrollContent: {
    flexGrow: 0,
  },
  modalScrollContentContainer: {
    padding: 24,
    paddingTop: 0,
  },
});

export default CreateCourseModal;
