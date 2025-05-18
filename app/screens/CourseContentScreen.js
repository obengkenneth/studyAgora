import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  TextInput,
  Modal,
  FlatList,
  Platform
} from 'react-native';
import { 
  FileText, 
  Video as VideoIcon, 
  Link, 
  Type, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  X,
  Upload,
  Play
} from 'lucide-react-native';
import { supabase } from '../services/supabase';
import { useAuth } from '../navigation/AuthContext';
import Button from '../components/Button';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';
import VideoPlayer from '../components/VideoPlayer';
import DocumentViewer from '../components/DocumentViewer';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

const CONTENT_TYPES = [
  { id: 'text', label: 'Text', icon: Type },
  { id: 'video', label: 'Video', icon: VideoIcon },
  { id: 'document', label: 'Document', icon: FileText },
  { id: 'link', label: 'Link', icon: Link },
];

export default function CourseContentScreen({ route, navigation }) {
  const { courseId, courseTitle } = route.params;
  const { session, userProfile } = useAuth(); // Get the session from AuthContext at component level
  const [isCreator, setIsCreator] = useState(false);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'text',
    content: '',
    description: '',
    is_published: true,
  });
  const [editingContent, setEditingContent] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Track if the user is a facilitator and can edit this course
  const isFacilitator = userProfile?.user_group === 'facilitator';

  useEffect(() => {
    navigation.setOptions({
      title: `Content: ${courseTitle || 'Course'}`,
    });
    
    fetchCourseContent();
    checkIfCreator();
  }, [courseId]);
  
  const checkIfCreator = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('created_by')
        .eq('id', courseId)
        .single();
      
      if (error) throw error;
      
      setIsCreator(data.created_by === userProfile?.user_id);
    } catch (error) {
      console.error('Error checking if user is creator:', error);
    }
  };

  const fetchCourseContent = async () => {
    try {
      setLoading(true);
      
      // Debug: Check table structure
      console.log('Checking course_content table structure...');
      const { data: tableInfo, error: tableError } = await supabase
        .from('course_content')
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.error('Error checking table structure:', tableError);
      } else {
        console.log('Table structure:', tableInfo);
      }
      
      const { data, error } = await supabase
        .from('course_content')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching course content:', error);
      Alert.alert('Error', 'Failed to load course content. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddContent = () => {
    setEditingContent(null);
    setFormData({
      title: '',
      content_type: 'text',
      content: '',
      description: '',
      is_published: true,
    });
    setModalVisible(true);
  };
  
  const handleEditContent = (item) => {
    setEditingContent(item);
    setFormData({
      title: item.title,
      content_type: item.content_type,
      content: item.content,
      description: item.description || '',
      is_published: item.is_published,
    });
    setModalVisible(true);
  };
  
  const handleDeleteContent = async (id) => {
    // First, get the content item to check if it has a file
    try {
      const { data, error } = await supabase
        .from('course_content')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      Alert.alert(
        'Delete Content',
        'Are you sure you want to delete this content? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              try {
                setLoading(true);
                
                // If there's a file, delete it from storage first
                if (data.file_url) {
                  // Extract the path from the URL
                  const urlParts = data.file_url.split('/');
                  const filePath = `${courseId}/${urlParts[urlParts.length - 1]}`;
                  
                  const { error: storageError } = await supabase
                    .storage
                    .from('course-content')
                    .remove([filePath]);
                    
                  if (storageError) {
                    console.error('Error deleting file from storage:', storageError);
                    // Continue anyway, as we still want to delete the database record
                  }
                }
                
                // Delete the database record
                const { error } = await supabase
                  .from('course_content')
                  .delete()
                  .eq('id', id);
                
                if (error) throw error;
                
                // Refresh the content list
                fetchCourseContent();
                Alert.alert('Success', 'Content deleted successfully!');
              } catch (error) {
                console.error('Error deleting content:', error);
                Alert.alert('Error', 'Failed to delete content. Please try again.');
              } finally {
                setLoading(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error getting content before delete:', error);
      Alert.alert('Error', 'Failed to delete content. Please try again.');
    }
  };
  
  const pickDocument = async (type) => {
    try {
      let result;
      
      if (type === 'video') {
        result = await DocumentPicker.getDocumentAsync({
          type: 'video/*',
          copyToCacheDirectory: true
        });
      } else {
        result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
          copyToCacheDirectory: true
        });
      }
      
      if (result.canceled) {
        return;
      }
      
      // FileSystem only works with uri property on the result
      const fileInfo = result.assets[0];
      
      if (fileInfo.size > 50 * 1024 * 1024) { // 50MB limit
        Alert.alert(
          'File Too Large', 
          'Please select a file smaller than 50MB'
        );
        return;
      }
      
      setSelectedFile(fileInfo);
      
      // Set the filename in the content field for display
      setFormData({
        ...formData,
        content: fileInfo.name
      });
      
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'An error occurred while selecting the file');
    }
  };

  const uploadFile = async (courseId, fileInfo) => {
    try {
      const filePath = `${courseId}/${Date.now()}_${fileInfo.name}`;
      
      // Determine content type explicitly for video files to ensure proper playback
      let contentType = fileInfo.mimeType;
      
      // For video files, make sure we use a standard video MIME type
      if (fileInfo.mimeType.startsWith('video/')) {
        // Extract file extension
        const extension = fileInfo.name.split('.').pop().toLowerCase();
        
        // Set explicit MIME types based on extension
        switch (extension) {
          case 'mp4':
            contentType = 'video/mp4';
            break;
          case 'mov':
            contentType = 'video/quicktime';
            break;
          case 'avi':
            contentType = 'video/x-msvideo';
            break;
          case 'wmv':
            contentType = 'video/x-ms-wmv';
            break;
          case 'webm':
            contentType = 'video/webm';
            break;
          default:
            // If we don't recognize the extension, keep the original
            contentType = 'video/mp4'; // Default to mp4 for unknown video types
            break;
        }
        
        console.log(`Setting explicit video content type: ${contentType} for file: ${fileInfo.name}`);
      }
      
      console.log(`Uploading file: ${fileInfo.name}, type: ${contentType}`);
      
      if (Platform.OS === 'web') {
        // For web, use standard Blob approach
        const response = await fetch(fileInfo.uri);
        const blob = await response.blob();
        
        const { data, error } = await supabase
          .storage
          .from('course-content')
          .upload(filePath, blob, {
            contentType: contentType,
            upsert: true,
          });
          
        if (error) {
          console.error('Supabase storage upload error:', error);
          throw error;
        }
      } else {
        // For React Native, use a DIRECT BINARY UPLOAD approach with signed URLs
        // Step 1: Create a signed URL for upload
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from('course-content')
          .createSignedUploadUrl(filePath);
        
        if (signedUrlError) {
          console.error('Error creating signed URL:', signedUrlError);
          throw signedUrlError;
        }
        
        // Step 2: Use Expo's FileSystem.uploadAsync to do a direct binary upload to the signed URL
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
        
        console.log('File uploaded successfully via signed URL');
      }
      
      // Log success
      console.log(`File uploaded to path: ${filePath}`);
      
      // Get the public URL for the file
      const { data: publicURLData } = supabase
        .storage
        .from('course-content')
        .getPublicUrl(filePath);
        
      console.log('File uploaded successfully:', publicURLData.publicUrl);
      
      return {
        file_url: publicURLData.publicUrl,
        file_name: fileInfo.name,
        file_size: fileInfo.size,
        file_type: contentType, // Store the explicit content type
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };
  
  const handleSaveContent = async () => {
    // Validate form
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    // Handle different validations for different content types
    if (formData.content_type === 'text' && !formData.content.trim()) {
      Alert.alert('Error', 'Please enter text content');
      return;
    }
    
    if (formData.content_type === 'link' && !formData.content.trim()) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }
    
    if ((formData.content_type === 'video' || formData.content_type === 'document') && 
        !selectedFile && !editingContent) {
      Alert.alert('Error', 'Please select a file to upload');
      return;
    }
    
    try {
      setUploading(true);
      setLoading(true);
      
      // File upload handling
      let fileData = null;
      if (selectedFile && (formData.content_type === 'video' || formData.content_type === 'document')) {
        fileData = await uploadFile(courseId, selectedFile);
      }
      
      if (editingContent) {
        // Update existing content
        const updateData = {
          title: formData.title,
          content_type: formData.content_type,
          description: formData.description,
          is_published: formData.is_published,
          updated_at: new Date(),
        };
        
        // Only update content for text and link types
        if (formData.content_type === 'text' || formData.content_type === 'link') {
          updateData.content = formData.content;
        }
        
        // Only add file data if a new file was selected
        if (fileData) {
          updateData.file_url = fileData.file_url;
          updateData.file_name = fileData.file_name;
          updateData.file_size = fileData.file_size;
          updateData.file_type = fileData.file_type;
          updateData.content = fileData.file_name; // Use filename as content for display
        }
        
        const { error } = await supabase
          .from('course_content')
          .update(updateData)
          .eq('id', editingContent.id);
        
        if (error) throw error;
        
        Alert.alert('Success', 'Content updated successfully!');
      } else {
        // Create new content data
        const newContentData = {
          course_id: courseId,
          title: formData.title,
          content_type: formData.content_type,
          description: formData.description,
          is_published: formData.is_published,
          order_index: content.length, // Add to the end
          created_by: userProfile.user_id,
        };
        console.log('newContentData:', newContentData);
        
        // Handle file data for video and document types
        if (formData.content_type === 'video' || formData.content_type === 'document') {
          if (fileData) {
            newContentData.file_url = fileData.file_url;
            newContentData.file_name = fileData.file_name;
            newContentData.file_size = fileData.file_size;
            newContentData.file_type = fileData.file_type;
            newContentData.content = fileData.file_name; // Use filename as content for display
          }
        } else {
          // For text and link types, use the content field directly
          newContentData.content = formData.content;
        }
        
        // console.log('userProfile:', userProfile);
        const { data: authUser } = await supabase.auth.getUser();
        // console.log('auth user:', authUser);
        // console.log('newContentData:', newContentData);
        
        const { error } = await supabase
          .from('course_content')
          .insert(newContentData);
        
        if (error) throw error;
        
        Alert.alert('Success', 'Content added successfully!');
      }
      
      // Reset state and close modal
      setSelectedFile(null);
      setModalVisible(false);
      fetchCourseContent();
    } catch (error) {
      console.error('Error saving content:', error);
      Alert.alert('Error', 'Failed to save content. Please try again.');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };
  
  const handleReorderContent = async (id, direction) => {
    // Find the current content item
    const currentIndex = content.findIndex(item => item.id === id);
    if (currentIndex === -1) return;
    
    // Determine the target index
    let targetIndex;
    if (direction === 'up' && currentIndex > 0) {
      targetIndex = currentIndex - 1;
    } else if (direction === 'down' && currentIndex < content.length - 1) {
      targetIndex = currentIndex + 1;
    } else {
      // Can't move in that direction
      return;
    }
    
    // Get the items being swapped
    const currentItem = content[currentIndex];
    const targetItem = content[targetIndex];
    
    try {
      setLoading(true);
      
      // Update the order_index of both items
      const updates = [
        {
          id: currentItem.id,
          order_index: targetItem.order_index
        },
        {
          id: targetItem.id,
          order_index: currentItem.order_index
        }
      ];
      
      // Use an array of upsert operations
      const { error } = await supabase
        .from('course_content')
        .upsert(updates);
      
      if (error) throw error;
      
      // Refresh the content list
      fetchCourseContent();
    } catch (error) {
      console.error('Error reordering content:', error);
      Alert.alert('Error', 'Failed to reorder content. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const getContentTypeIcon = (type) => {
    const contentType = CONTENT_TYPES.find(t => t.id === type);
    if (!contentType) return null;
    
    const Icon = contentType.icon;
    return <Icon size={24} color={COLORS.text} />;
  };
  
  const renderContentItem = ({ item }) => (
    <View style={styles.contentItem}>
      <View style={styles.contentHeader}>
        <View style={styles.titleContainer}>
          {getContentTypeIcon(item.content_type)}
          <Text style={styles.contentTitle}>{item.title}</Text>
        </View>
        
        {isFacilitator && isCreator && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReorderContent(item.id, 'up')}
            >
              <ArrowUp size={20} color={COLORS.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleReorderContent(item.id, 'down')}
            >
              <ArrowDown size={20} color={COLORS.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEditContent(item)}
            >
              <Edit2 size={20} color={COLORS.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteContent(item.id)}
            >
              <Trash2 size={20} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {item.description && (
        <Text style={styles.contentDescription}>{item.description}</Text>
      )}
      
      <View style={styles.contentBody}>
        {item.content_type === 'text' && (
          <Text style={styles.contentText}>{item.content}</Text>
        )}
        
        {item.content_type === 'link' && (
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(item.content).catch(err => {
                console.error('Error opening link:', err);
                Alert.alert('Error', 'Could not open the link');
              });
            }}
          >
            <Text style={styles.contentLink}>{item.content}</Text>
          </TouchableOpacity>
        )}
        
        {item.content_type === 'video' && (
          <ContentPreviewCard 
            type="video"
            title={item.file_name || "Video"}
            fileUrl={item.file_url}
            fileType={item.file_type}
            onView={() => openContentViewer(item)}
          />
        )}
        
        {item.content_type === 'document' && (
          <ContentPreviewCard
            type="document"
            title={item.file_name || "Document"}
            fileUrl={item.file_url}
            fileType={item.file_type} 
            onView={() => openContentViewer(item)}
          />
        )}
      </View>
    </View>
  );
  
  const renderContentTypeSelector = () => (
    <View style={styles.contentTypesContainer}>
      {CONTENT_TYPES.map(type => (
        <TouchableOpacity
          key={type.id}
          style={[
            styles.contentTypeButton,
            formData.content_type === type.id && styles.contentTypeSelected
          ]}
          onPress={() => setFormData({...formData, content_type: type.id})}
        >
          <type.icon 
            size={24} 
            color={formData.content_type === type.id ? 'white' : COLORS.text} 
          />
          <Text 
            style={[
              styles.contentTypeText,
              formData.content_type === type.id && styles.contentTypeTextSelected
            ]}
          >
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  
  const openFile = (fileUrl) => {
    Linking.openURL(fileUrl).catch((err) => {
      console.error('Error opening file:', err);
      Alert.alert('Error', 'Unable to open the file');
    });
  };
  
  // Render the modal UI for different content types
  const renderContentTypeInput = () => {
    switch(formData.content_type) {
      case 'text':
        return (
          <TextInput
            style={[styles.input, styles.textAreaInput]}
            value={formData.content}
            onChangeText={(text) => setFormData({...formData, content: text})}
            placeholder="Enter text content"
            multiline={true}
          />
        );
        
      case 'link':
        return (
          <TextInput
            style={styles.input}
            value={formData.content}
            onChangeText={(text) => setFormData({...formData, content: text})}
            placeholder="Enter URL"
            autoCapitalize="none"
            keyboardType="url"
          />
        );
        
      case 'video':
        return (
          <View>
            <View style={styles.filePickerContainer}>
              {selectedFile ? (
                <View style={styles.selectedFileContainer}>
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <TouchableOpacity
                    style={styles.clearFileButton}
                    onPress={() => {
                      setSelectedFile(null);
                      setFormData({...formData, content: ''});
                    }}
                  >
                    <X size={20} color={COLORS.secondary} />
                  </TouchableOpacity>
                </View>
              ) : editingContent?.file_url ? (
                <View style={styles.selectedFileContainer}>
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {editingContent.file_name || 'Current video'}
                  </Text>
                  <Text style={styles.fileNote}>
                    (Keep existing or select new)
                  </Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>No video selected</Text>
              )}
              <Button
                title={selectedFile ? "Change Video" : "Select Video"}
                onPress={() => pickDocument('video')}
                variant="outline"
                icon={() => <Upload size={18} color={COLORS.primary} />}
              />
            </View>
            <Text style={styles.fileNote}>
              Supported formats: MP4, MOV, etc. Max size: 50MB
            </Text>
          </View>
        );
        
      case 'document':
        return (
          <View>
            <View style={styles.filePickerContainer}>
              {selectedFile ? (
                <View style={styles.selectedFileContainer}>
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {selectedFile.name}
                  </Text>
                  <TouchableOpacity
                    style={styles.clearFileButton}
                    onPress={() => {
                      setSelectedFile(null);
                      setFormData({...formData, content: ''});
                    }}
                  >
                    <X size={20} color={COLORS.secondary} />
                  </TouchableOpacity>
                </View>
              ) : editingContent?.file_url ? (
                <View style={styles.selectedFileContainer}>
                  <Text style={styles.selectedFileName} numberOfLines={1}>
                    {editingContent.file_name || 'Current document'}
                  </Text>
                  <Text style={styles.fileNote}>
                    (Keep existing or select new)
                  </Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>No document selected</Text>
              )}
              <Button
                title={selectedFile ? "Change Document" : "Select Document"}
                onPress={() => pickDocument('document')}
                variant="outline"
                icon={() => <Upload size={18} color={COLORS.primary} />}
              />
            </View>
            <Text style={styles.fileNote}>
              Supported formats: PDF, DOC, DOCX. Max size: 50MB
            </Text>
          </View>
        );
        
      default:
        return null;
    }
  };
  
  const ContentPreviewCard = ({ type, title, fileUrl, fileType, onView }) => {
    if (!fileUrl) {
      return (
        <TouchableOpacity
          style={styles.unavailableContent}
          onPress={() => {
            Alert.alert('Error', `${type === 'video' ? 'Video' : 'Document'} file is not available`);
          }}
        >
          {type === 'video' ? (
            <VideoIcon size={32} color={COLORS.primary} />
          ) : (
            <FileText size={32} color={COLORS.primary} />
          )}
          <Text style={styles.unavailableText}>{type === 'video' ? 'Video' : 'Document'} Not Available</Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <TouchableOpacity
        style={styles.contentPreviewCard}
        onPress={onView}
      >
        {type === 'video' ? (
          <View style={styles.previewIconContainer}>
            <VideoIcon size={32} color={COLORS.primary} />
            <Play size={20} color={'white'} style={styles.playIcon} />
          </View>
        ) : (
          <View style={styles.previewIconContainer}>
            <FileText size={32} color={COLORS.primary} />
          </View>
        )}
        <View style={styles.previewContent}>
          <Text style={styles.previewTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.previewType}>
            {type === 'video' ? 'Video' : fileType?.split('/')[1]?.toUpperCase() || 'Document'}
          </Text>
          <Text style={styles.tapToView}>Tap to view</Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  const [viewingContent, setViewingContent] = useState(null);
  
  const openContentViewer = (item) => {
    setViewingContent(item);
  };
  
  // Content viewer modal
  const renderContentViewerModal = () => {
    if (!viewingContent) return null;
    
    return (
      <Modal
        visible={!!viewingContent}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setViewingContent(null)}
      >
        <View style={styles.contentViewerContainer}>
          <View style={styles.contentViewerHeader}>
            <Text style={styles.contentViewerTitle} numberOfLines={1}>
              {viewingContent.title}
            </Text>
            <TouchableOpacity
              style={styles.closeContentButton}
              onPress={() => setViewingContent(null)}
            >
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.contentViewerBody}>
            {viewingContent.content_type === 'video' && (
              <VideoPlayer 
                videoUri={viewingContent.file_url} 
                title={viewingContent.file_name} 
              />
            )}
            
            {viewingContent.content_type === 'document' && (
              <DocumentViewer
                documentUri={viewingContent.file_url}
                title={viewingContent.file_name}
                fileType={viewingContent.file_type}
              />
            )}
          </View>
        </View>
      </Modal>
    );
  };
  
  if (loading && content.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading course content...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {content.length > 0 ? (
        <FlatList
          data={content}
          renderItem={renderContentItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.contentList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No content has been added to this course yet.
          </Text>
          {isFacilitator && isCreator && (
            <Text style={styles.emptySubText}>
              Tap the + button below to add your first content item.
            </Text>
          )}
        </View>
      )}
      
      {/* Add Content Button (only visible for course creators) */}
      {isFacilitator && isCreator && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={handleAddContent}
        >
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
      )}
      
      {/* Add/Edit Content Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingContent ? 'Edit Content' : 'Add Content'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Title</Text>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(text) => setFormData({...formData, title: text})}
                  placeholder="Enter content title"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Content Type</Text>
                {renderContentTypeSelector()}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.description}
                  onChangeText={(text) => setFormData({...formData, description: text})}
                  placeholder="Enter a description"
                  multiline
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  {formData.content_type === 'text' ? 'Content' :
                   formData.content_type === 'link' ? 'URL' :
                   formData.content_type === 'video' ? 'Video File' :
                   'Document File'}
                </Text>
                {renderContentTypeInput()}
              </View>
              
              <View style={styles.formGroup}>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      formData.is_published && styles.checkboxChecked
                    ]}
                    onPress={() => setFormData({
                      ...formData, 
                      is_published: !formData.is_published
                    })}
                  />
                  <Text style={styles.checkboxLabel}>Publish immediately</Text>
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <Button
                title="Cancel"
                onPress={() => setModalVisible(false)}
                variant="outline"
                style={styles.cancelButton}
              />
              <Button
                title={editingContent ? "Update" : "Add"}
                onPress={handleSaveContent}
                variant="primary"
                loading={loading || uploading}
                style={styles.saveButton}
              />
            </View>
          </View>
        </View>
      </Modal>
      {renderContentViewerModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: COLORS.lightText,
    textAlign: 'center',
  },
  contentList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  contentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  contentDescription: {
    fontSize: 14,
    color: COLORS.lightText,
    marginBottom: 12,
  },
  contentBody: {
    marginTop: 8,
  },
  contentText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  contentLink: {
    fontSize: 16,
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: 12,
    borderRadius: 8,
  },
  videoButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    padding: 12,
    borderRadius: 8,
  },
  documentButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
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
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
    maxHeight: '70%',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
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
  textAreaInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  contentTypesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contentTypeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  contentTypeSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  contentTypeText: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.text,
  },
  contentTypeTextSelected: {
    color: '#FFFFFF',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
  filePickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  selectedFileName: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  clearFileButton: {
    padding: 5,
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.lightText,
    marginBottom: 8,
  },
  fileNote: {
    fontSize: 12,
    color: COLORS.lightText,
    marginTop: 4,
  },
  contentPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  previewIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    position: 'relative',
  },
  playIcon: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 4,
  },
  previewContent: {
    flex: 1,
    marginLeft: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  previewType: {
    fontSize: 14,
    color: COLORS.lightText,
    marginBottom: 4,
  },
  tapToView: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  unavailableContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginVertical: 8,
  },
  unavailableText: {
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.lightText,
  },
  contentViewerContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  contentViewerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 12,
  },
  closeContentButton: {
    padding: 4,
  },
  contentViewerBody: {
    flex: 1,
    padding: 16,
  },
}); 