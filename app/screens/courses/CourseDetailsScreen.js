import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Modal, ActivityIndicator, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Clock, Users2, Edit2, Trash2, ArrowLeft, FileText, Book, Plus, Video, LayoutList, Menu, Save, ChevronUp, ChevronDown } from 'lucide-react-native';
import { useAuth } from '../../navigation/AuthContext';
import Button from '../../components/Button';
import CourseForm from '../../components/courses/CourseForm';
import CreateUnitModal from '../../components/units/CreateUnitModal';
import { showAlert } from '../../components/BeautifulAlert';
import { fetchCourseById, updateCourse, deleteCourse } from '../../services/api/courseService';
import { fetchUnitsByCourse, reorderCourseUnits } from '../../services/api/unitService';

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
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [createUnitModalVisible, setCreateUnitModalVisible] = useState(false);
  const [unitLoading, setUnitLoading] = useState(false);
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [reorderedUnits, setReorderedUnits] = useState([]);
  const [editCourse, setEditCourse] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    image: null
  });
  
  const windowWidth = Dimensions.get('window').width;
  const isFacilitator = hasRole('facilitator');
  
  useEffect(() => {
    loadCourseDetails();
    loadCourseUnits();
  }, [courseId]);
  
  // Reload units data when the screen comes into focus (after returning from UnitDetails)
  useFocusEffect(
    useCallback(() => {
      loadCourseUnits();
    }, [])
  );
  
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
        level: courseData.level || 'Beginner',
        image: courseData.image || null
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading course details:', error);
      showAlert('error', 'Error', 'Failed to load course details', [
        { text: 'OK', primary: true }
      ]);
      setLoading(false);
    }
  };
  
  const loadCourseUnits = async () => {
    try {
      setUnitLoading(true);
      // Pass showDrafts=true for facilitators so they can see all units including drafts
      const unitsData = await fetchUnitsByCourse(courseId, isFacilitator);
      setUnits(unitsData);
      setUnitLoading(false);
    } catch (error) {
      console.error('Error loading course units:', error);
      showAlert('error', 'Error', 'Failed to load course units', [
        { text: 'OK', primary: true }
      ]);
      setUnitLoading(false);
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
      showAlert('success', 'Success', 'Course updated successfully', [
        { text: 'OK', primary: true }
      ]);
    } catch (error) {
      console.error('Error updating course:', error);
      showAlert('error', 'Error', 'Failed to update course', [
        { text: 'OK', primary: true }
      ]);
    }
  };
  
  const handleDeleteCourse = () => {
    showAlert('warning', 'Confirm Delete', 'Are you sure you want to delete this course? This action cannot be undone.', [
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
            showAlert('success', 'Success', 'Course deleted successfully', [
              { text: 'OK', primary: true }
            ]);
          } catch (error) {
            console.error('Error deleting course:', error);
            showAlert('error', 'Error', 'Failed to delete course', [
              { text: 'OK', primary: true }
            ]);
          }
        }
      }
    ]);
  };
  
  // Handle when a new unit is created
  const handleUnitCreated = (newUnit) => {
    // Add the new unit to the list and refresh units
    loadCourseUnits();
  };
  
  // Handle entering/exiting reorder mode
  const toggleReorderMode = () => {
    if (isReorderMode) {
      // If we're exiting reorder mode, reset the reordered units
      setIsReorderMode(false);
    } else {
      // If we're entering reorder mode, initialize reorderedUnits with current units
      setReorderedUnits([...units]);
      setIsReorderMode(true);
    }
  };
  
  // Handle saving the new unit order
  const saveUnitOrder = async () => {
    try {
      setUnitLoading(true);
      // Call the API with the reordered unit IDs
      const unitIds = reorderedUnits.map(unit => unit.id);
      const updatedUnits = await reorderCourseUnits(courseId, unitIds);
      
      // Update the units with the response and exit reorder mode
      setUnits(updatedUnits);
      setIsReorderMode(false);
      setUnitLoading(false);
      
      // Show success message
      showAlert('success', 'Success', 'Unit order updated successfully', [
        { text: 'OK', primary: true }
      ]);
    } catch (error) {
      console.error('Error saving unit order:', error);
      setUnitLoading(false);
      showAlert('error', 'Error', 'Failed to update unit order', [
        { text: 'OK', primary: true }
      ]);
    }
  };
  
  // Handle moving a unit up in order
  const moveUnitUp = async (unitId, currentIndex) => {
    if (currentIndex === 0) return; // Already at the top
    
    try {
      setUnitLoading(true);
      
      // Get the unit above this one
      const unitAbove = reorderedUnits[currentIndex - 1];
      
      // Swap positions
      const newUnits = [...reorderedUnits];
      newUnits[currentIndex - 1] = reorderedUnits[currentIndex];
      newUnits[currentIndex] = unitAbove;
      
      setReorderedUnits(newUnits);
      setUnitLoading(false);
    } catch (error) {
      console.error('Error moving unit up:', error);
      setUnitLoading(false);
    }
  };
  
  // Handle moving a unit down in order
  const moveUnitDown = async (unitId, currentIndex) => {
    if (currentIndex === reorderedUnits.length - 1) return; // Already at the bottom
    
    try {
      setUnitLoading(true);
      
      // Get the unit below this one
      const unitBelow = reorderedUnits[currentIndex + 1];
      
      // Swap positions
      const newUnits = [...reorderedUnits];
      newUnits[currentIndex + 1] = reorderedUnits[currentIndex];
      newUnits[currentIndex] = unitBelow;
      
      setReorderedUnits(newUnits);
      setUnitLoading(false);
    } catch (error) {
      console.error('Error moving unit down:', error);
      setUnitLoading(false);
    }
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
  
  // Render create unit modal
  const renderCreateUnitModal = () => {
    return (
      <CreateUnitModal
        visible={createUnitModalVisible}
        courseId={courseId}
        onClose={() => setCreateUnitModalVisible(false)}
        onUnitCreated={handleUnitCreated}
      />
    );
  };
  
  // Render units list
  const renderUnitsList = () => {
    if (unitLoading) {
      return (
        <View style={styles.unitLoadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.unitLoadingText}>Loading units...</Text>
        </View>
      );
    }
    
    if (units.length === 0) {
      return (
        <View style={styles.noUnitsContainer}>
          <LayoutList size={48} color="#E5E7EB" />
          <Text style={styles.noUnitsText}>No units added yet</Text>
        </View>
      );
    }
    
    // If we're in reorder mode, show the reorderable list
    if (isReorderMode) {
      return (
        <View style={styles.unitsList}>
          {reorderedUnits.map((unit, index) => (
            <View key={unit.id} style={[styles.unitCard, styles.unitCardReorder]}>
              <View style={styles.unitCardContent}>
                <View style={styles.unitCardHeader}>
                  <Text style={styles.unitIndex}>{index + 1}</Text>
                  <View style={styles.unitTitleContainer}>
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
                </View>
                
                {unit.description ? (
                  <Text style={styles.unitDescription} numberOfLines={2}>
                    {unit.description}
                  </Text>
                ) : null}
              </View>
              
              <View style={styles.reorderControls}>
                <TouchableOpacity 
                  style={[styles.reorderButton, index === 0 && styles.buttonDisabled]}
                  onPress={() => moveUnitUp(unit.id, index)}
                  disabled={index === 0}
                >
                  <ChevronUp size={20} color={index === 0 ? COLORS.lightText : COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.reorderButton, index === reorderedUnits.length - 1 && styles.buttonDisabled]}
                  onPress={() => moveUnitDown(unit.id, index)}
                  disabled={index === reorderedUnits.length - 1}
                >
                  <ChevronDown size={20} color={index === reorderedUnits.length - 1 ? COLORS.lightText : COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      );
    }
    
    // Regular mode (non-reordering)
    return (
      <View style={styles.unitsList}>
        {units.map((unit, index) => (
          <TouchableOpacity 
            key={unit.id} 
            style={styles.unitCard}
            onPress={() => navigation.navigate('UnitDetails', { unitId: unit.id })}
          >
            <View style={styles.unitCardContent}>
              <View style={styles.unitCardHeader}>
                <Text style={styles.unitIndex}>{unit.order_position + 1}</Text>
                <View style={styles.unitTitleContainer}>
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
              </View>
              
              {unit.description ? (
                <Text style={styles.unitDescription} numberOfLines={2}>
                  {unit.description}
                </Text>
              ) : null}
            </View>
            
            <View style={styles.unitCardFooter}>
              <View style={styles.unitCardStatus}>
                <Video size={16} color={COLORS.lightText} />
                <Text style={styles.unitCardStatusText}>0 lessons</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
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
      <ScrollView contentContainerStyle={styles.mainContainer}>
        {/* Course Image Container */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: course.image || 'https://via.placeholder.com/800x450?text=No+Image' }} 
            style={styles.courseImage}
            resizeMode="cover"
          />
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        
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
          
          {/* Course Units */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Course Units</Text>
              {isFacilitator && (
                <View style={styles.unitHeaderActions}>
                  {isReorderMode ? (
                    /* Save Order Button */
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={saveUnitOrder}
                    >
                      <Save size={18} color={COLORS.primary} />
                      <Text style={styles.actionButtonSmallText}>Save Order</Text>
                    </TouchableOpacity>
                  ) : (
                    /* Reorder Button */
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={toggleReorderMode}
                      disabled={units.length < 2}
                    >
                      <Menu size={18} color={COLORS.primary} />
                      <Text style={styles.actionButtonSmallText}>Reorder</Text>
                    </TouchableOpacity>
                  )}
                  
                  {/* Add Unit Button */}
                  <TouchableOpacity 
                    style={[styles.addButton, isReorderMode && styles.buttonDisabled]}
                    onPress={() => setCreateUnitModalVisible(true)}
                    disabled={isReorderMode}
                  >
                    <Plus size={18} color={isReorderMode ? COLORS.lightText : COLORS.primary} />
                    <Text style={[styles.addButtonText, isReorderMode && styles.textDisabled]}>Add Unit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            
            {isReorderMode && units.length > 1 && (
              <View style={styles.reorderInstructions}>
                <Text style={styles.reorderInstructionsText}>Use the up and down arrows to reorder units. Tap Save when done.</Text>
              </View>
            )}
            
            {renderUnitsList()}
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
      
      {/* Create Unit Modal */}
      {renderCreateUnitModal()}
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
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  mainContainer: {
    flexGrow: 1,
    padding: 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  courseImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#E5E7EB',
  },
  courseContentContainer: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
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
    fontSize: 14,
    color: COLORS.secondary,
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
  
  // Unit section styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  unitLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  unitLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.lightText,
  },
  noUnitsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  noUnitsText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.lightText,
  },
  unitsList: {
    marginTop: 8,
  },
  unitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  unitCardContent: {
    padding: 16,
  },
  unitCardReorder: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 0,
  },
  unitCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  unitIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
    fontWeight: '600',
    fontSize: 14,
  },
  unitTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  unitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  reorderControls: {
    flexDirection: 'column',
    justifyContent: 'center',
    paddingRight: 8,
  },
  reorderButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    marginVertical: 4,
  },
  unitDescription: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 4,
    paddingLeft: 36,
  },
  unitCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  unitCardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unitCardStatusText: {
    fontSize: 14,
    color: COLORS.lightText,
    marginLeft: 6,
  },
  publishedBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  publishedText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
  },
  draftBadge: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  draftText: {
    color: COLORS.lightText,
    fontSize: 12,
    fontWeight: '500',
  },
  unitHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  actionButtonSmallText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  textDisabled: {
    color: COLORS.lightText,
  },
  reorderInstructions: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  reorderInstructionsText: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
  },
});
