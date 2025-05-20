import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Modal, TextInput, ActivityIndicator, Platform } from 'react-native';
import { X, Upload } from 'lucide-react-native';
import { showAlert } from '../components/BeautifulAlert';
import { Clock, Users2, Plus, BookOpen, GraduationCap, School, ChevronRight, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
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

// We don't need a custom input component

export default function CoursesScreen({ navigation }) {
  const { userProfile, refreshProfile, hasRole } = useAuth();
  // State for the hierarchical structure
  const [curriculums, setCurriculums] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  
  // Track current selections
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  // State for view control
  const [currentView, setCurrentView] = useState('curriculums'); // 'curriculums', 'subjects', 'courses'
  const [loading, setLoading] = useState(true);
  const [profileRefreshing, setProfileRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);
  
  // State for new subject creation
  const [newSubject, setNewSubject] = useState({
    name: '',
    description: '',
    curriculum_id: null  // Add curriculum_id to track which curriculum this subject belongs to
  });
  
  // Keep the form state separate from the component state to prevent rerenders
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    image: null, // Will be set when user uploads an image
    subject_id: null
  });
  
  // State for thumbnail handling
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Check if user is a facilitator or admin
  const isFacilitator = hasRole('facilitator') || hasRole('admin');

  // Fetch data when the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('CoursesScreen focused, refreshing data');
      fetchCurriculums();
      return () => {};
    }, [])
  );

  // Initial data loading on component mount
  useEffect(() => {
    console.log('CoursesScreen mounted - current user group:', userProfile?.user_group);
    fetchCurriculums();
    
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
  
  // Effect to fetch subjects when curriculum is selected
  useEffect(() => {
    if (selectedCurriculum) {
      fetchSubjectsByCurriculum(selectedCurriculum.id);
    }
  }, [selectedCurriculum]);
  
  // Effect to fetch courses when subject is selected
  useEffect(() => {
    if (selectedSubject) {
      fetchCoursesBySubject(selectedSubject.id);
    }
  }, [selectedSubject]);

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

  // Fetch curriculums based on user role and associations
  const fetchCurriculums = async () => {
    try {
      setLoading(true);
      setCurrentView('curriculums');
      
      // If user is admin, show all curriculums
      if (hasRole('admin')) {
        console.log('User is admin - showing all curriculums');
        const { data, error } = await supabase
          .from('curriculums')
          .select('*')
          .order('name');

        if (error) throw error;
        setCurriculums(data || []);
      } 
      // Otherwise, only show curriculums the user is associated with
      else {
        console.log('Fetching user\'s associated curriculums');
        // Get curriculums from user_curriculums table
        const { data: userCurriculums, error } = await supabase
          .from('user_curriculums')
          .select('curriculum:curriculum_id(*)')
          .eq('user_id', userProfile.user_id);

        if (error) throw error;
        
        // Extract curriculum details and format the data
        const userCurriculumsData = userCurriculums
          .filter(item => item.curriculum) // Filter out any null items
          .map(item => item.curriculum);
          
        console.log('User curriculums:', JSON.stringify(userCurriculumsData));
        setCurriculums(userCurriculumsData || []);
      }
      
      setSelectedCurriculum(null);
      setSelectedSubject(null);
    } catch (error) {
      console.error('Error fetching curriculums:', error.message);
      showAlert('error', 'Error', 'Failed to load curriculums. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch subjects for a specific curriculum (Math, English, etc.)
  const fetchSubjectsByCurriculum = async (curriculumId) => {
    try {
      setLoading(true);
      setCurrentView('subjects');
      
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('curriculum_id', curriculumId)
        .order('name');

      if (error) {
        throw error;
      }

      setSubjects(data || []);
      setSelectedSubject(null);
    } catch (error) {
      console.error('Error fetching subjects:', error.message);
      showAlert('error', 'Error', 'Failed to load subjects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch courses for a specific subject
  const fetchCoursesBySubject = async (subjectId) => {
    try {
      setLoading(true);
      setCurrentView('courses');
      
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('subject_id', subjectId)
        .order('title');

      if (error) {
        throw error;
      }

      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error.message);
      showAlert('error', 'Error', 'Failed to load courses. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCurriculumPress = (curriculum) => {
    setSelectedCurriculum(curriculum);
  };
  
  const handleSubjectPress = (subject) => {
    setSelectedSubject(subject);
  };
  
  const handleCoursePress = (course) => {
    navigation.navigate('CourseDetails', { courseId: course.id, courseTitle: course.title });
  };
  
  const handleBackNavigation = () => {
    if (currentView === 'courses') {
      setCurrentView('subjects');
      setSelectedSubject(null);
    } else if (currentView === 'subjects') {
      setCurrentView('curriculums');
      setSelectedCurriculum(null);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourse.title.trim()) {
      showAlert('error', 'Error', 'Please enter a course title');
      return;
    }

    if (!newCourse.subject_id) {
      showAlert('error', 'Error', 'Please select a subject for this course');
      return;
    }

    try {
      setLoading(true);
      
      // Create new course in database with the subject_id
      const { data, error } = await supabase
        .from('courses')
        .insert([
          {
            title: newCourse.title,
            description: newCourse.description,
            level: newCourse.level,
            subject_id: selectedSubject.id,
            image: newCourse.image,
            created_by: userProfile.user_id
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      // Reset form and close modal
      setNewCourse({
        title: '',
        description: '',
        level: 'Beginner',
        image: 'https://images.unsplash.com/photo-1581544291234-d2d469dc9922?q=80&w=1974&auto=format',
        subject_id: null
      });
      setModalVisible(false);
      
      // Refresh courses list
      fetchCoursesBySubject(selectedSubject.id);
      
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

  // Function that creates subject with the provided data
  const handleCreateSubjectWithData = async (subjectData) => {
    // Log the data being processed
    console.log('Creating subject with data:', subjectData);
    
    if (!subjectData.name || !subjectData.name.trim()) {
      showAlert('error', 'Error', 'Please enter a subject name');
      return;
    }

    if (!subjectData.curriculum_id) {
      showAlert('error', 'Error', 'Please select a curriculum first');
      return;
    }
    
    // Rest of the function uses the passed data
  
    try {
      setLoading(true);
      
      // Create new subject in database
      const { data, error } = await supabase
        .from('subjects')
        .insert([
          {
            name: subjectData.name,
            description: subjectData.description,
            curriculum_id: subjectData.curriculum_id
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      // Keep the modal data intact while closing
      // We'll use a two-step process to prevent flashing:
      // 1. Close the modal first without changing any data
      // 2. Only reset the form data after the modal is completely gone
      
      // Step 1: Close the modal
      setSubjectModalVisible(false);
      
      // Step 2: Only reset form state after modal is fully closed
      // This longer timeout ensures the modal is completely gone before form reset
      setTimeout(() => {
        setNewSubject({
          name: '',
          description: '',
          curriculum_id: null
        });
      }, 500); // Increased timeout to ensure modal is fully gone
      
      // Refresh subjects list if we're in subjects view
      if (currentView === 'subjects' && selectedCurriculum) {
        fetchSubjectsByCurriculum(selectedCurriculum.id);
      }
      
      showAlert('success', 'Success', 'Subject created successfully!', [
        {
          text: 'Great!',
          primary: true
        }
      ]);
    } catch (error) {
      console.error('Error creating subject:', error.message);
      showAlert('error', 'Error', 'Failed to create subject. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to create a new subject using current state
  const handleCreateSubject = async () => {
    // Call the data-based function with current state
    handleCreateSubjectWithData(newSubject);
  };
  
  // Subject creation modal
  const CreateSubjectModal = () => {
    // Use local state for form inputs
    const [localFormState, setLocalFormState] = useState({
      name: '',
      description: '',
      curriculum_id: newSubject.curriculum_id,
      curriculumName: ''
    });
    
    // Get curriculum name when modal opens
    useEffect(() => {
      const getCurriculumName = async () => {
        if (localFormState.curriculum_id) {
          try {
            const { data, error } = await supabase
              .from('curriculums')
              .select('name')
              .eq('id', localFormState.curriculum_id)
              .single();
              
            if (!error && data) {
              setLocalFormState(prev => ({
                ...prev,
                curriculumName: data.name
              }));
            }
          } catch (err) {
            console.error('Error fetching curriculum name:', err);
          }
        }
      };
      
      if (subjectModalVisible && localFormState.curriculum_id) {
        getCurriculumName();
      }
    }, [subjectModalVisible, localFormState.curriculum_id]);
    
    // Update parent state only when form is submitted
    const handleSubmit = () => {
      // First update the parent state with local values
      const updatedSubject = {
        name: localFormState.name,
        description: localFormState.description,
        curriculum_id: localFormState.curriculum_id
      };
      
      // Update the state
      setNewSubject(updatedSubject);
      
      // For debugging
      console.log('Form submitted with data:', updatedSubject);
      
      // Call the create function directly with the form data instead of using state
      // This prevents issues with state not being updated immediately
      handleCreateSubjectWithData(updatedSubject);
    };
    
    // Initialize local state only when modal opens (not when it closes)
    // This prevents the form from flashing with empty values while closing
    useEffect(() => {
      // Only reset form when opening the modal, not when closing
      if (subjectModalVisible) {
        setLocalFormState({
          name: '',
          description: '',
          curriculum_id: newSubject.curriculum_id,
          curriculumName: ''
        });
      }
      // We intentionally don't reset form data when modal closes
      // This prevents the form from flashing with empty fields during close animation
    }, [subjectModalVisible]);
    
    return (
      <Modal
        visible={subjectModalVisible}
        animationType="fade" /* Change to fade for smoother transition */
        transparent={true}
        onRequestClose={() => setSubjectModalVisible(false)}
        /* Add hardwareAccelerated for better performance on Android */
        hardwareAccelerated={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create New Subject</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Subject Name</Text>
              <TextInput
                style={styles.input}
                value={localFormState.name}
                onChangeText={(text) => setLocalFormState({...localFormState, name: text})}
                placeholder="Enter subject name (e.g., Mathematics)"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={localFormState.description}
                onChangeText={(text) => setLocalFormState({...localFormState, description: text})}
                placeholder="Enter subject description"
                multiline={true}
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Curriculum</Text>
              <Text style={styles.subjectInfo}>{localFormState.curriculumName || 'No curriculum selected'}</Text>
            </View>
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setSubjectModalVisible(false)}
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Create Subject"
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
  
  // Deleted duplicate function, using the one inside the CreateCourseModal
  
  // Helper function to render breadcrumb navigation
  const renderBreadcrumbs = () => {
    return (
      <View style={styles.breadcrumbs}>
        <TouchableOpacity 
          onPress={() => fetchCurriculums()}
          style={[styles.breadcrumbItem, currentView === 'curriculums' && styles.breadcrumbItemActive]}
        >
          <Text style={styles.breadcrumbText}>Curriculums</Text>
        </TouchableOpacity>
        
        {selectedCurriculum && (
          <>
            <Text style={styles.breadcrumbSeparator}>›</Text>
            <TouchableOpacity 
              onPress={() => currentView !== 'subjects' && handleBackNavigation()}
              style={[styles.breadcrumbItem, currentView === 'subjects' && styles.breadcrumbItemActive]}
            >
              <Text style={styles.breadcrumbText}>{selectedCurriculum.name}</Text>
            </TouchableOpacity>
          </>
        )}
        
        {selectedSubject && (
          <>
            <Text style={styles.breadcrumbSeparator}>›</Text>
            <TouchableOpacity 
              onPress={() => currentView === 'courses' && handleBackNavigation()}
              style={[styles.breadcrumbItem, currentView === 'courses' && styles.breadcrumbItemActive]}
            >
              <Text style={styles.breadcrumbText}>{selectedSubject.name}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };
  
  // Render a curriculum card
  const renderCurriculumCard = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.curriculumCard}
      onPress={() => handleCurriculumPress(item)}
    >
      <View style={styles.cardIconContainer}>
        <School size={32} color={COLORS.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description || `${item.name} curriculum and courses`}
        </Text>
      </View>
      <ChevronRight size={20} color={COLORS.lightText} />
    </TouchableOpacity>
  );

  // Render a subject card
  const renderSubjectCard = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.subjectCard}
      onPress={() => handleSubjectPress(item)}
    >
      <View style={styles.cardIconContainer}>
        <BookOpen size={28} color={COLORS.primary} />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description || `Courses for ${item.name}`}
        </Text>
      </View>
      <ChevronRight size={20} color={COLORS.lightText} />
    </TouchableOpacity>
  );

  // Render a course card
  const renderCourseCard = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.courseCard}
      onPress={() => handleCoursePress(item)}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.courseImage}
        resizeMode="cover"
      />
      <View style={styles.courseContent}>
        <Text style={styles.courseTitle}>{item.title}</Text>
        <View style={styles.courseMetaContainer}>
          <View style={styles.metaItem}>
            <GraduationCap size={16} color={COLORS.lightText} />
            <Text style={styles.metaText}>{item.level || 'Beginner'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
  
  // Local state for course form
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    image: null
  });
  
  // Reference to maintain course form state during image upload
  const courseFormRef = React.useRef({
    title: '',
    description: '',
    level: 'Beginner',
    image: null
  });
  
  // Reset course form when modal closes
  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      description: '',
      level: 'Beginner',
      image: null
    });
    courseFormRef.current = {
      title: '',
      description: '',
      level: 'Beginner',
      image: null
    };
    setThumbnailImage(null);
  };
  
  // Pick image without causing re-renders
  const pickImage = async () => {
    setUploadingImage(true);
    
    try {
      // IMPORTANT: Keep a reference to current form state
      const currentForm = {...courseForm};
      courseFormRef.current = currentForm;
      
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        showAlert('warning', 'Permission Required', 'Please grant permission to access your media library', [
          { text: 'OK', primary: true }
        ]);
        setUploadingImage(false);
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setThumbnailImage(selectedImage.uri);
        
        // Get file info
        const fileInfo = {
          uri: selectedImage.uri,
          name: selectedImage.fileName || `image-${Date.now()}.jpg`,
          size: selectedImage.fileSize || 0,
          mimeType: selectedImage.mimeType || 'image/jpeg',
        };
        
        // Upload the image
        const imageUrl = await uploadThumbnail(fileInfo);
        if (imageUrl) {
          // CRITICAL: Update form with preserved values
          setCourseForm({
            title: courseFormRef.current.title,
            description: courseFormRef.current.description,
            level: courseFormRef.current.level,
            image: imageUrl
          });
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showAlert('error', 'Error', 'Failed to pick image. Please try again.', [
        { text: 'OK', primary: true }
      ]);
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Upload thumbnail to Supabase
  const uploadThumbnail = async (fileInfo) => {
    try {
      setUploadingImage(true);
      
      const filePath = `course-thumbnails/new/${Date.now()}_${fileInfo.name}`;
      let contentType = fileInfo.mimeType || 'image/jpeg';
      
      console.log(`Uploading thumbnail: ${fileInfo.name}, type: ${contentType}`);
      
      if (Platform.OS === 'web') {
        // For web, use standard Blob approach
        const response = await fetch(fileInfo.uri);
        const blob = await response.blob();
        
        const { data, error } = await supabase
          .storage
          .from('course-thumbnails')
          .upload(filePath, blob, {
            contentType: contentType,
            upsert: true,
          });
          
        if (error) {
          console.error('Supabase storage upload error:', error);
          throw error;
        }
      } else {
        // For React Native, use direct binary upload approach with signed URLs
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('course-thumbnails')
          .createSignedUploadUrl(filePath);
        
        if (signedUrlError) {
          console.error('Error creating signed URL:', signedUrlError);
          throw signedUrlError;
        }
        
        // Use Expo's FileSystem.uploadAsync for direct binary upload
        const uploadOptions = {
          httpMethod: 'PUT',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          headers: {
            'Content-Type': contentType
          }
        };
        
        const uploadResult = await FileSystem.uploadAsync(
          signedUrlData.signedUrl, 
          fileInfo.uri, 
          uploadOptions
        );
        
        if (uploadResult.status !== 200) {
          console.error('Upload failed:', uploadResult);
          throw new Error(`Upload failed with status ${uploadResult.status}`);
        }
        
        console.log('Thumbnail uploaded successfully via signed URL');
      }
      
      // Get the public URL for the file
      const { data: publicURLData } = supabase
        .storage
        .from('course-thumbnails')
        .getPublicUrl(filePath);
      
      console.log('Thumbnail uploaded successfully:', publicURLData.publicUrl);
      return publicURLData.publicUrl;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      Alert.alert('Error', 'Failed to upload thumbnail. Please try again.');
      setThumbnailImage(null);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };
  
  // Reset local state when modal is opened
  useEffect(() => {
    if (modalVisible) {
      // Reset form state when modal opens
      resetCourseForm();
    }
  }, [modalVisible]);
  
  // Course creation modal
  const CreateCourseModal = () => {
    const levelOptions = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
    
    // Handle level selection (updates courseForm directly)
    const handleLevelSelect = (level) => {
      // Update both state and ref to keep them in sync
      setCourseForm(prev => ({
        ...prev,
        level
      }));
      courseFormRef.current.level = level;
    };
    
    // Handle course creation submission
    const handleSubmit = async () => {
      try {
        // Validate form using courseForm values
        if (!courseForm.title.trim()) {
          showAlert('error', 'Error', 'Please enter a course title', [
            {
              text: 'OK',
              primary: true
            }
          ]);
          return;
        }
        
        if (!selectedSubject) {
          showAlert('error', 'Error', 'Please select a subject', [
            {
              text: 'OK',
              primary: true
            }
          ]);
          return;
        }

        setLoading(true);
        
        // Create course object directly from courseForm
        const newCourseData = {
          title: courseForm.title,
          description: courseForm.description,
          level: courseForm.level,
          subject_id: selectedSubject.id,
          image: courseForm.image || 'https://images.unsplash.com/photo-1581544291234-d2d469dc9922?q=80&w=1974&auto=format', // Use uploaded image or default
          created_by: userProfile.user_id,
          // No duration field - it doesn't exist in the schema
          updated_at: new Date(),
          created_at: new Date(),
        };
        
        // Create new course in database
        const { data, error } = await supabase
          .from('courses')
          .insert([newCourseData])
          .select();
          
        if (error) {
          throw error;
        }
        
        // Reset form and close modal
        resetCourseForm();
        setModalVisible(false);
        
        // Refresh courses list for the current subject
        fetchCoursesBySubject(selectedSubject.id);
        
        showAlert('success', 'Success', 'Course created successfully!', [
          {
            text: 'OK',
            primary: true
          }
        ]);
      } catch (error) {
        console.error('Error creating course:', error.message);
        showAlert('error', 'Error', 'Failed to create course. Please try again.', [
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
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView 
              contentContainerStyle={styles.scrollableModalContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
            <Text style={styles.modalTitle}>Create New Course</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Course Title</Text>
              <TextInput
                style={styles.input}
                value={courseForm.title}
                onChangeText={(text) => {
                  setCourseForm(prev => ({
                    ...prev,
                    title: text
                  }));
                  // Also update the ref to maintain form state during image upload
                  courseFormRef.current.title = text;
                }}
                placeholder="Enter course title"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={courseForm.description}
                onChangeText={(text) => {
                  setCourseForm(prev => ({
                    ...prev,
                    description: text
                  }));
                  // Also update the ref to maintain form state during image upload
                  courseFormRef.current.description = text;
                }}
                placeholder="Enter course description"
                multiline={true}
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Level</Text>
              <View style={styles.levelButtonsContainer}>
                <View style={styles.levelButtons}>
                  {levelOptions.slice(0, 3).map(level => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.levelButton,
                        courseForm.level === level && styles.selectedLevel
                      ]}
                      onPress={() => handleLevelSelect(level)}
                    >
                      <Text 
                        style={[
                          styles.levelButtonText,
                          courseForm.level === level && styles.selectedLevelText
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
                    courseForm.level === 'All Levels' && styles.selectedLevel
                  ]}
                  onPress={() => handleLevelSelect('All Levels')}
                >
                  <Text 
                    style={[
                      styles.levelButtonText,
                      courseForm.level === 'All Levels' && styles.selectedLevelText
                    ]}
                  >
                    All Levels
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Thumbnail</Text>
              
              {thumbnailImage ? (
                <View style={styles.thumbnailContainer}>
                  <Image 
                    source={{ uri: thumbnailImage }}
                    style={styles.thumbnailPreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity 
                    style={styles.thumbnailCloseButton}
                    onPress={() => {
                      setThumbnailImage(null);
                      setCourseForm(prev => ({ ...prev, image: null }));
                      courseFormRef.current.image = null;
                    }}
                  >
                    <X size={20} color="white" />
                  </TouchableOpacity>
                  <View style={styles.thumbnailOverlay}>
                    <TouchableOpacity 
                      style={styles.changeThumbnailButton}
                      onPress={pickImage}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.changeThumbnailText}>Change Image</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.thumbnailSelector}
                  onPress={pickImage}
                  disabled={uploadingImage}
                >
                  <View style={styles.thumbnailIconContainer}>
                    <ImageIcon size={36} color={COLORS.primary} />
                  </View>
                  <Text style={styles.thumbnailSelectorText}>
                    {uploadingImage ? 'Uploading...' : 'Select Thumbnail Image'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Subject</Text>
              <Text style={styles.subjectInfo}>{selectedSubject?.name || 'No subject selected'}</Text>
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
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Main return for the component
  return (
    <View style={styles.container}>
      {renderBreadcrumbs()}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Title changes based on current view */}
            <Text style={styles.heading}>
              {currentView === 'curriculums' && 'Learning Pathways'}
              {currentView === 'subjects' && selectedCurriculum?.name}
              {currentView === 'courses' && selectedSubject?.name}
            </Text>
            <Text style={styles.subheading}>
              {currentView === 'curriculums' && 'Choose your curriculum'}
              {currentView === 'subjects' && 'Select a subject to study'}
              {currentView === 'courses' && 'Available courses'}
            </Text>

            {/* List of items based on current view */}
            <View style={styles.listContainer}>
              {currentView === 'curriculums' && curriculums.length > 0 && 
                curriculums.map(renderCurriculumCard)}
              
              {currentView === 'subjects' && subjects.length > 0 && 
                subjects.map(renderSubjectCard)}
              
              {currentView === 'courses' && courses.length > 0 && 
                courses.map(renderCourseCard)}
              
              {/* Empty states for each view */}
              {currentView === 'curriculums' && curriculums.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No curriculums available</Text>
                </View>
              )}
              
              {currentView === 'subjects' && subjects.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No subjects available for this curriculum</Text>
                </View>
              )}
              
              {currentView === 'courses' && courses.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No courses available for this subject</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}
      
      {/* Create Button (only visible for facilitators) - changes functionality based on view */}
      {isFacilitator && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => {
            if (currentView === 'curriculums') {
              // For curriculums view, let the user select a curriculum first
              if (curriculums.length === 0) {
                Alert.alert('Info', 'There are no curriculums available to add subjects to');
              } else {
                // Prepare curriculum selection options
                const options = curriculums.map(curriculum => ({
                  text: curriculum.name,
                  onPress: () => {
                    // Just set the curriculum ID in the newSubject state
                    setNewSubject(prev => ({
                      ...prev,
                      curriculum_id: curriculum.id
                    }));
                    
                    // Show the modal immediately after setting the curriculum ID
                    setSubjectModalVisible(true);
                  }
                }));
                
                // Show curriculum selection dialog
                Alert.alert(
                  'Select Curriculum',
                  'Choose a curriculum to add a subject to:',
                  options
                );
              }
            } else if (currentView === 'subjects') {
              // Already in subjects view, make sure to set the selected curriculum ID
              if (selectedCurriculum) {
                // Set the curriculum ID in the newSubject state
                setNewSubject(prev => ({
                  ...prev,
                  curriculum_id: selectedCurriculum.id
                }));
                
                // Now open the modal
                setSubjectModalVisible(true);
              } else {
                showAlert('error', 'Error', 'No curriculum selected', [
                  {
                    text: 'OK',
                    primary: true
                  }
                ]);
              }
            } else if (currentView === 'courses') {
              // In courses view, can create course
              setModalVisible(true);
            }
          }}
        >
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      )}
      
      {/* Create Course Modal */}
      <CreateCourseModal />
      
      {/* Create Subject Modal */}
      <CreateSubjectModal />
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
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
    fontSize: 14,
    color: COLORS.lightText,
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    maxHeight: '85%',
  },
  scrollableModalContent: {
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
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
  levelButtonsContainer: {
    gap: 10,
  },
  levelButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
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
  allLevelsButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
    height: 45,
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
  subjectInfo: {
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.lightText,
    textAlign: 'center',
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexWrap: 'wrap',
  },
  breadcrumbItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  breadcrumbItemActive: {
    backgroundColor: '#E5E7EB',
  },
  breadcrumbText: {
    fontSize: 14,
    color: COLORS.text,
  },
  breadcrumbSeparator: {
    marginHorizontal: 8,
    color: COLORS.lightText,
  },
  curriculumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.lightText,
  },
  listContainer: {
    marginTop: 8,
  },

  thumbnailContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  thumbnailPreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  changeThumbnailButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeThumbnailText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  thumbnailSelector: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    marginTop: 12,
    height: 160,
  },
  thumbnailIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  thumbnailSelectorText: {
    color: COLORS.primary,
    fontWeight: '500',
    fontSize: 16,
    marginTop: 16,
  },
  thumbnailCloseButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  subjectInfo: {
    fontSize: 16,
    color: COLORS.text,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breadcrumbs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexWrap: 'wrap',
  },
  breadcrumbItem: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  breadcrumbItemActive: {
    backgroundColor: COLORS.primary + '20',
  },
  breadcrumbText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
  },
  breadcrumbSeparator: {
    fontSize: 16,
    color: COLORS.lightText,
    marginHorizontal: 4,
  },
  listContainer: {
    marginTop: 16,
  },
  curriculumCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.lightText,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateText: {
    textAlign: 'center',
    color: COLORS.lightText,
    fontSize: 16,
  },
});