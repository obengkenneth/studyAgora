import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import {
  Clock,
  Calendar,
  Search,
  PlayCircle,
  BookOpen,
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

// Recording categories for filtering
const RECORDING_CATEGORIES = [
  { id: 'all', name: 'All Recordings' },
  { id: 'cambridge', name: 'Cambridge' },
  { id: 'sat', name: 'SAT' },
  { id: 'ielts', name: 'IELTS' },
];

// Sample recording data
const RECORDINGS = [
  {
    id: '1',
    title: 'Cambridge IGCSE Biology: Cell Structure',
    date: 'Jun 15, 2023',
    duration: '1h 25m',
    instructor: 'Dr. Emily Richards',
    category: 'cambridge',
    subject: 'Biology',
    views: 245,
    thumbnail: 'https://i.imgur.com/JR67iYK.png',
  },
  {
    id: '2',
    title: 'SAT Reading: Critical Analysis Techniques',
    date: 'Jun 12, 2023',
    duration: '1h 15m',
    instructor: 'Prof. Robert Harris',
    category: 'sat',
    subject: 'Reading',
    views: 189,
    thumbnail: 'https://i.imgur.com/6ULPqYq.png',
  },
  {
    id: '3',
    title: 'IELTS Listening: Practice Test Strategies',
    date: 'Jun 10, 2023',
    duration: '1h 40m',
    instructor: 'Jennifer Adams',
    category: 'ielts',
    subject: 'Listening',
    views: 210,
    thumbnail: 'https://i.imgur.com/NvxMSR7.png',
  },
  {
    id: '4',
    title: 'Cambridge A-Level Physics: Waves and Optics',
    date: 'Jun 8, 2023',
    duration: '1h 30m',
    instructor: 'Dr. Michael Thompson',
    category: 'cambridge',
    subject: 'Physics',
    views: 178,
    thumbnail: 'https://i.imgur.com/bXmRxKv.png',
  },
  {
    id: '5',
    title: 'SAT Math: Algebra and Functions',
    date: 'Jun 5, 2023',
    duration: '1h 20m',
    instructor: 'Sarah Johnson',
    category: 'sat',
    subject: 'Mathematics',
    views: 256,
    thumbnail: 'https://i.imgur.com/JR67iYK.png',
  },
  {
    id: '6',
    title: 'Cambridge IGCSE Chemistry: Chemical Bonding',
    date: 'Jun 3, 2023',
    duration: '1h 35m',
    instructor: 'Dr. Robert Chen',
    category: 'cambridge',
    subject: 'Chemistry',
    views: 165,
    thumbnail: 'https://i.imgur.com/6ULPqYq.png',
  },
  {
    id: '7',
    title: 'IELTS Writing: Task 1 Data Analysis',
    date: 'Jun 1, 2023',
    duration: '1h 10m',
    instructor: 'Emma Wilson',
    category: 'ielts',
    subject: 'Writing',
    views: 198,
    thumbnail: 'https://i.imgur.com/NvxMSR7.png',
  },
];

const AllRecordingsScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Filter recordings based on selected category
  const filteredRecordings = selectedCategory === 'all'
    ? RECORDINGS
    : RECORDINGS.filter(recording => recording.category === selectedCategory);
  
  // Handle view recording
  const handleViewRecording = (recordingId) => {
    navigation.navigate('RecordingPlayer', { recordingId });
  };
  
  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategoryItem
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  // Render recording item
  const renderRecordingItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recordingCard}
      onPress={() => handleViewRecording(item.id)}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.recordingThumbnail} />
        <View style={styles.durationBadge}>
          <Clock size={10} color="#FFFFFF" />
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
      
      <View style={styles.recordingContent}>
        <Text style={styles.recordingTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.instructorName}>{item.instructor}</Text>
        
        <View style={styles.recordingDetails}>
          <View style={styles.detailItem}>
            <Calendar size={12} color={COLORS.lightText} />
            <Text style={styles.detailText}>{item.date}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <BookOpen size={12} color={COLORS.lightText} />
            <Text style={styles.detailText}>{item.subject}</Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={styles.watchButton}
          onPress={() => handleViewRecording(item.id)}
        >
          <PlayCircle size={16} color="#FFFFFF" />
          <Text style={styles.watchButtonText}>Watch</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
  
  // Render empty component when no recordings match the filter
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No recordings found</Text>
      <Text style={styles.emptyText}>
        There are no recordings available for the selected category.
        Try selecting a different category.
      </Text>
    </View>
  );
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recorded Sessions</Text>
        <Text style={styles.headerSubtitle}>
          Access past sessions at your convenience
        </Text>
      </View>
      
      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={RECORDING_CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>
      
      {/* Recordings list */}
      <FlatList
        data={filteredRecordings}
        renderItem={renderRecordingItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.recordingsList}
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.lightText,
  },
  categoriesContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#F5F5F5',
  },
  selectedCategoryItem: {
    backgroundColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  recordingsList: {
    padding: 16,
  },
  recordingCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    overflow: 'hidden',
  },
  thumbnailContainer: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  recordingThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  recordingContent: {
    flex: 1,
    padding: 12,
  },
  recordingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  instructorName: {
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 8,
  },
  recordingDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 12,
    color: COLORS.lightText,
    marginLeft: 4,
  },
  watchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  watchButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.lightText,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AllRecordingsScreen; 