import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Maximize2,
  Download,
  Bookmark,
  MessageSquare,
} from 'lucide-react-native';

// Colors
const COLORS = {
  primary: '#4CAF50',
  secondary: '#F44336',
  accent: '#FFD700',
  text: '#333333',
  lightText: '#757575',
  background: '#FFFFFF',
};

// Sample recordings data - would typically come from an API
const RECORDINGS = [
  {
    id: '1',
    title: 'Cambridge IGCSE Biology: Cell Structure',
    description: "This session covers the fundamental concepts of cell structure and function, including differences between plant and animal cells, organelles, and cell specialization. We'll also review common examination questions on this topic.",
    date: 'Jun 15, 2023',
    duration: '1h 25m',
    instructor: 'Dr. Emily Richards',
    category: 'cambridge',
    subject: 'Biology',
    views: 245,
    thumbnail: 'https://i.imgur.com/JR67iYK.png',
    chapterMarkers: [
      { time: '00:00', title: 'Introduction' },
      { time: '05:32', title: 'Cell Structure Basics' },
      { time: '18:45', title: 'Plant vs Animal Cells' },
      { time: '35:10', title: 'Cell Organelles' },
      { time: '52:30', title: 'Cell Specialization' },
      { time: '1:10:15', title: 'Exam Question Review' },
    ],
  },
  {
    id: '2',
    title: 'SAT Reading: Critical Analysis Techniques',
    description: "Learn essential strategies for the SAT Reading section, focusing on critical analysis of passages, identifying author's intent, and answering evidence-based questions efficiently.",
    date: 'Jun 12, 2023',
    duration: '1h 15m',
    instructor: 'Prof. Robert Harris',
    category: 'sat',
    subject: 'Reading',
    views: 189,
    thumbnail: 'https://i.imgur.com/6ULPqYq.png',
    chapterMarkers: [
      { time: '00:00', title: 'Introduction to SAT Reading' },
      { time: '07:15', title: 'Passage Analysis Strategy' },
      { time: '22:40', title: 'Author Intent and Tone' },
      { time: '38:55', title: 'Evidence-Based Questions' },
      { time: '55:10', title: 'Practice Examples' },
    ],
  },
];

const RecordingPlayerScreen = ({ route, navigation }) => {
  const { recordingId } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [progress, setProgress] = useState(0); // 0 to 1
  
  // Find the recording by ID
  const recording = RECORDINGS.find(r => r.id === recordingId) || RECORDINGS[0];
  
  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Format time for display (e.g., "1:23:45")
  const formatTime = (timeString) => {
    return timeString;
  };
  
  // Calculate progress percentages
  const progressStyle = {
    width: `${progress * 100}%`,
  };
  
  return (
    <ScrollView style={styles.container}>
      {/* Video Player Section */}
      <View style={styles.playerContainer}>
        <Image
          source={{ uri: recording.thumbnail }}
          style={styles.videoThumbnail}
        />
        
        {/* Play indicator overlay */}
        {!isPlaying && (
          <View style={styles.playOverlay}>
            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayPause}
            >
              <Play size={32} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Video controls */}
        <View style={styles.controlsContainer}>
          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, progressStyle]} />
            </View>
            <Text style={styles.timeText}>
              {currentTime} / {recording.duration}
            </Text>
          </View>
          
          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity style={styles.controlButton}>
              <SkipBack size={22} color={COLORS.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={togglePlayPause}
            >
              {isPlaying ? (
                <Pause size={22} color="#FFFFFF" />
              ) : (
                <Play size={22} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <SkipForward size={22} color={COLORS.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <Volume2 size={22} color={COLORS.text} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <Maximize2 size={22} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Recording Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.recordingTitle}>{recording.title}</Text>
        <Text style={styles.instructorName}>{recording.instructor}</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Subject:</Text>
          <Text style={styles.infoValue}>{recording.subject}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date:</Text>
          <Text style={styles.infoValue}>{recording.date}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Duration:</Text>
          <Text style={styles.infoValue}>{recording.duration}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Views:</Text>
          <Text style={styles.infoValue}>{recording.views}</Text>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Download size={18} color={COLORS.primary} />
            <Text style={styles.actionText}>Download</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Bookmark size={18} color={COLORS.primary} />
            <Text style={styles.actionText}>Bookmark</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <MessageSquare size={18} color={COLORS.primary} />
            <Text style={styles.actionText}>Notes</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Description Section */}
      <View style={styles.descriptionSection}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descriptionText}>
          {recording.description}
        </Text>
      </View>
      
      {/* Chapters Section */}
      <View style={styles.chaptersSection}>
        <Text style={styles.sectionTitle}>Chapters</Text>
        
        {recording.chapterMarkers.map((chapter, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.chapterItem}
            onPress={() => {
              setCurrentTime(chapter.time);
              setProgress(parseFloat(chapter.time) / parseFloat(recording.duration));
            }}
          >
            <Text style={styles.chapterTime}>{chapter.time}</Text>
            <Text style={styles.chapterTitle}>{chapter.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  playerContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#222',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  controlButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  recordingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  instructorName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.lightText,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 6,
    color: COLORS.primary,
  },
  descriptionSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
  },
  chaptersSection: {
    padding: 16,
    paddingBottom: 24,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  chapterTime: {
    width: 60,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  chapterTitle: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
});

export default RecordingPlayerScreen; 