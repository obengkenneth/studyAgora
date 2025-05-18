import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Platform } from 'react-native';
import { Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../../services/supabase';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

const ThumbnailPicker = ({ 
  storageId, 
  existingImageUrl = null, 
  onImageUploaded, 
  containerStyle = {},
  storageBucket = 'course-thumbnails'
}) => {
  const [thumbnailImage, setThumbnailImage] = useState(existingImageUrl);
  const [isUploading, setIsUploading] = useState(false);

  // Handle picking an image from the library
  const handleImagePick = async () => {
    try {
      // Request permission to access the media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant media library permissions to select an image.');
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
      setIsUploading(true);
      
      const filePath = `${storageBucket}/${storageId}/${Date.now()}_${fileInfo.name}`;
      let contentType = fileInfo.mimeType || 'image/jpeg';
      
      console.log(`Uploading thumbnail: ${fileInfo.name}, type: ${contentType}`);
      
      if (Platform.OS === 'web') {
        // For web, use standard Blob approach
        const response = await fetch(fileInfo.uri);
        const blob = await response.blob();
        
        const { data, error } = await supabase
          .storage
          .from(storageBucket)
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
          .from(storageBucket)
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
        .from(storageBucket)
        .getPublicUrl(filePath);
      
      console.log('Thumbnail uploaded successfully:', publicURLData.publicUrl);
      
      // Call the callback with the new image URL
      if (onImageUploaded) {
        onImageUploaded(publicURLData.publicUrl);
      }
      
      setIsUploading(false);
      return publicURLData.publicUrl;
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      setIsUploading(false);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  return (
    <View style={[styles.thumbnailContainer, containerStyle]}>
      <Text style={styles.inputLabel}>Course Thumbnail</Text>
      <TouchableOpacity 
        style={styles.thumbnailButton} 
        onPress={handleImagePick}
        disabled={isUploading}
      >
        {thumbnailImage ? (
          <View style={styles.thumbnailImageContainer}>
            <Image 
              source={{ uri: thumbnailImage }} 
              style={styles.thumbnailImage} 
              resizeMode="cover" 
            />
            <View style={styles.thumbnailOverlay}>
              <Text style={styles.thumbnailOverlayText}>Change Image</Text>
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <ImageIcon size={36} color={COLORS.lightText} />
            <Text style={styles.placeholderText}>Select Thumbnail Image</Text>
          </View>
        )}

        {isUploading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  thumbnailContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  thumbnailButton: {
    height: 180,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImageContainer: {
    width: '100%',
    height: '100%',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailOverlayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    color: COLORS.lightText,
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ThumbnailPicker;
