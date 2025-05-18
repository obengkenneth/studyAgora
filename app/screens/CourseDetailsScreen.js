import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { Clock, Users2, Edit2, Trash2, ArrowLeft, FileText, Book, Image as ImageIcon } from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { useAuth } from '../navigation/AuthContext';
import Button from '../components/Button';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

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
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editCourse, setEditCourse] = useState({
    title: '',
    duration: '',
    curriculum: '',
    image: null
  });
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Get screen width for responsive text
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  
  useEffect(() => {
    const dimensionsListener = Dimensions.addEventListener(
      'change', 
      ({ window }) => {
        setScreenWidth(window.width);
      }
    );
    
    return () => dimensionsListener?.remove?.();
  }, []);
  
  // Use abbreviated names on smaller screens
  const getCurriculumDisplay = (curriculum) => {
    // Add null check to prevent errors
    if (!curriculum) {
      return 'N/A';
    }
    
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
  
  // Check if user is the course creator
  const isCreator = userProfile?.user_id === course?.created_by;
  const isFacilitator = hasRole('facilitator') || hasRole('admin');

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      
      // First fetch the course data
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) {
        throw courseError;
      }
      
      // Now fetch the related subject with curriculum information
      let curriculumName = null;
      if (courseData.subject_id) {
        const { data: subjectData, error: subjectError } = await supabase
          .from('subjects')
          .select('*, curriculum:curriculum_id(*)')
          .eq('id', courseData.subject_id)
          .single();
        
        // Get curriculum name if available
        if (!subjectError && subjectData && subjectData.curriculum) {
          curriculumName = subjectData.curriculum.name?.toLowerCase() || null;
        }
      }
      
      // Create a complete course object with curriculum info
      const courseWithCurriculum = {
        ...courseData,
        curriculum: curriculumName // Add curriculum field from the joined data
      };
      
      setCourse(courseWithCurriculum);
      setEditCourse({
        title: courseData.title,
        duration: courseData.duration,
        curriculum: curriculumName,
        image: courseData.image || null
      });
      
      if (courseData.image) {
        setThumbnailImage(courseData.image);
      }
      
      console.log('Course loaded with curriculum:', curriculumName);
    } catch (error) {
      console.error('Error fetching course details:', error.message);
      Alert.alert('Error', 'Failed to load course details. Please try again later.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  // Pick image from device gallery
  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your media library');
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
        await uploadThumbnail(fileInfo);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };
  
  // Upload thumbnail to Supabase
  const uploadThumbnail = async (fileInfo) => {
    try {
      setUploadingImage(true);
      
      const filePath = `course-thumbnails/${courseId}/${Date.now()}_${fileInfo.name}`;
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
      
      // Update the editCourse state with the image URL
      setEditCourse({
        ...editCourse,
        image: publicURLData.publicUrl
      });
      
      return publicURLData.publicUrl;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      Alert.alert('Error', 'Failed to upload thumbnail. Please try again.');
      // Keep the existing image if there was one
      setThumbnailImage(course?.image || null);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateCourse = async () => {
    if (!editCourse.title.trim()) {
      Alert.alert('Error', 'Please enter a course title');
      return;
    }

    if (!editCourse.duration.trim()) {
      Alert.alert('Error', 'Please enter a course duration');
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('courses')
        .update({
          title: editCourse.title,
          duration: editCourse.duration,
          curriculum: editCourse.curriculum,
          image: editCourse.image,  // Add the image URL to the update
          updated_at: new Date(),
        })
        .eq('id', courseId)
        .select();

      if (error) {
        throw error;
      }

      setCourse({
        ...course,
        title: editCourse.title,
        duration: editCourse.duration,
        curriculum: editCourse.curriculum,
        image: editCourse.image,
      });
      
      setModalVisible(false);
      Alert.alert('Success', 'Course updated successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            // Navigate back to Courses screen to trigger refresh
            navigation.navigate('Courses');
          }
        }
      ]);
    } catch (error) {
      console.error('Error updating course:', error.message);
      Alert.alert('Error', 'Failed to update course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    Alert.alert(
      'Delete Course',
      'Are you sure you want to delete this course? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              const { error } = await supabase
                .from('courses')
                .delete()
                .eq('id', courseId);

              if (error) {
                throw error;
              }

              Alert.alert('Success', 'Course deleted successfully!', [
                { 
                  text: 'OK', 
                  onPress: () => {
                    // Navigate back to Courses screen to trigger refresh
                    navigation.navigate('Courses');
                  }
                }
              ]);
            } catch (error) {
              console.error('Error deleting course:', error.message);
              Alert.alert('Error', 'Failed to delete course. Please try again.');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading && !course) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading course details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {course?.image && (
          <Image 
            source={{ uri: course.image }} 
            style={styles.courseImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.content}>
          <Text style={styles.title}>{course?.title}</Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Clock size={18} color={COLORS.lightText} />
              <Text style={styles.metaText}>{course?.duration}</Text>
            </View>
            <View style={styles.metaItem}>
              <Users2 size={18} color={COLORS.lightText} />
              <Text style={styles.metaText}>{course?.students || 0} students</Text>
            </View>
          </View>
          
          <View style={styles.curriculumBadge}>
            <Text style={styles.curriculumText}>
              {getCurriculumDisplay(course?.curriculum)}
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this course</Text>
            <Text style={styles.sectionText}>
              {course?.description || 
                `This is a ${getCurriculumDisplay(course?.curriculum)} course designed to help students master key concepts and prepare for exams. The course duration is ${course?.duration}.`}
            </Text>
          </View>
          
          {/* Course Content Button */}
          <TouchableOpacity 
            style={styles.contentButton}
            onPress={() => navigation.navigate('CourseContent', { 
              courseId: course.id,
              courseTitle: course.title
            })}
          >
            <Book size={20} color={COLORS.primary} />
            <Text style={styles.contentButtonText}>View Course Content</Text>
          </TouchableOpacity>
          
          {/* Edit and Delete buttons for course creators */}
          {isFacilitator && isCreator && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]} 
                onPress={() => setModalVisible(true)}
              >
                <Edit2 size={18} color={COLORS.primary} />
                <Text style={styles.actionButtonText}>Edit Course</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]} 
                onPress={handleDeleteCourse}
              >
                <Trash2 size={18} color={COLORS.secondary} />
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* Course Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Course</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Course Title</Text>
              <TextInput
                style={styles.input}
                value={editCourse.title}
                onChangeText={(text) => setEditCourse({ ...editCourse, title: text })}
                placeholder="Enter course title"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Duration</Text>
              <TextInput
                style={styles.input}
                value={editCourse.duration}
                onChangeText={(text) => setEditCourse({ ...editCourse, duration: text })}
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
                      editCourse.curriculum === curriculum && styles.selectedCurriculum
                    ]}
                    onPress={() => setEditCourse({ ...editCourse, curriculum })}
                  >
                    <Text 
                      style={[
                        styles.curriculumButtonText,
                        editCourse.curriculum === curriculum && styles.selectedCurriculumText
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
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Course Thumbnail</Text>
              
              {thumbnailImage ? (
                <View style={styles.thumbnailContainer}>
                  <Image 
                    source={{ uri: thumbnailImage }}
                    style={styles.thumbnailPreview}
                    resizeMode="cover"
                  />
                  <TouchableOpacity 
                    style={styles.changeThumbnailButton}
                    onPress={pickImage}
                    disabled={uploadingImage}
                  >
                    <Text style={styles.changeThumbnailText}>
                      {uploadingImage ? 'Uploading...' : 'Change Thumbnail'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.thumbnailSelector}
                  onPress={pickImage}
                  disabled={uploadingImage}
                >
                  <ImageIcon size={24} color={COLORS.primary} />
                  <Text style={styles.thumbnailSelectorText}>
                    {uploadingImage ? 'Uploading...' : 'Select Thumbnail Image'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Update Course"
                onPress={handleUpdateCourse}
                variant="primary"
                loading={loading}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  scrollContent: {
    flexGrow: 1,
  },
  courseImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  metaText: {
    marginLeft: 8,
    color: COLORS.lightText,
    fontSize: 16,
  },
  curriculumBadge: {
    backgroundColor: COLORS.primary + '20', // 20% opacity
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 24,
  },
  curriculumText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
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
    color: COLORS.secondary,
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
  contentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 24,
    justifyContent: 'center',
  },
  contentButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  thumbnailContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnailPreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  changeThumbnailButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  changeThumbnailText: {
    color: 'white',
    fontWeight: 'bold',
  },
  thumbnailSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  thumbnailSelectorText: {
    marginLeft: 8,
    color: COLORS.primary,
    fontWeight: '500',
  },
}); 