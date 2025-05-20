import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Switch 
} from 'react-native';
import { X } from 'lucide-react-native';
import Button from '../Button';
import { showAlert } from '../BeautifulAlert';
import { createUnit } from '../../services/api/unitService';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

const CreateUnitModal = ({ visible, courseId, onClose, onUnitCreated }) => {
  const [loading, setLoading] = useState(false);
  const [unitData, setUnitData] = useState({
    title: '',
    description: '',
    course_id: courseId,
    is_published: false
  });

  const handleChange = (key, value) => {
    setUnitData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validate inputs
      if (!unitData.title.trim()) {
        showAlert('error', 'Error', 'Please enter a unit title', [
          {
            text: 'OK',
            primary: true
          }
        ]);
        return;
      }

      setLoading(true);

      // Create unit in database
      const newUnit = await createUnit({
        title: unitData.title,
        description: unitData.description,
        course_id: courseId,
        is_published: unitData.is_published
      });

      // Reset form and close modal
      setUnitData({
        title: '',
        description: '',
        course_id: courseId,
        is_published: false
      });

      // Call callback with newly created unit
      if (onUnitCreated) {
        onUnitCreated(newUnit);
      }

      // Close modal
      onClose();

      showAlert('success', 'Success', 'Unit created successfully!', [
        {
          text: 'OK',
          primary: true
        }
      ]);
    } catch (error) {
      console.error('Error creating unit:', error);
      showAlert('error', 'Error', 'Failed to create unit. Please try again.', [
        {
          text: 'OK',
          primary: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Unit</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formGroup}>
              <Text style={styles.label}>Unit Title</Text>
              <TextInput
                style={styles.input}
                value={unitData.title}
                onChangeText={(text) => handleChange('title', text)}
                placeholder="Enter unit title"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={unitData.description}
                onChangeText={(text) => handleChange('description', text)}
                placeholder="Enter unit description"
                multiline={true}
                numberOfLines={4}
              />
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Published</Text>
              <Switch
                value={unitData.is_published}
                onValueChange={(value) => handleChange('is_published', value)}
                trackColor={{ false: '#E5E7EB', true: 'rgba(76, 175, 80, 0.4)' }}
                thumbColor={unitData.is_published ? COLORS.primary : '#F3F4F6'}
              />
            </View>
            
            <View style={styles.buttonContainer}>
              <Button
                title="Cancel"
                onPress={onClose}
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Create Unit"
                onPress={handleSubmit}
                variant="primary"
                loading={loading}
                style={{ flex: 1, marginLeft: 8 }}
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
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});

export default CreateUnitModal;
