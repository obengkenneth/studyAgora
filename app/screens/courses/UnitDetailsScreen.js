import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  Switch
} from 'react-native';
import { ArrowLeft, Edit2, Trash2, Plus, Video, Book, FileText, X } from 'lucide-react-native';
import { useAuth } from '../../navigation/AuthContext';
import Button from '../../components/Button';
import { showAlert } from '../../components/BeautifulAlert';
import { fetchUnitById, updateUnit, deleteUnit } from '../../services/api/unitService';
import { fetchCourseById } from '../../services/api/courseService';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

export default function UnitDetailsScreen({ route, navigation }) {
  const { unitId } = route.params;
  const { userProfile, hasRole } = useAuth();
  const [unit, setUnit] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [editingUnit, setEditingUnit] = useState({
    title: '',
    description: '',
    is_published: false
  });
  
  const isFacilitator = hasRole('facilitator');
  
  useEffect(() => {
    loadUnitDetails();
  }, [unitId]);
  
  const loadUnitDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch unit details
      const unitData = await fetchUnitById(unitId);
      setUnit(unitData);
      
      // Set editing unit data
      setEditingUnit({
        title: unitData.title || '',
        description: unitData.description || '',
        is_published: unitData.is_published || false
      });
      
      // Fetch associated course details
      if (unitData?.course_id) {
        const courseData = await fetchCourseById(unitData.course_id);
        setCourse(courseData);
      }
      
      // TODO: Add lessons fetch here when implemented
      setLessons([]);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading unit details:', error);
      showAlert('error', 'Error', 'Failed to load unit details', [
        { text: 'OK', primary: true }
      ]);
      setLoading(false);
    }
  };
  
  const handleEditUnit = async () => {
    try {
      if (!editingUnit.title.trim()) {
        showAlert('error', 'Error', 'Please enter a unit title', [
          { text: 'OK', primary: true }
        ]);
        return;
      }
      
      const updatedUnit = await updateUnit(unitId, {
        title: editingUnit.title,
        description: editingUnit.description,
        is_published: editingUnit.is_published
      });
      
      // Update local state
      setUnit(updatedUnit);
      
      // Close modal
      setEditModalVisible(false);
      
      // Show success message
      showAlert('success', 'Success', 'Unit updated successfully', [
        { text: 'OK', primary: true }
      ]);
    } catch (error) {
      console.error('Error updating unit:', error);
      showAlert('error', 'Error', 'Failed to update unit', [
        { text: 'OK', primary: true }
      ]);
    }
  };
  
  const handleDeleteUnit = () => {
    showAlert('warning', 'Confirm Delete', 'Are you sure you want to delete this unit? This action cannot be undone.', [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteUnit(unitId);
            
            // Navigate back to course details
            navigation.goBack();
            
            // Show success message
            showAlert('success', 'Success', 'Unit deleted successfully', [
              { text: 'OK', primary: true }
            ]);
          } catch (error) {
            console.error('Error deleting unit:', error);
            showAlert('error', 'Error', 'Failed to delete unit', [
              { text: 'OK', primary: true }
            ]);
          }
        }
      }
    ]);
  };
  
  const handleAddLesson = () => {
    // TODO: Implement adding lessons
    showAlert('info', 'Coming Soon', 'Lesson creation will be implemented in the next update', [
      { text: 'OK', primary: true }
    ]);
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  if (!unit) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Unit not found</Text>
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
        {/* Unit Header */}
        <View style={styles.headerContainer}>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbText}>
              {course?.title || 'Course'} / Unit {unit.order_index + 1}
            </Text>
          </View>
          
          <Text style={styles.unitTitle}>{unit.title}</Text>
          
          {unit.is_published ? (
            <View style={styles.publishedBadge}>
              <Text style={styles.publishedText}>Published</Text>
            </View>
          ) : (
            <View style={styles.draftBadge}>
              <Text style={styles.draftText}>Draft</Text>
            </View>
          )}
        </View>
        
        {/* Unit Description */}
        {unit.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{unit.description}</Text>
          </View>
        )}
        
        {/* Lessons Section */}
        <View style={styles.lessonsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lessons</Text>
            {isFacilitator && (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddLesson}
              >
                <Plus size={18} color={COLORS.primary} />
                <Text style={styles.addButtonText}>Add Lesson</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {lessons.length === 0 ? (
            <View style={styles.noLessonsContainer}>
              <Video size={48} color="#E5E7EB" />
              <Text style={styles.noLessonsText}>No lessons added yet</Text>
              {isFacilitator && (
                <TouchableOpacity 
                  style={styles.createFirstLessonButton}
                  onPress={handleAddLesson}
                >
                  <Text style={styles.createFirstLessonText}>Create First Lesson</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.lessonsList}>
              {/* List of lessons would go here */}
            </View>
          )}
        </View>
        
        {/* Action Buttons (for facilitators only) */}
        {isFacilitator && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => setEditModalVisible(true)}
            >
              <Edit2 size={18} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Edit Unit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDeleteUnit}
            >
              <Trash2 size={18} color={COLORS.secondary} />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Edit Unit Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Unit</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setEditModalVisible(false)}
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
                  value={editingUnit.title}
                  onChangeText={(text) => setEditingUnit(prev => ({ ...prev, title: text }))}
                  placeholder="Enter unit title"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={editingUnit.description}
                  onChangeText={(text) => setEditingUnit(prev => ({ ...prev, description: text }))}
                  placeholder="Enter unit description"
                  multiline={true}
                  numberOfLines={4}
                />
              </View>
              
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Published</Text>
                <Switch
                  value={editingUnit.is_published}
                  onValueChange={(value) => setEditingUnit(prev => ({ ...prev, is_published: value }))}
                  trackColor={{ false: '#E5E7EB', true: 'rgba(76, 175, 80, 0.4)' }}
                  thumbColor={editingUnit.is_published ? COLORS.primary : '#F3F4F6'}
                />
              </View>
              
              <View style={styles.buttonContainer}>
                <Button
                  title="Cancel"
                  onPress={() => setEditModalVisible(false)}
                  variant="outline"
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Update Unit"
                  onPress={handleEditUnit}
                  variant="primary"
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    padding: 20,
    paddingTop: 60,
  },
  headerContainer: {
    marginBottom: 24,
  },
  breadcrumb: {
    marginBottom: 8,
  },
  breadcrumbText: {
    fontSize: 14,
    color: COLORS.lightText,
  },
  unitTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  publishedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  publishedText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  draftBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  draftText: {
    color: COLORS.lightText,
    fontSize: 12,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  lessonsContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  noLessonsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  noLessonsText: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 16,
    color: COLORS.lightText,
  },
  createFirstLessonButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createFirstLessonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  lessonsList: {
    marginTop: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 120,
  },
  editButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
  },
});
