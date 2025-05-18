import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../supabase';

/**
 * Upload a file to Supabase storage
 * Uses direct binary upload approach for React Native to prevent file corruption
 * Uses standard Blob approach for web
 * 
 * @param {Object} fileInfo - Information about the file to upload
 * @param {string} fileInfo.uri - URI of the file to upload
 * @param {string} fileInfo.name - Name of the file
 * @param {number} fileInfo.size - Size of the file in bytes
 * @param {string} fileInfo.mimeType - MIME type of the file
 * @param {string} bucketName - Name of the storage bucket
 * @param {string} folderPath - Path within the bucket to store the file
 * @returns {Promise<string>} - URL of the uploaded file
 */
export const uploadFile = async (fileInfo, bucketName, folderPath) => {
  try {
    const filePath = `${folderPath}/${Date.now()}_${fileInfo.name}`;
    let contentType = fileInfo.mimeType || 'application/octet-stream';
    
    console.log(`Uploading file: ${fileInfo.name}, type: ${contentType}`);
    
    if (Platform.OS === 'web') {
      // For web, use standard Blob approach
      const response = await fetch(fileInfo.uri);
      const blob = await response.blob();
      
      const { data, error } = await supabase
        .storage
        .from(bucketName)
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
        .from(bucketName)
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
      
      console.log('File uploaded successfully via signed URL');
    }
    
    // Get the public URL for the file
    const { data: publicURLData } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return publicURLData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
