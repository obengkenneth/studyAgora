import { supabase } from '../supabase';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/**
 * Fetch all lessons for a specific unit
 * @param {string} unitId - The ID of the unit
 * @param {boolean} showDrafts - Whether to include unpublished lessons (for facilitators)
 * @returns {Promise<Array>} Array of lesson objects
 */
export const fetchLessonsByUnit = async (unitId, showDrafts = false) => {
  try {
    let query = supabase
      .from('lessons')
      .select('*')
      .eq('unit_id', unitId)
      .is('deleted_at', null) // Only fetch lessons that haven't been deleted
      .order('order_position', { ascending: true });
    
    // If not showing drafts, only fetch published lessons
    if (!showDrafts) {
      query = query.eq('is_published', true);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }
};

/**
 * Fetch a lesson by ID
 * @param {string} lessonId - The ID of the lesson
 * @returns {Promise<Object>} Lesson object with its resources
 */
export const fetchLessonById = async (lessonId) => {
  try {
    // First get the lesson data
    const { data: lessonData, error: lessonError } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', lessonId)
      .is('deleted_at', null) // Only fetch lessons that haven't been deleted
      .single();
    
    if (lessonError) throw lessonError;
    
    // Now get any associated resource
    const { data: resourceData, error: resourceError } = await supabase
      .from('lesson_resources')
      .select('*')
      .eq('lesson_id', lessonId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (resourceError) {
      console.error('Error fetching lesson resource:', resourceError);
      // We'll continue even if there's an error with the resource
    }
    
    // Add the resource to the lesson data if available
    const fullLessonData = {
      ...lessonData,
      resource: resourceData && resourceData.length > 0 ? resourceData[0] : null
    };
    
    console.log('Fetched lesson with resource:', fullLessonData);
    return fullLessonData;
  } catch (error) {
    console.error('Error fetching lesson:', error);
    throw error;
  }
};

/**
 * Create a new lesson for a unit
 * @param {Object} lessonData - Lesson data with attachment info
 * @returns {Promise<Object>} Newly created lesson with resources
 */
export const createLesson = async (lessonData) => {
  try {
    // Extract attachment data from lessonData
    const attachmentUrl = lessonData.attachment_url;
    const attachmentName = lessonData.attachment_name;
    const lessonType = lessonData.lesson_type;
    
    // Create the core lesson object (removing attachment fields which don't exist in the lessons table)
    const lessonCore = {
      title: lessonData.title,
      description: lessonData.content,
      unit_id: lessonData.unit_id,
      order_position: lessonData.order_position,
      has_quiz: lessonData.has_quiz || false,
      is_published: lessonData.is_published || false
    };
    
    // Check if a position was provided, if not, calculate the next position
    if (!lessonCore.order_position) {
      const { data: existingLessons } = await supabase
        .from('lessons')
        .select('order_position')
        .eq('unit_id', lessonCore.unit_id)
        .is('deleted_at', null)
        .order('order_position', { ascending: false })
        .limit(1);
      
      const nextPosition = existingLessons && existingLessons.length > 0 
        ? (existingLessons[0].order_position + 1) 
        : 1;
      
      lessonCore.order_position = nextPosition;
    }
    
    // Start a Supabase transaction
    // First insert the lesson
    const { data: newLesson, error: lessonError } = await supabase
      .from('lessons')
      .insert([lessonCore])
      .select()
      .single();
    
    if (lessonError) throw lessonError;
    
    // If there's an attachment, create a lesson_resource entry
    let resourceData = null;
    if (attachmentUrl && attachmentName) {
      // Determine file type based on attachment name
      const fileExt = attachmentName.split('.').pop().toLowerCase();
      const fileType = determineFileType(fileExt);
      
      // Determine resource type based on lesson type
      let resourceType = 'pdf';
      if (lessonType === 'video') {
        resourceType = 'video';
      } else if (lessonType === 'slide') {
        resourceType = 'slide';
      }
      
      // Create the resource entry
      const { data: resource, error: resourceError } = await supabase
        .from('lesson_resources')
        .insert([{
          lesson_id: newLesson.id,
          title: attachmentName,
          type: resourceType,
          content_url: attachmentUrl,
          file_type: fileType,
          created_by: lessonData.created_by // if available
        }])
        .select()
        .single();
      
      if (resourceError) {
        console.error('Error creating lesson resource:', resourceError);
        // If resource creation fails, we should still return the lesson
      } else {
        resourceData = resource;
      }
    }
    
    // Return the lesson with its resource attached
    return { ...newLesson, resource: resourceData };
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

/**
 * Helper function to determine file type from extension
 */
/**
 * Determine file MIME type from extension
 * @param {string} extension - File extension without the dot
 * @returns {string} MIME type
 */
const determineFileType = (extension) => {
  return determineContentTypeByExtension(extension);
};

/**
 * Determine content MIME type from extension
 * More comprehensive version with exact MIME types
 * @param {string} extension - File extension without the dot
 * @returns {string} MIME type
 */
const determineContentTypeByExtension = (extension) => {
  if (!extension) return 'application/octet-stream';
  
  const ext = extension.toLowerCase();
  
  // Video types
  const videoTypes = {
    'mp4': 'video/mp4',
    'mov': 'video/quicktime',
    'avi': 'video/x-msvideo',
    'webm': 'video/webm',
    'mkv': 'video/x-matroska',
    'wmv': 'video/x-ms-wmv',
    'flv': 'video/x-flv',
    '3gp': 'video/3gpp',
    'm4v': 'video/x-m4v'
  };
  
  // Document types
  const documentTypes = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    'odt': 'application/vnd.oasis.opendocument.text'
  };
  
  // Presentation types
  const presentationTypes = {
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'key': 'application/vnd.apple.keynote',
    'odp': 'application/vnd.oasis.opendocument.presentation'
  };
  
  // Image types
  const imageTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff'
  };
  
  // Audio types
  const audioTypes = {
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'aac': 'audio/aac',
    'm4a': 'audio/mp4'
  };
  
  // Check in each category
  if (videoTypes[ext]) return videoTypes[ext];
  if (documentTypes[ext]) return documentTypes[ext];
  if (presentationTypes[ext]) return presentationTypes[ext];
  if (imageTypes[ext]) return imageTypes[ext];
  if (audioTypes[ext]) return audioTypes[ext];
  
  // Default fallback
  return 'application/octet-stream';
};

/**
 * Update a lesson
 * @param {string} lessonId - The ID of the lesson to update
 * @param {Object} lessonData - Updated lesson data with attachment info
 * @returns {Promise<Object>} Updated lesson with resources
 */
export const updateLesson = async (lessonId, lessonData) => {
  try {
    // Extract attachment data from lessonData
    const attachmentUrl = lessonData.attachment_url;
    const attachmentName = lessonData.attachment_name;
    const lessonType = lessonData.lesson_type;
    
    // Create the core lesson object (removing attachment fields which don't exist in the lessons table)
    const lessonCore = {
      title: lessonData.title,
      description: lessonData.content,
      has_quiz: lessonData.has_quiz || false,
      is_published: lessonData.is_published
    };
    
    // Update the lesson
    const { data: updatedLesson, error: lessonError } = await supabase
      .from('lessons')
      .update(lessonCore)
      .eq('id', lessonId)
      .select()
      .single();
    
    if (lessonError) throw lessonError;
    
    // If there's an attachment, update or create a lesson_resource entry
    let resourceData = null;
    
    if (attachmentUrl && attachmentName) {
      // First check if there's already a resource for this lesson
      const { data: existingResources, error: fetchError } = await supabase
        .from('lesson_resources')
        .select('*')
        .eq('lesson_id', lessonId)
        .is('deleted_at', null);
      
      if (fetchError) {
        console.error('Error fetching existing resources:', fetchError);
      }
      
      // Determine file type based on attachment name
      const fileExt = attachmentName.split('.').pop().toLowerCase();
      const fileType = determineFileType(fileExt);
      
      // Determine resource type based on lesson type
      let resourceType = 'pdf';
      if (lessonType === 'video') {
        resourceType = 'video';
      } else if (lessonType === 'slide') {
        resourceType = 'slide';
      }
      
      // Resource data to insert or update
      const resourcePayload = {
        lesson_id: lessonId,
        title: attachmentName,
        type: resourceType,
        content_url: attachmentUrl,
        file_type: fileType,
        updated_at: new Date().toISOString()
      };
      
      // If there's an existing resource, update it. Otherwise create a new one
      if (existingResources && existingResources.length > 0) {
        const { data: updatedResource, error: updateError } = await supabase
          .from('lesson_resources')
          .update(resourcePayload)
          .eq('id', existingResources[0].id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Error updating lesson resource:', updateError);
        } else {
          resourceData = updatedResource;
        }
      } else {
        const { data: newResource, error: insertError } = await supabase
          .from('lesson_resources')
          .insert([resourcePayload])
          .select()
          .single();
        
        if (insertError) {
          console.error('Error creating lesson resource:', insertError);
        } else {
          resourceData = newResource;
        }
      }
    }
    
    // Return the lesson with its resource attached
    return { ...updatedLesson, resource: resourceData };
  } catch (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }
};

/**
 * Soft delete a lesson by setting deleted_at timestamp
 * @param {string} lessonId - The ID of the lesson to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteLesson = async (lessonId) => {
  try {
    const { error } = await supabase
      .from('lessons')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', lessonId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
};

/**
 * Reorder lessons within a unit
 * @param {string} unitId - The ID of the unit containing the lessons
 * @param {Array<string>} lessonIds - Ordered array of lesson IDs
 * @returns {Promise<Array>} Updated array of lessons
 */
export const reorderUnitLessons = async (unitId, lessonIds) => {
  try {
    // Update each lesson with its new position
    const updatePromises = lessonIds.map((lessonId, index) => {
      return supabase
        .from('lessons')
        .update({ order_position: index + 1 })
        .eq('id', lessonId);
    });
    
    await Promise.all(updatePromises);
    
    // Fetch and return the updated lessons
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('unit_id', unitId)
      .is('deleted_at', null)
      .order('order_position', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error reordering lessons:', error);
    throw error;
  }
};

/**
 * Upload a file attachment for a lesson
 * @param {string} lessonId - The ID of the lesson
 * @param {Object} file - File object to upload
 * @returns {Promise<string>} URL of the uploaded file
 */
export const uploadLessonAttachment = async (lessonId, file) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${lessonId}_${Date.now()}.${fileExt}`;
    const filePath = `lessons/${fileName}`;
    
    // Determine content type explicitly based on file extension first
    let contentType = determineContentTypeByExtension(fileExt);
    
    // If we couldn't determine by extension, fall back to the provided type or default
    if (contentType === 'application/octet-stream' && file.type) {
      contentType = file.type;
    }
    
    // For video files, always make sure we use a standard video MIME type
    // This helps with video playback compatibility
    const extension = fileExt.toLowerCase();
    if (extension === 'mp4' || extension === 'mov' || extension === 'avi' || extension === 'webm') {
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
          // If we don't recognize the extension but know it's video, default to mp4
          if (file.type && file.type.startsWith('video/')) {
            contentType = file.type;
          } else {
            contentType = 'video/mp4'; // Default for videos
          }
          break;
      }
      
      console.log(`Setting explicit video content type: ${contentType} for file: ${file.name}`);
    }
    
    console.log(`Uploading file: ${file.name}, type: ${contentType}`);
    
    let publicUrl;
    
    if (Platform.OS === 'web') {
      // For web, use standard Blob approach
      const response = await fetch(file.uri);
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
      
      // Get the public URL for the file
      const { data: publicURLData } = supabase
        .storage
        .from('course-content')
        .getPublicUrl(filePath);
      
      publicUrl = publicURLData.publicUrl;
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
        file.uri, 
        uploadOptions
      );
      
      if (uploadResult.status !== 200) {
        console.error('Upload failed:', uploadResult);
        throw new Error(`Upload failed with status ${uploadResult.status}`);
      }
      
      console.log('File uploaded successfully via signed URL');
      
      // Get the public URL for the file
      const { data: publicURLData } = supabase
        .storage
        .from('course-content')
        .getPublicUrl(filePath);
      
      publicUrl = publicURLData.publicUrl;
    }
    
    console.log('File uploaded successfully:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading lesson attachment:', error);
    throw error;
  }
};
