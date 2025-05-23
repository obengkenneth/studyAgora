import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput, 
  Switch, 
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { X, Plus, File } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { createLesson, updateLesson, uploadLessonAttachment } from '../../services/api/lessonService';
import Button from '../Button';
import { showAlert } from '../../components/BeautifulAlert';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

const LessonModal = ({ 
  visible, 
  onClose, 
  unitId, 
  onLessonCreated,
  onLessonUpdated,
  editingLesson = null 
}) => {
  const [formState, setFormState] = useState({
    title: '',
    content: '',
    is_published: false,
    attachment_url: null,
    attachment_name: null,
    lesson_type: 'text' // text, video, pdf, etc.
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  
  const isEditing = !!editingLesson;
  
  // Set form state when editing an existing lesson
  useEffect(() => {
    if (editingLesson) {
      setFormState({
        title: editingLesson.title || '',
        content: editingLesson.content || '',
        is_published: editingLesson.is_published || false,
        attachment_url: editingLesson.attachment_url || null,
        attachment_name: editingLesson.attachment_name || null,
        lesson_type: editingLesson.lesson_type || 'text'
      });
    } else {
      // Reset form when creating a new lesson
      setFormState({
        title: '',
        content: '',
        is_published: false,
        attachment_url: null,
        attachment_name: null,
        lesson_type: 'text'
      });
    }
    setSelectedFile(null);
  }, [editingLesson, visible]);
  
  // Handle input changes
  const handleChange = (field, value) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle file selection
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // All file types
        copyToCacheDirectory: true
      });
      
      if (result.canceled) {
        return;
      }
      
      const file = result.assets[0];
      
      // Determine lesson type based on file mimetype
      let lessonType = 'text';
      if (file.mimeType) {
        if (file.mimeType.startsWith('video/')) {
          lessonType = 'video';
        } else if (file.mimeType === 'application/pdf') {
          lessonType = 'pdf';
        } else if (file.mimeType.startsWith('image/')) {
          lessonType = 'image';
        }
      }
      
      setSelectedFile(file);
      setFormState(prev => ({
        ...prev,
        attachment_name: file.name,
        lesson_type: lessonType
      }));
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!formState.title.trim()) {
      showAlert('error', 'Missing Information', 'Please enter a lesson title', [
        { text: 'OK', primary: true }
      ]);
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      let attachmentUrl = formState.attachment_url;
      let attachmentName = formState.attachment_name;
      
      // Upload file attachment if selected
      if (selectedFile) {
        // For new lessons, we need a temporary ID to create the storage path
        const tempId = isEditing ? editingLesson.id : `temp_${Date.now()}`;
        try {
          attachmentUrl = await uploadLessonAttachment(tempId, selectedFile);
          attachmentName = selectedFile.name;
        } catch (uploadError) {
          console.error('Error uploading attachment:', uploadError);
          showAlert('error', 'Upload Failed', 'Failed to upload file. Please try again.', [
            { text: 'OK', primary: true }
          ]);
          setIsSubmitting(false);
          return;
        }
      }
      
      // Get the current user's ID for created_by field
      const session = await supabase.auth.getSession();
      const userId = session?.data?.session?.user?.id;
      
      // Prepare lesson data
      const lessonData = {
        title: formState.title,
        content: formState.content,
        is_published: formState.is_published,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        lesson_type: formState.lesson_type,
        unit_id: unitId,
        created_by: userId
      };
      
      let result;
      if (isEditing) {
        // Update existing lesson
        result = await updateLesson(editingLesson.id, lessonData);
        if (onLessonUpdated) onLessonUpdated(result);
      } else {
        // Create new lesson
        result = await createLesson(lessonData);
        if (onLessonCreated) onLessonCreated(result);
      }
      
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error('Error saving lesson:', error);
      showAlert('error', 'Save Failed', 'Failed to save lesson. Please try again.', [
        { text: 'OK', primary: true }
      ]);
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
            <Text style={styles.modalTitle}>
              {isEditing ? 'Edit Lesson' : 'Create New Lesson'}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Lesson Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter lesson title"
                value={formState.title}
                onChangeText={(text) => handleChange('title', text)}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Content</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter lesson content"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                value={formState.content}
                onChangeText={(text) => handleChange('content', text)}
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Attachment</Text>
              {(formState.attachment_url || selectedFile) && (
                <View style={styles.attachmentItem}>
                  <File size={20} color={COLORS.primary} />
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {selectedFile ? selectedFile.name : formState.attachment_name || 'Attachment'}
                  </Text>
                </View>
              )}
              <TouchableOpacity 
                style={styles.attachmentButton}
                onPress={pickDocument}
              >
                <Plus size={18} color={COLORS.primary} />
                <Text style={styles.attachmentButtonText}>
                  {formState.attachment_url || selectedFile ? 'Change Attachment' : 'Add Attachment'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.formGroup}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Publish Lesson</Text>
                <Switch
                  value={formState.is_published}
                  onValueChange={(value) => handleChange('is_published', value)}
                  trackColor={{ false: '#E5E7EB', true: '#4CAF50' }}
                  thumbColor={'#FFFFFF'}
                />
              </View>
              <Text style={styles.helpText}>
                {formState.is_published 
                  ? 'Lesson will be visible to learners' 
                  : 'Lesson will be hidden from learners'}
              </Text>
            </View>
            
            <View style={styles.formActions}>
              <Button
                title="Cancel"
                onPress={onClose}
                type="secondary"
                style={{ flex: 1, marginRight: 10 }}
              />
              <Button
                title={isEditing ? "Save Changes" : "Create Lesson"}
                onPress={handleSubmit}
                loading={isSubmitting}
                style={{ flex: 1, marginLeft: 10 }}
              />
            </View>
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
    padding: 20,
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
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
    height: 120,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  helpText: {
    fontSize: 12,
    color: COLORS.lightText,
    marginTop: 4,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E0',
  },
  attachmentButtonText: {
    marginLeft: 8,
    color: COLORS.primary,
    fontWeight: '500',
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  attachmentName: {
    marginLeft: 8,
    flex: 1,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default LessonModal;
