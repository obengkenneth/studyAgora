import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Modal, Alert } from 'react-native';
import Button from '../../components/Button';
import { createSubject } from '../../services/api/subjectService';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

const CreateSubjectModal = ({ 
  visible, 
  onClose, 
  curriculumId, 
  onSubjectCreated 
}) => {
  const [formState, setFormState] = useState({
    name: '',
    description: '',
    curriculum_id: curriculumId
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle input changes
  const handleChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!formState.name.trim()) {
      Alert.alert('Error', 'Please enter a subject name');
      return;
    }
    
    if (!formState.curriculum_id) {
      Alert.alert('Error', 'No curriculum selected');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create the subject with the API service
      const newSubject = await createSubject(formState);
      
      // Reset form state and close modal
      setFormState({
        name: '',
        description: '',
        curriculum_id: curriculumId
      });
      setIsSubmitting(false);
      onClose();
      
      // Call the callback with the new subject
      if (onSubjectCreated) {
        onSubjectCreated(newSubject);
      }
      
      // Show success message
      Alert.alert('Success', 'Subject created successfully');
    } catch (error) {
      console.error('Error creating subject:', error);
      Alert.alert('Error', 'Failed to create subject. Please try again.');
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
          <Text style={styles.modalTitle}>Create New Subject</Text>
          
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Subject Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter subject name"
                value={formState.name}
                onChangeText={(text) => handleChange('name', text)}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter subject description (optional)"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={formState.description}
                onChangeText={(text) => handleChange('description', text)}
              />
            </View>
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={onClose}
                type="secondary"
                style={{ flex: 1, marginRight: 10 }}
              />
              <Button
                title="Create Subject"
                onPress={handleSubmit}
                loading={isSubmitting}
                style={{ flex: 1, marginLeft: 10 }}
              />
            </View>
          </View>
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
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
});

export default CreateSubjectModal;
