import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList
} from 'react-native';
import { ArrowLeft, FileText, Video as VideoIcon, File, Image as ImageIcon, Download, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, PenLine, Save, Trash } from 'lucide-react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as WebBrowser from 'expo-web-browser';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../../navigation/AuthContext';
import { showAlert } from '../../components/BeautifulAlert';
import { fetchLessonById } from '../../services/api/lessonService';
import { fetchUnitById } from '../../services/api/unitService';
import { fetchLessonNotes, createLessonNote, updateLessonNote, deleteLessonNote } from '../../services/api/lessonNotesService';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

export default function LessonDetailsScreen({ route, navigation }) {
  const { lessonId } = route.params;
  const { userProfile, hasRole } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [lessonResource, setLessonResource] = useState(null);
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [videoStatus, setVideoStatus] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [notesLoading, setNotesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content'); // 'content' or 'notes'
  const videoRef = useRef(null);
  
  const windowWidth = Dimensions.get('window').width;
  const isFacilitator = hasRole('facilitator');
  
  useEffect(() => {
    loadLessonDetails();
    if (userProfile) {
      loadLessonNotes();
    }
  }, [lessonId, userProfile]);
  
  const loadLessonNotes = async () => {
    try {
      setNotesLoading(true);
      const notesData = await fetchLessonNotes(lessonId, userProfile.user_id);
      setNotes(notesData);
      setNotesLoading(false);
    } catch (error) {
      console.error('Error loading lesson notes:', error);
      setNotesLoading(false);
    }
  };
  
  const handleAddNote = async () => {
    if (!currentNote.trim()) return;
    
    try {
      const newNote = {
        content: currentNote,
        lesson_id: lessonId,
        user_id: userProfile.user_id,
        timestamp: position, // Save current video position with the note
      };
      
      const savedNote = await createLessonNote(newNote);
      setNotes(prevNotes => [...prevNotes, savedNote]);
      setCurrentNote('');
      
      showAlert('success', 'Success', 'Note saved successfully', [
        { text: 'OK', primary: true }
      ]);
    } catch (error) {
      console.error('Error saving note:', error);
      showAlert('error', 'Error', 'Failed to save note', [
        { text: 'OK', primary: true }
      ]);
    }
  };
  
  const handleEditNote = (note) => {
    setCurrentNote(note.content);
    setEditingNoteId(note.id);
  };
  
  const handleUpdateNote = async () => {
    if (!currentNote.trim() || !editingNoteId) return;
    
    try {
      const updatedNote = await updateLessonNote(editingNoteId, { content: currentNote });
      
      setNotes(prevNotes => 
        prevNotes.map(note => note.id === editingNoteId ? updatedNote : note)
      );
      
      setCurrentNote('');
      setEditingNoteId(null);
      
      showAlert('success', 'Success', 'Note updated successfully', [
        { text: 'OK', primary: true }
      ]);
    } catch (error) {
      console.error('Error updating note:', error);
      showAlert('error', 'Error', 'Failed to update note', [
        { text: 'OK', primary: true }
      ]);
    }
  };
  
  const handleDeleteNote = async (noteId) => {
    try {
      await deleteLessonNote(noteId);
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
      
      if (editingNoteId === noteId) {
        setCurrentNote('');
        setEditingNoteId(null);
      }
      
      showAlert('success', 'Success', 'Note deleted successfully', [
        { text: 'OK', primary: true }
      ]);
    } catch (error) {
      console.error('Error deleting note:', error);
      showAlert('error', 'Error', 'Failed to delete note', [
        { text: 'OK', primary: true }
      ]);
    }
  };
  
  const formatTimestamp = (millis) => {
    if (!millis) return '00:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const loadLessonDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch lesson details
      const lessonData = await fetchLessonById(lessonId);
      setLesson(lessonData);
      
      // If the lesson has a resource attached, set it
      if (lessonData.resource) {
        setLessonResource(lessonData.resource);
      }
      
      // Fetch associated unit details
      if (lessonData?.unit_id) {
        const unitData = await fetchUnitById(lessonData.unit_id);
        setUnit(unitData);
        
        // Update navigation header when unit data is loaded
        if (unitData) {
          navigation.setOptions({
            headerTitle: unitData.title || 'Unit'
          });
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading lesson details:', error);
      showAlert('error', 'Error', 'Failed to load lesson details', [
        { text: 'OK', primary: true }
      ]);
      setLoading(false);
    }
  };
  
  // Handle navigation back to unit
  const handleGoBack = () => {
    navigation.goBack();
  };
  
  // Handle opening a PDF or document
  const handleOpenDocument = async (url, filename) => {
    try {
      if (Platform.OS === 'web') {
        // For web, just open the URL in a new tab
        window.open(url, '_blank');
      } else {
        // For mobile, open in WebBrowser
        await WebBrowser.openBrowserAsync(url);
      }
    } catch (error) {
      console.error('Error opening document:', error);
      showAlert('error', 'Error', 'Failed to open document', [
        { text: 'OK', primary: true }
      ]);
    }
  };
  
  // Handle downloading a file
  const handleDownloadFile = async (url, filename) => {
    try {
      // First check if we have permission
      const { status: existingStatus } = await MediaLibrary.getPermissionsAsync();
      
      // If we don't have permission, request it
      if (existingStatus !== 'granted') {
        const { status: newStatus } = await MediaLibrary.requestPermissionsAsync();
        
        if (newStatus !== 'granted') {
          // User denied permission after being asked
          showAlert('error', 'Permission Denied', 'The app needs permission to save files to your device. Please enable this in your device settings.', [
            { text: 'OK', primary: true }
          ]);
          return;
        }
      }
      
      setDownloading(true);
      
      // Create a local file URI in the cache directory
      const fileUri = FileSystem.cacheDirectory + filename;
      
      // Download the file, showing progress
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        fileUri,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );
      
      const { uri } = await downloadResumable.downloadAsync();
      
      if (Platform.OS === 'ios') {
        // On iOS, use the sharing API
        await Sharing.shareAsync(uri);
      } else {
        // On Android, save to media library
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('StudyAgora', asset, false);
        
        showAlert('success', 'Success', `File saved to your device in the StudyAgora folder`, [
          { text: 'OK', primary: true }
        ]);
      }
      
      setDownloading(false);
      setDownloadProgress(0);
      
    } catch (error) {
      console.error('Error downloading file:', error);
      setDownloading(false);
      showAlert('error', 'Download Failed', 'Failed to download the file', [
        { text: 'OK', primary: true }
      ]);
    }
  };
  
  // Render tabs for content and notes
  const renderTabs = () => {
    return (
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'content' && styles.activeTab]}
          onPress={() => setActiveTab('content')}
        >
          <Text style={[styles.tabText, activeTab === 'content' && styles.activeTabText]}>Content</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>Notes</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render notes tab content
  const renderNotesTab = () => {
    return (
      <View style={styles.notesContainer}>
        <View style={styles.noteInputContainer}>
          <TextInput
            style={styles.noteInput}
            placeholder="Add a note..."
            value={currentNote}
            onChangeText={setCurrentNote}
            multiline
          />
          <TouchableOpacity 
            style={styles.addNoteButton}
            onPress={editingNoteId ? handleUpdateNote : handleAddNote}
          >
            <Text style={styles.addNoteButtonText}>
              {editingNoteId ? 'Update' : 'Add'} Note
            </Text>
            {editingNoteId ? <Save size={16} color="#FFF" /> : <PenLine size={16} color="#FFF" />}
          </TouchableOpacity>
        </View>
        
        {notesLoading ? (
          <ActivityIndicator size="small" color={COLORS.primary} style={styles.notesLoading} />
        ) : notes.length === 0 ? (
          <View style={styles.emptyNotesContainer}>
            <Text style={styles.emptyNotesText}>No notes yet</Text>
            <Text style={styles.emptyNotesSubtext}>Add notes to help you remember important points</Text>
          </View>
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.noteItem}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteTimestamp}>
                    {item.timestamp ? formatTimestamp(item.timestamp) : 'No timestamp'}
                  </Text>
                  <View style={styles.noteActions}>
                    <TouchableOpacity
                      style={styles.noteAction}
                      onPress={() => handleEditNote(item)}
                    >
                      <PenLine size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.noteAction}
                      onPress={() => handleDeleteNote(item.id)}
                    >
                      <Trash size={16} color={COLORS.secondary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.noteContent}>{item.content}</Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.notesList}
            // Adding these props to improve performance
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={10}
          />
        )}
      </View>
    );
  };
    
  // Handle video playback status updates
  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
      setProgressPercentage((status.positionMillis / status.durationMillis) * 100);
      
      if (status.didJustFinish) {
        // When video ends, just stop playing and don't auto-restart
        setIsPlaying(false);
        // Don't reset position - let the user press play to restart
      }
    }
  };
  
  // Toggle play/pause
  const togglePlayPause = async () => {
    if (!videoRef.current) return;
    
    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        // If video has ended (position is at or near the end), first seek to beginning
        if (position >= duration - 100) { // Give 100ms threshold for rounding errors
          // First seek to beginning - this is crucial for fullscreen mode
          await videoRef.current.setPositionAsync(0);
          // Update our state to match
          setPosition(0);
          setProgressPercentage(0);
        }
        // Then play the video
        await videoRef.current.playAsync();
      }
      
      setIsPlaying(!isPlaying);
      setShowControls(true);
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };
  
  // Toggle mute/unmute
  const toggleMute = async () => {
    if (!videoRef.current) return;
    
    // Save current playing state
    const wasPlaying = isPlaying;
    
    // Set muted state
    await videoRef.current.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
    
    // If video was playing before muting and now it's paused, resume playback
    if (wasPlaying && !isPlaying) {
      await videoRef.current.playAsync();
    }
  };
  
  // Skip backward 10 seconds
  const skipBackward = async () => {
    if (!videoRef.current) return;
    
    if (position > 10000) {
      await videoRef.current.setPositionAsync(position - 10000);
    } else {
      await videoRef.current.setPositionAsync(0);
    }
  };
  
  // Skip forward 10 seconds
  const skipForward = async () => {
    if (!videoRef.current) return;
    
    if (position < duration - 10000) {
      await videoRef.current.setPositionAsync(position + 10000);
    } else {
      await videoRef.current.setPositionAsync(duration);
    }
  };
  
  // Handle video press to show/hide controls
  const handleVideoPress = () => {
    if (isPlaying) {
      // When playing, toggle controls visibility
      setShowControls(!showControls);
    } else {
      // When paused, always show controls and toggle play state
      setShowControls(true);
      togglePlayPause();
    }
  };
  
  // Seek to a specific position in the video
  const seekVideo = async (value) => {
    if (!videoRef.current) return;
    
    const newPosition = (value / 100) * duration;
    await videoRef.current.setPositionAsync(newPosition);
  };
  
  // Enter fullscreen mode
  const enterFullscreen = async () => {
    if (!videoRef.current) return;
    
    try {
      // Simply present the fullscreen player
      await videoRef.current.presentFullscreenPlayer();
      setIsFullscreen(true);
    } catch (error) {
      console.error('Error entering fullscreen:', error);
    }
  };
          
  // Format time (milliseconds to MM:SS)
  const formatTime = (millis) => {
    if (!millis) return '00:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Add loading and error states
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // If the lesson doesn't exist or there was an error
  if (!lesson) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lesson not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Render content based on lesson type
  const renderLessonContent = () => {
    if (!lesson) return null;

    if (lessonResource) {
      switch (lessonResource.type) {
        case 'video':
          return (
            <View style={styles.mediaContainer}>
              <TouchableOpacity
                activeOpacity={1}
                onPress={handleVideoPress}
                style={styles.videoContainer}
              >
                <Video
                  ref={videoRef}
                  source={{ uri: lessonResource.content_url }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={isMuted}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={false}
                  useNativeControls={false} // Keep our custom controls for consistent experience
                  style={styles.videoPlayer}
                  onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                  onFullscreenUpdate={({ fullscreenUpdate }) => {
                    if (fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS ||
                        fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_DID_DISMISS) {
                      setIsFullscreen(false);
                      
                      // When exiting fullscreen, check if video ended and reset if needed
                      if (position >= duration - 100) {
                        videoRef.current?.setPositionAsync(0);
                        setPosition(0);
                        setProgressPercentage(0);
                      }
                    } else if (fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_DID_PRESENT) {
                      setIsFullscreen(true);
                    }
                  }}
                />

                {showControls && (
                  <View style={styles.controlsOverlay}>
                    <View style={styles.topControls}>
                      <Text style={styles.videoTitle}>{lesson?.title || 'Video Lesson'}</Text>
                    </View>

                    {/* Center play button - only shown when paused */}
                    {!isPlaying && (
                      <TouchableOpacity
                        style={styles.centerButton}
                        onPress={togglePlayPause}
                      >
                        <Play size={40} color="#FFF" />
                      </TouchableOpacity>
                    )}

                    <View style={styles.bottomControls}>
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBackground}>
                          <View
                            style={[
                              styles.progressFill,
                              { width: `${progressPercentage}%` },
                            ]}
                          />
                        </View>
                        <View
                          style={[
                            styles.progressThumb,
                            { left: `${progressPercentage}%` },
                          ]}
                        />
                      </View>

                      <View style={styles.controlsRow}>
                        <Text style={styles.timeText}>
                          {formatTime(position)} / {formatTime(duration)}
                        </Text>

                        <View style={styles.controlButtons}>
                          <TouchableOpacity
                            onPress={skipBackward}
                            style={styles.controlButton}
                          >
                            <SkipBack size={22} color="#FFF" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={togglePlayPause}
                            style={styles.controlButton}
                          >
                            {isPlaying ? (
                              <Pause size={22} color="#FFF" />
                            ) : (
                              <Play size={22} color="#FFF" />
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={skipForward}
                            style={styles.controlButton}
                          >
                            <SkipForward size={22} color="#FFF" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={toggleMute}
                            style={styles.controlButton}
                          >
                            {isMuted ? (
                              <VolumeX size={22} color="#FFF" />
                            ) : (
                              <Volume2 size={22} color="#FFF" />
                            )}
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={enterFullscreen}
                            style={styles.controlButton}
                          >
                            <Maximize size={22} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );

        case 'pdf':
          return (
            <View style={styles.attachmentContainer}>
              <File size={40} color={COLORS.primary} />
              <Text style={styles.attachmentName}>{lessonResource.title}</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() =>
                    handleOpenDocument(lessonResource.content_url, lessonResource.title)
                  }
                >
                  <Text style={styles.viewButtonText}>View PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.downloadPdfButton}
                  onPress={() =>
                    handleDownloadFile(lessonResource.content_url, lessonResource.title || 'file')
                  }
                  disabled={downloading}
                >
                  {downloading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Download size={16} color="#FFF" />
                      <Text style={styles.downloadButtonText}>Download</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );

        case 'slide':
          return (
            <View style={styles.attachmentContainer}>
              <FileText size={40} color={COLORS.primary} />
              <Text style={styles.attachmentName}>{lessonResource.title}</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() =>
                    handleOpenDocument(lessonResource.content_url, lessonResource.title)
                  }
                >
                  <Text style={styles.viewButtonText}>View Presentation</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.downloadPdfButton}
                  onPress={() =>
                    handleDownloadFile(lessonResource.content_url, lessonResource.title || 'file')
                  }
                  disabled={downloading}
                >
                  {downloading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Download size={16} color="#FFF" />
                      <Text style={styles.downloadButtonText}>Download</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );

        default:
          return (
            <View style={styles.noResourceContainer}>
              <Text style={styles.noResourceText}>
                No resource available for this lesson.
              </Text>
            </View>
          );
      }
    } else {
      switch (lesson.lesson_type) {
        case 'video':
          return lesson.attachment_url ? (
            <View style={styles.mediaContainer}>
              <Video
                source={{ uri: lesson.attachment_url }}
                rate={1.0}
                volume={1.0}
                isMuted={false}
                resizeMode="contain"
                shouldPlay={false}
                useNativeControls
                style={styles.videoPlayer}
                onPlaybackStatusUpdate={(status) => console.log(status)}
              />
            </View>
          ) : (
            <View style={styles.textContentContainer}>
              <Text style={styles.textContent}>{lesson.description}</Text>
            </View>
          );

        case 'image':
          return lesson.attachment_url ? (
            <View style={styles.mediaContainer}>
              <Image
                source={{ uri: lesson.attachment_url }}
                style={styles.imageContent}
                resizeMode="contain"
              />
            </View>
          ) : (
            <View style={styles.textContentContainer}>
              <Text style={styles.textContent}>{lesson.description}</Text>
            </View>
          );

        case 'pdf':
          return lesson.attachment_url ? (
            <View style={styles.attachmentContainer}>
              <File size={40} color={COLORS.primary} />
              <Text style={styles.attachmentName}>
                {lesson.attachment_name || 'Document'}
              </Text>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() =>
                  handleOpenDocument(lesson.attachment_url, lesson.attachment_name || 'document.pdf')
                }
              >
                <Text style={styles.viewButtonText}>View PDF</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.textContentContainer}>
              <Text style={styles.textContent}>{lesson.description}</Text>
            </View>
          );

        default:
          return (
            <View style={styles.textContentContainer}>
              {lesson.attachment_url && (
                <View style={styles.attachmentRow}>
                  <File size={20} color={COLORS.primary} />
                  <Text style={styles.attachmentLabel}>
                    {lesson.attachment_name || 'Attachment'}
                  </Text>
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() =>
                      handleDownloadFile(lesson.attachment_url, lesson.attachment_name || 'file')
                    }
                  >
                    <Text style={styles.downloadButtonText}>Download</Text>
                  </TouchableOpacity>
                </View>
              )}
              <Text style={styles.textContent}>{lesson.description}</Text>
            </View>
          );
      }
    }
  };

  // These functions were moved to the top where they're already defined

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {lesson?.title || 'Lesson'}
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.metaContainer}>
          <View style={styles.typeIconContainer}>
            {lessonResource ? (
              lessonResource.type === 'video' ? (
                <VideoIcon size={20} color={COLORS.primary} />
              ) : lessonResource.type === 'image' ? (
                <ImageIcon size={20} color={COLORS.primary} />
              ) : lessonResource.type === 'pdf' ? (
                <File size={20} color={COLORS.primary} />
              ) : (
                <FileText size={20} color={COLORS.primary} />
              )
            ) : (
              <FileText size={20} color={COLORS.primary} />
            )}
          </View>
          <View style={styles.metaInfo}>
            <Text style={styles.lessonTitle}>{lesson?.title || 'Lesson'}</Text>
            <Text style={styles.unitName}>
              {unit ? `From: ${unit?.title || 'Unit'}` : ''}
            </Text>
          </View>
        </View>
        
        {/* Video content is always displayed, regardless of tab */}
        {lessonResource && lessonResource.type === 'video' && (
          <View style={styles.mediaContainer}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleVideoPress}
              style={styles.videoContainer}
            >
              <Video
                ref={videoRef}
                source={{ uri: lessonResource.content_url }}
                rate={1.0}
                volume={1.0}
                isMuted={isMuted}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={false}
                useNativeControls={false}
                style={styles.videoPlayer}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                onFullscreenUpdate={({ fullscreenUpdate }) => {
                  if (fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS ||
                      fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_DID_DISMISS) {
                    setIsFullscreen(false);
                    
                    // When exiting fullscreen, check if video ended and reset if needed
                    if (position >= duration - 100) {
                      videoRef.current?.setPositionAsync(0);
                      setPosition(0);
                      setProgressPercentage(0);
                    }
                  } else if (fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_DID_PRESENT) {
                    setIsFullscreen(true);
                  }
                }}
              />

              {showControls && (
                <View style={styles.controlsOverlay}>
                  <View style={styles.topControls}>
                    <Text style={styles.videoTitle}>{lesson?.title || 'Video Lesson'}</Text>
                  </View>

                  {/* Center play button - only shown when paused */}
                  {!isPlaying && (
                    <TouchableOpacity
                      style={styles.centerButton}
                      onPress={togglePlayPause}
                    >
                      <Play size={40} color="#FFF" />
                    </TouchableOpacity>
                  )}

                  <View style={styles.bottomControls}>
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBackground}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${progressPercentage}%` },
                          ]}
                        />
                      </View>
                      <View
                        style={[
                          styles.progressThumb,
                          { left: `${progressPercentage}%` },
                        ]}
                      />
                    </View>

                    <View style={styles.controlsRow}>
                      <Text style={styles.timeText}>
                        {formatTime(position)} / {formatTime(duration)}
                      </Text>

                      <View style={styles.controlButtons}>
                        <TouchableOpacity
                          onPress={skipBackward}
                          style={styles.controlButton}
                        >
                          <SkipBack size={22} color="#FFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={togglePlayPause}
                          style={styles.controlButton}
                        >
                          {isPlaying ? (
                            <Pause size={22} color="#FFF" />
                          ) : (
                            <Play size={22} color="#FFF" />
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={skipForward}
                          style={styles.controlButton}
                        >
                          <SkipForward size={22} color="#FFF" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={toggleMute}
                          style={styles.controlButton}
                        >
                          {isMuted ? (
                            <VolumeX size={22} color="#FFF" />
                          ) : (
                            <Volume2 size={22} color="#FFF" />
                          )}
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={enterFullscreen}
                          style={styles.controlButton}
                        >
                          <Maximize size={22} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {/* Download button, available on both tabs */}
        {lessonResource && lessonResource.content_url && (
          <View style={styles.downloadButtonContainer}>
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() =>
                handleDownloadFile(lessonResource.content_url, lessonResource.title || 'file')
              }
              disabled={downloading}
            >
              {downloading ? (
                <View style={styles.downloadProgress}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.downloadProgressText}>
                    {Math.round(downloadProgress * 100)}%
                  </Text>
                </View>
              ) : (
                <>
                  <Download size={18} color={COLORS.primary} />
                  <Text style={styles.downloadButtonText}>
                    {lessonResource?.type === 'video' ? 'Download Video' : 'Download Document'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {renderTabs()}
        
        {activeTab === 'notes' ? (
          <View style={{flex: 1}}>
            {renderNotesTab()}
          </View>
        ) : (
          <ScrollView style={styles.contentContainer}>
            {/* Only non-video content is rendered here, since video is already shown above */}
            {lessonResource && lessonResource.type !== 'video' && renderLessonContent()}
            
            <View style={styles.tabContent}>
              <Text style={styles.lessonDescription}>
                {lesson?.description || 'No description available'}
              </Text>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  typeIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
  },
  metaInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  unitName: {
    fontSize: 14,
    color: COLORS.lightText,
  },
  mainContent: {
    padding: 20,
    paddingTop: 10,
  },
  mediaContainer: {
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#000',
    aspectRatio: 16 / 9,
    marginVertical: 16,
    marginHorizontal: 0,
    position: 'relative',
    width: '100%',
    alignSelf: 'stretch',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'space-between',
    padding: 8,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
  },
  videoTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  centerButton: {
    alignSelf: 'center',
    padding: 12,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomControls: {
    width: '100%',
    padding: 8,
  },
  progressContainer: {
    width: '100%',
    height: 20,
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF0000', // YouTube red
    borderRadius: 2,
  },
  progressThumb: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF0000',
    position: 'absolute',
    top: 4,
    marginLeft: -6,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    color: 'white',
    fontSize: 12,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    marginHorizontal: 8,
  },
  imageContent: {
    width: '100%',
    height: '100%',
  },
  textContentContainer: {
    marginVertical: 16,
  },
  textContent: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
  },
  attachmentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginVertical: 16,
  },
  attachmentName: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 20,
    color: COLORS.text,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  viewButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  downloadPdfButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  downloadButtonContainer: {
    alignItems: 'center',
    marginVertical: 12,
    marginHorizontal: 16,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 150, // Ensure enough width for the text
  },
  downloadButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 10,
  },
  downloadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadProgressText: {
    color: COLORS.primary,
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 8,
  },
  downloadIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  attachmentLabel: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  downloadButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  downloadCaption: {
    color: COLORS.lightText,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  downloadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadProgressText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },
  noResourceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginVertical: 16,
  },
  noResourceText: {
    fontSize: 16,
    color: COLORS.lightText,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.secondary,
    marginBottom: 20,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 24,
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    color: COLORS.lightText,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  lessonDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
  },
  notesContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  noteInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  noteInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginRight: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  addNoteButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    width: 80,
  },
  addNoteButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
    marginBottom: 4,
  },
  notesList: {
    paddingBottom: 20,
  },
  noteItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTimestamp: {
    fontSize: 12,
    color: COLORS.lightText,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteAction: {
    padding: 6,
    marginLeft: 8,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  notesLoading: {
    marginTop: 20,
  },
  emptyNotesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyNotesText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.lightText,
    marginBottom: 8,
  },
  emptyNotesSubtext: {
    fontSize: 14,
    color: COLORS.lightText,
    textAlign: 'center',
  },
});
