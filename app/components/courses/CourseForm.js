import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import ThumbnailPicker from '../common/ThumbnailPicker';
import Button from '../../components/Button';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

const CourseForm = ({ 
  initialData = { 
    title: '', 
    description: '', 
    level: 'Beginner', 
    duration: '', 
    image: null 
  }, 
  subjectId,
  subjectName = '',
  onSubmit,
  onCancel,
  isEditing = false
}) => {
  const [formState, setFormState] = useState(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle input changes
  const handleChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle level selection
  const handleLevelSelect = (level) => {
    setFormState(prev => ({
      ...prev,
      level
    }));
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if (!formState.title.trim()) {
      Alert.alert('Error', 'Please enter a course title');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create course object
      const courseData = {
        title: formState.title,
        description: formState.description || '',
        duration: formState.duration || '',
        level: formState.level,
        subject_id: subjectId,
        image: formState.image
      };
      
      // Call the submit handler
      await onSubmit(courseData);
      
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error submitting course:', error);
      Alert.alert('Error', 'Failed to save course. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Handle image upload completion
  const handleImageUploaded = (imageUrl) => {
    setFormState(prev => ({
      ...prev,
      image: imageUrl
    }));
  };
  
  return (
    <View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Course Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter course title"
          value={formState.title}
          onChangeText={(text) => handleChange('title', text)}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Enter course description"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={formState.description}
          onChangeText={(text) => handleChange('description', text)}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Estimated Duration</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 8 weeks"
          value={formState.duration}
          onChangeText={(text) => handleChange('duration', text)}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Course Level</Text>
        <View style={styles.levelButtonsContainer}>
          <View style={styles.levelButtons}>
            {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelButton,
                  formState.level === level ? styles.selectedLevel : {}
                ]}
                onPress={() => handleLevelSelect(level)}
              >
                <Text
                  style={[
                    styles.levelButtonText,
                    formState.level === level ? styles.selectedLevelText : {}
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={[
              styles.allLevelsButton,
              formState.level === 'All Levels' ? styles.selectedLevel : {}
            ]}
            onPress={() => handleLevelSelect('All Levels')}
          >
            <Text
              style={[
                styles.levelButtonText,
                formState.level === 'All Levels' ? styles.selectedLevelText : {}
              ]}
            >
              All Levels
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Subject</Text>
        <View style={styles.input}>
          <Text style={styles.subjectText}>{subjectName || 'No subject selected'}</Text>
        </View>
      </View>
      
      <ThumbnailPicker
        storageId={isEditing ? initialData.id : `new-${Date.now()}`}
        existingImageUrl={formState.image}
        onImageUploaded={handleImageUploaded}
      />
      
      <View style={styles.modalButtons}>
        <Button
          title="Cancel"
          onPress={onCancel}
          type="secondary"
          style={{ flex: 1, marginRight: 10 }}
        />
        <Button
          title={isEditing ? "Save Changes" : "Create Course"}
          onPress={handleSubmit}
          loading={isSubmitting}
          style={{ flex: 1, marginLeft: 10 }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  levelButtonsContainer: {
    gap: 10,
  },
  levelButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  allLevelsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
    height: 45,
  },
  levelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 8,
    margin: 4,
    minWidth: 60,
    height: 36,
  },
  selectedLevel: {
    backgroundColor: COLORS.primary,
  },
  levelButtonText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  selectedLevelText: {
    color: '#FFFFFF',
  },
  subjectText: {
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 2,
  },
});

export default CourseForm;
