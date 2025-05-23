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
  Switch,
  Alert
} from 'react-native';
import { ArrowLeft, Edit2, Trash2, Plus, Video, Book, FileText, X, ChevronUp, ChevronDown } from 'lucide-react-native';
import { useAuth } from '../../navigation/AuthContext';
import Button from '../../components/Button';
import { showAlert } from '../../components/BeautifulAlert';
import { fetchUnitById, updateUnit, deleteUnit } from '../../services/api/unitService';
import { fetchCourseById } from '../../services/api/courseService';
import { fetchLessonsByUnit, deleteLesson, reorderUnitLessons } from '../../services/api/lessonService';
import LessonList from '../../components/lessons/LessonList';
import LessonModal from '../../components/lessons/LessonModal';

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
  const [lessonLoading, setLessonLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [lessonModalVisible, setLessonModalVisible] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [reorderedLessons, setReorderedLessons] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [editingLesson, setEditingLesson] = useState(null);
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
      
      // Fetch lessons for this unit
      await loadLessons(unitData.id);
      
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
  
  const loadLessons = async (unitId) => {
    try {
      setLessonLoading(true);
      
      // Fetch lessons (include unpublished if user is a facilitator)
      const lessonsData = await fetchLessonsByUnit(unitId, isFacilitator);
      setLessons(lessonsData);
      
      setLessonLoading(false);
    } catch (error) {
      console.error('Error loading lessons:', error);
      showAlert('error', 'Error', 'Failed to load lessons', [
        { text: 'OK', primary: true }
      ]);
      setLessonLoading(false);
    }
  };
  
  // Handle creating a new lesson
  const handleCreateLesson = () => {
    setEditingLesson(null);
    setLessonModalVisible(true);
  };
  
  // Handle editing an existing lesson
  const handleEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonModalVisible(true);
  };
  
  // Handle lesson created callback
  const handleLessonCreated = (newLesson) => {
    setLessons(prevLessons => [...prevLessons, newLesson]);
  };
  
  // Handle lesson updated callback
  const handleLessonUpdated = (updatedLesson) => {
    setLessons(prevLessons =>
      prevLessons.map(lesson =>
        lesson.id === updatedLesson.id ? updatedLesson : lesson
      )
    );
  };
  
  // Handle deleting a lesson
  const handleDeleteLesson = (lesson) => {
    showAlert('warning', 'Confirm Delete', 'Are you sure you want to delete this lesson? This action cannot be undone.', [
      {
        text: 'Cancel',
        style: 'cancel'
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteLesson(lesson.id);
            
            // Remove the lesson from the local state
            setLessons(prevLessons => prevLessons.filter(l => l.id !== lesson.id));
            
            // Show success message
            showAlert('success', 'Success', 'Lesson deleted successfully', [
              { text: 'OK', primary: true }
            ]);
          } catch (error) {
            console.error('Error deleting lesson:', error);
            showAlert('error', 'Error', 'Failed to delete lesson', [
              { text: 'OK', primary: true }
            ]);
          }
        }
      }
    ]);
  };
  
  // Handle entering/exiting reorder mode
  const toggleReorderMode = () => {
    if (isReorderMode) {
      // If exiting reorder mode, reset reordered lessons
      setIsReorderMode(false);
    } else {
      // If entering reorder mode, initialize with current lessons
      setReorderedLessons([...lessons]);
      setIsReorderMode(true);
    }
  };
  
  // Handle moving a lesson up in the order
  const handleMoveUp = (index) => {
    if (index > 0) {
      const newOrder = [...reorderedLessons];
      const temp = newOrder[index];
      newOrder[index] = newOrder[index - 1];
      newOrder[index - 1] = temp;
      setReorderedLessons(newOrder);
    }
  };
  
  // Handle moving a lesson down in the order
  const handleMoveDown = (index) => {
    if (index < reorderedLessons.length - 1) {
      const newOrder = [...reorderedLessons];
      const temp = newOrder[index];
      newOrder[index] = newOrder[index + 1];
      newOrder[index + 1] = temp;
      setReorderedLessons(newOrder);
    }
  };
  
  // Handle saving the new lesson order
  const saveReorderedLessons = async () => {
    try {
      setLessonLoading(true);
      
      // Call the API with reordered lesson IDs
      const lessonIds = reorderedLessons.map(lesson => lesson.id);
      const updatedLessons = await reorderUnitLessons(unit.id, lessonIds);
      
      // Update local state and exit reorder mode
      setLessons(updatedLessons);
      setIsReorderMode(false);
      setLessonLoading(false);
      
      // Show success message
      showAlert('success', 'Success', 'Lesson order updated successfully', [
        { text: 'OK', primary: true }
      ]);
    } catch (error) {
      console.error('Error saving lesson order:', error);
      setLessonLoading(false);
      showAlert('error', 'Error', 'Failed to update lesson order', [
        { text: 'OK', primary: true }
      ]);
    }
  };
  
  // Handle navigating to a lesson's details
  const handleLessonPress = (lesson) => {
    navigation.navigate('LessonDetails', { lessonId: lesson.id });
  };
  
  // Render the list of lessons
  const renderLessonsList = () => {
    if (lessonLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      );
    }
    
    if (isReorderMode) {
      return (
        <View>
          {reorderedLessons.map((lesson, index) => (
            <View key={lesson.id} style={styles.reorderItem}>
              <View style={styles.reorderItemContent}>
                <View style={styles.reorderIconContainer}>
                  {lesson.lesson_type === 'video' ? (
                    <Video size={20} color={COLORS.primary} />
                  ) : (
                    <FileText size={20} color={COLORS.primary} />
                  )}
                </View>
                <Text style={styles.reorderItemTitle} numberOfLines={1}>
                  {lesson.title}
                </Text>
              </View>
              <View style={styles.reorderButtons}>
                <TouchableOpacity
                  style={styles.reorderButton}
                  onPress={() => handleMoveUp(index)}
                  disabled={index === 0}
                >
                  <ChevronUp 
                    size={20} 
                    color={index === 0 ? '#D1D5DB' : COLORS.text} 
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.reorderButton}
                  onPress={() => handleMoveDown(index)}
                  disabled={index === reorderedLessons.length - 1}
                >
                  <ChevronDown 
                    size={20} 
                    color={index === reorderedLessons.length - 1 ? '#D1D5DB' : COLORS.text} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      );
    }
    
    return (
      <LessonList
        lessons={lessons}
        onLessonPress={handleLessonPress}
        onEditPress={handleEditLesson}
        onDeletePress={handleDeleteLesson}
        isFacilitator={isFacilitator}
      />
    );
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
  
  // Render the edit unit modal
  const renderEditUnitModal = () => {
    return (
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
              contentContainerStyle={styles.modalScrollContent}
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
                  type="secondary"
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Update Unit"
                  onPress={handleEditUnit}
                  type="primary"
                  style={{ flex: 1, marginLeft: 8 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };
  
  // Render lesson modal
  const renderLessonModal = () => {
    return (
      <LessonModal
        visible={lessonModalVisible}
        onClose={() => setLessonModalVisible(false)}
        unitId={unit?.id}
        onLessonCreated={handleLessonCreated}
        onLessonUpdated={handleLessonUpdated}
        editingLesson={editingLesson}
      />
    );
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
          
          {/* Published/Draft Badge */}
          {unit.is_published ? (
            <View style={styles.publishedBadge}>
              <Text style={styles.publishedText}>Published</Text>
            </View>
          ) : (
            <View style={styles.draftBadge}>
              <Text style={styles.draftText}>Draft - Not visible to learners</Text>
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
        <View style={styles.contentSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lessons</Text>
            
            {/* Action buttons for lessons (facilitators only) */}
            {isFacilitator && (
              <View style={styles.lessonActions}>
                {isReorderMode ? (
                  <TouchableOpacity 
                    style={styles.saveReorderButton}
                    onPress={saveReorderedLessons}
                  >
                    <Text style={styles.saveReorderButtonText}>Save Order</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.addLessonButton}
                    onPress={handleCreateLesson}
                  >
                    <Plus size={18} color="#FFF" />
                    <Text style={styles.addLessonButtonText}>Add Lesson</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
          
          {/* Lessons List */}
          <View style={styles.lessonsList}>
            {renderLessonsList()}
          </View>
        </View>

        {/* Action Buttons (for facilitators only) */}
        {isFacilitator && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setEditModalVisible(true)}
            >
              <Edit2 size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Edit Unit</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDeleteUnit}
            >
              <Trash2 size={20} color={COLORS.secondary} />
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
            
            {/* Only show the reorder toggle if there are lessons */}
            {lessons.length > 1 && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={toggleReorderMode}
              >
                <Text style={styles.reorderButtonText}>
                  {isReorderMode ? 'Cancel' : 'Reorder'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
      
      {/* Edit Unit Modal */}
      {renderEditUnitModal()}
      
      {/* Lesson Create/Edit Modal */}
      {renderLessonModal()}
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
  contentSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
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
  lessonActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addLessonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addLessonButtonText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '500',
    fontSize: 14,
  },
  lessonsList: {
    minHeight: 100,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    backgroundColor: '#F3F4F6',
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
  reorderButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  saveReorderButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveReorderButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  reorderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reorderItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reorderIconContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    marginRight: 10,
  },
  reorderItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  reorderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reorderButton: {
    padding: 6,
    marginLeft: 4,
  },
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
  modalScrollContent: {
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
