import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  Dimensions,
  Alert,
  Platform,
  TouchableOpacity
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';
import { Download, ExternalLink, FileText, File } from 'lucide-react-native';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

const DocumentViewer = ({ documentUri, title, fileType }) => {
  const [loading, setLoading] = useState(true);
  const [localUri, setLocalUri] = useState(null);
  const [error, setError] = useState(null);
  const [androidPreview, setAndroidPreview] = useState(null);
  
  useEffect(() => {
    // Download and cache the document for viewing
    const downloadDocument = async () => {
      try {
        setLoading(true);
        
        // Clean up the filename for local storage
        const fileName = documentUri.split('/').pop();
        const fileExtension = fileName.split('.').pop().toLowerCase();
        
        // Create a local cache directory if it doesn't exist
        const cacheDir = `${FileSystem.cacheDirectory}docs/`;
        const dirInfo = await FileSystem.getInfoAsync(cacheDir);
        
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
        }
        
        // Local path for the downloaded file
        const localPath = `${cacheDir}${fileName}`;
        
        // Check if file already exists in cache
        const fileInfo = await FileSystem.getInfoAsync(localPath);
        
        if (fileInfo.exists) {
          console.log('File already in cache, using cached version');
          setLocalUri(fileInfo.uri);
        } else {
          console.log('Downloading document:', documentUri);
          
          // Download the file
          const downloadResult = await FileSystem.downloadAsync(
            documentUri,
            localPath
          );
          
          if (downloadResult.status === 200) {
            setLocalUri(downloadResult.uri);
            console.log('Document downloaded to:', downloadResult.uri);
          } else {
            throw new Error('Failed to download document');
          }
        }
        
        // For Android, we'll use the original URL for display
        // since file:// URLs don't work well in WebView on Android
        if (Platform.OS === 'android') {
          setAndroidPreview(documentUri);
        }
      } catch (err) {
        console.error('Error downloading document:', err);
        setError('Failed to load document. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    if (documentUri) {
      downloadDocument();
    }
  }, [documentUri]);
  
  const openDocumentExternally = () => {
    Linking.openURL(documentUri)
      .catch((err) => {
        console.error('Error opening document URL:', err);
        Alert.alert('Error', 'Could not open the document');
      });
  };
  
  // Function to determine the content type for WebView
  const getContentType = () => {
    if (!fileType) return 'application/pdf';
    
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf')) return 'application/pdf';
    if (type.includes('doc') || type.includes('word')) return 'application/msword';
    if (type.includes('sheet') || type.includes('excel')) return 'application/vnd.ms-excel';
    if (type.includes('presentation') || type.includes('powerpoint')) return 'application/vnd.ms-powerpoint';
    
    return 'application/pdf'; // Default to PDF
  };
  
  // Get an appropriate icon for the document type
  const getDocumentIcon = () => {
    if (!fileType) return FileText;
    
    const type = fileType.toLowerCase();
    
    if (type.includes('pdf')) return FileText;
    if (type.includes('doc') || type.includes('word')) return FileText;
    if (type.includes('sheet') || type.includes('excel')) return File;
    if (type.includes('presentation') || type.includes('powerpoint')) return File;
    
    return FileText;
  };
  
  // Render document based on platform
  const renderDocument = () => {
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={() => Linking.openURL(documentUri)}
          >
            <Download size={20} color={COLORS.primary} />
            <Text style={styles.downloadText}>Try Download Instead</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading document...</Text>
        </View>
      );
    }
    
    // Different approach based on platform
    if (Platform.OS === 'android') {
      // On Android, show a preview card and options to open externally
      const isPdf = fileType?.toLowerCase().includes('pdf');
      const DocumentIcon = getDocumentIcon();
      
      return (
        <View style={styles.androidDocumentContainer}>
          <View style={styles.documentPreview}>
            <DocumentIcon size={100} color={COLORS.primary} />
            <Text style={styles.fileExtension}>
              {fileType?.split('/')[1]?.toUpperCase() || 'DOC'}
            </Text>
          </View>
          
          <Text style={styles.documentInfo}>
            {title || 'Document'}
          </Text>
          
          <Text style={styles.documentType}>
            This document is ready to view
          </Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={openDocumentExternally}
            >
              <ExternalLink size={20} color="white" />
              <Text style={styles.actionButtonText}>Open in External App</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.downloadActionButton]}
              onPress={() => Linking.openURL(documentUri)}
            >
              <Download size={20} color="white" />
              <Text style={styles.actionButtonText}>Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    // For iOS, we can use WebView
    return (
      <View style={styles.documentContainer}>
        <WebView
          source={{ uri: localUri || documentUri }}
          style={styles.webView}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator 
              style={styles.webViewLoader} 
              size="large" 
              color={COLORS.primary} 
            />
          )}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.error('WebView error:', nativeEvent);
            
            // If WebView fails, offer to open in external app
            Alert.alert(
              'Viewing Error',
              'Cannot preview this document. Would you like to open it in another app?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Open', onPress: openDocumentExternally }
              ]
            );
          }}
        />
        
        <TouchableOpacity
          style={styles.openExternalButton}
          onPress={openDocumentExternally}
        >
          <Text style={styles.openExternalText}>Open in External App</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      {renderDocument()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 12,
    color: COLORS.text,
  },
  loadingContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  errorContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  documentContainer: {
    height: 500,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  webViewLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
  },
  openExternalButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  openExternalText: {
    color: 'white',
    fontWeight: '500',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  downloadText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.primary,
  },
  
  // Android specific styles
  androidDocumentContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    minHeight: 400,
  },
  documentPreview: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
    position: 'relative',
  },
  fileExtension: {
    position: 'absolute',
    bottom: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  documentInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.text,
    marginBottom: 8,
  },
  documentType: {
    fontSize: 14,
    color: COLORS.lightText,
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    margin: 8,
    minWidth: 150,
  },
  downloadActionButton: {
    backgroundColor: COLORS.accent,
  },
  actionButtonText: {
    marginLeft: 8,
    color: 'white',
    fontWeight: '500',
  },
});

export default DocumentViewer; 