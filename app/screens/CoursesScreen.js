import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Clock, Users2, Plus } from 'lucide-react-native';
import { useAuth } from '../navigation/AuthContext';
import { supabase } from '../services/supabase';
import Button from '../components/Button';
import { useFocusEffect } from '@react-navigation/native';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

export default function CoursesScreen({ navigation }) {
  const { userProfile, refreshProfile } = useAuth();
  const [courses, setCourses] = useState({
    cambridge: [],
    sat: [],
    ielts: [],
  });
  const [loading, setLoading] = useState(true);
  const [profileRefreshing, setProfileRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Keep the form state separate from the component state to prevent rerenders
  const [newCourse, setNewCourse] = useState({
    title: '',
    duration: '',
    curriculum: 'cambridge', // Default curriculum
    image: 'https://images.unsplash.com/photo-1581544291234-d2d469dc9922?q=80&w=1974&auto=format', // Default image
  });

  // Check if user is a facilitator
  const isFacilitator = userProfile?.user_group === 'facilitator';

  // Fetch courses when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('CoursesScreen focused, refreshing course data');
      fetchCourses();
      return () => {};
    }, [])
  );

  // Fetch courses first, then check profile status
  useEffect(() => {
    console.log('CoursesScreen mounted - current user group:', userProfile?.user_group);
    fetchCourses();
    
    // Only attempt profile refresh if we need it (i.e., not a facilitator when we should be)
    if (userProfile && userProfile.user_id && !isFacilitator && !profileRefreshing) {
      console.log('CoursesScreen - refreshing profile to check facilitator status');
      setProfileRefreshing(true);
      // Small timeout to ensure UI is responsive first
      setTimeout(() => {
        refreshProfile()
          .finally(() => setProfileRefreshing(false));
      }, 500);
    }
  }, []);

  // Get curriculum display names based on screen width
  const [screenWidth, setScreenWidth] = useState(0);
  useEffect(() => {
    // Get initial screen dimensions
    const { width } = require('react-native').Dimensions.get('window');
    setScreenWidth(width);
    
    // Listen for dimension changes
    const dimensionsListener = require('react-native').Dimensions.addEventListener(
      'change', 
      ({ window }) => {
        setScreenWidth(window.width);
      }
    );
    
    return () => dimensionsListener?.remove?.();
  }, []);
  
  // Use abbreviated names on smaller screens
  const getCurriculumDisplay = (curriculum) => {
    if (screenWidth < 350) {
      // Very small screens
      const abbrs = {
        cambridge: 'CAMB',
        sat: 'SAT',
        ielts: 'IELTS'
      };
      return abbrs[curriculum] || curriculum.toUpperCase();
    } else {
      return curriculum.toUpperCase();
    }
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*');

      if (error) {
        throw error;
      }

      // Organize courses by curriculum
      const organizedCourses = {
        cambridge: [],
        sat: [],
        ielts: [],
      };

      if (data) {
        data.forEach(course => {
          if (organizedCourses[course.curriculum]) {
            organizedCourses[course.curriculum].push(course);
          }
        });
      }

      setCourses(organizedCourses);
    } catch (error) {
      console.error('Error fetching courses:', error.message);
      Alert.alert('Error', 'Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCoursePress = (courseId) => {
    navigation.navigate('CourseDetails', { courseId });
  };

  const handleCreateCourse = async () => {
    if (!newCourse.title.trim()) {
      Alert.alert('Error', 'Please enter a course title');
      return;
    }

    if (!newCourse.duration.trim()) {
      Alert.alert('Error', 'Please enter a course duration');
      return;
    }

    try {
      setLoading(true);
      
      // Create new course in database
      const { data, error } = await supabase
        .from('courses')
        .insert([
          {
            title: newCourse.title,
            duration: newCourse.duration,
            curriculum: newCourse.curriculum,
            image: newCourse.image,
            created_by: userProfile.user_id,
            students: 0, // New course starts with 0 students
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      // Reset form and close modal
      setNewCourse({
        title: '',
        duration: '',
        curriculum: 'cambridge',
        image: 'https://images.unsplash.com/photo-1581544291234-d2d469dc9922?q=80&w=1974&auto=format',
      });
      setModalVisible(false);
      
      // Refresh courses list
      fetchCourses();
      
      Alert.alert('Success', 'Course created successfully!');
    } catch (error) {
      console.error('Error creating course:', error.message);
      Alert.alert('Error', 'Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Course card component
  const CourseCard = ({ course }) => (
    <TouchableOpacity 
      style={styles.courseCard}
      onPress={() => handleCoursePress(course.id)}
    >
      <Image 
        source={{ uri: course.image }} 
        style={styles.courseImage}
        resizeMode="cover"
      />
      <View style={styles.courseContent}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <View style={styles.courseMetaContainer}>
          <View style={styles.metaItem}>
            <Clock size={16} color={COLORS.lightText} />
            <Text style={styles.metaText}>{course.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Users2 size={16} color={COLORS.lightText} />
            <Text style={styles.metaText}>{course.students || 0} students</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Course creation modal
  const CreateCourseModal = () => {
    // Use local state for form inputs to prevent parent re-renders
    const [localFormState, setLocalFormState] = useState({
      title: newCourse.title,
      duration: newCourse.duration,
      curriculum: newCourse.curriculum,
    });
    
    // Update parent state only when form is submitted
    const handleSubmit = async () => {
      // First update the parent state with local values
      setNewCourse({
        ...newCourse,
        title: localFormState.title,
        duration: localFormState.duration,
        curriculum: localFormState.curriculum,
      });
      
      // Then call the create function with the updated values
      if (!localFormState.title.trim()) {
        Alert.alert('Error', 'Please enter a course title');
        return;
      }

      if (!localFormState.duration.trim()) {
        Alert.alert('Error', 'Please enter a course duration');
        return;
      }

      try {
        setLoading(true);
        
        // Create new course in database
        const { data, error } = await supabase
          .from('courses')
          .insert([
            {
              title: localFormState.title,
              duration: localFormState.duration,
              curriculum: localFormState.curriculum,
              image: newCourse.image,
              created_by: userProfile.user_id,
              students: 0, // New course starts with 0 students
            }
          ])
          .select();

        if (error) {
          throw error;
        }

        // Reset form and close modal
        setLocalFormState({
          title: '',
          duration: '',
          curriculum: 'cambridge',
        });
        setNewCourse({
          ...newCourse,
          title: '',
          duration: '',
          curriculum: 'cambridge',
        });
        setModalVisible(false);
        
        // Refresh courses list
        fetchCourses();
        
        Alert.alert('Success', 'Course created successfully!');
      } catch (error) {
        console.error('Error creating course:', error.message);
        Alert.alert('Error', 'Failed to create course. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    // Reset local state when modal is closed
    useEffect(() => {
      if (modalVisible) {
        setLocalFormState({
          title: newCourse.title,
          duration: newCourse.duration,
          curriculum: newCourse.curriculum,
        });
      }
    }, [modalVisible]);
    
    return (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create New Course</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Course Title</Text>
            <TextInput
              style={styles.input}
                value={localFormState.title}
                onChangeText={(text) => setLocalFormState({...localFormState, title: text})}
              placeholder="Enter course title"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Duration</Text>
            <TextInput
              style={styles.input}
                value={localFormState.duration}
                onChangeText={(text) => setLocalFormState({...localFormState, duration: text})}
              placeholder="e.g., 8 weeks"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Curriculum</Text>
            <View style={styles.curriculumButtons}>
              {['cambridge', 'sat', 'ielts'].map(curriculum => (
                <TouchableOpacity
                  key={curriculum}
                  style={[
                    styles.curriculumButton,
                      localFormState.curriculum === curriculum && styles.selectedCurriculum
                  ]}
                    onPress={() => setLocalFormState({...localFormState, curriculum})}
                >
                  <Text 
                    style={[
                      styles.curriculumButtonText,
                        localFormState.curriculum === curriculum && styles.selectedCurriculumText
                    ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.7}
                  >
                      {getCurriculumDisplay(curriculum)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.modalButtons}>
            <Button
              title="Cancel"
              onPress={() => setModalVisible(false)}
              variant="outline"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Create Course"
                onPress={handleSubmit}
              variant="primary"
              loading={loading}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.heading}>Available Courses</Text>
          <Text style={styles.subheading}>Choose your learning path</Text>

          {/* Cambridge Programs Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Cambridge Programs</Text>
            {courses.cambridge.length > 0 ? (
              courses.cambridge.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <Text style={styles.emptyCourses}>No Cambridge courses available</Text>
            )}
          </View>

          {/* SAT Preparation Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>SAT Preparation</Text>
            {courses.sat.length > 0 ? (
              courses.sat.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <Text style={styles.emptyCourses}>No SAT courses available</Text>
            )}
          </View>

          {/* IELTS Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>IELTS Preparation</Text>
            {courses.ielts.length > 0 ? (
              courses.ielts.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <Text style={styles.emptyCourses}>No IELTS courses available</Text>
            )}
          </View>
        </View>
      </ScrollView>
      
      {/* Create Course Button (only visible for facilitators) */}
      {isFacilitator && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      )}
      
      {/* Create Course Modal */}
      <CreateCourseModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  emptyCourses: {
    color: COLORS.lightText,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
  courseCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseImage: {
    width: '100%',
    height: 180,
  },
  courseContent: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
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
    marginLeft: 6,
    color: COLORS.lightText,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  curriculumButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  curriculumButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    minHeight: 44,
    justifyContent: 'center',
  },
  selectedCurriculum: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  curriculumButtonText: {
    color: COLORS.text,
    fontWeight: '500',
    fontSize: 13,
    textAlign: 'center',
  },
  selectedCurriculumText: {
    color: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
}); 