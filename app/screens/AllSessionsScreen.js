import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Users2, Clock, ChevronRight, CalendarClock } from 'lucide-react-native';

// Get screen dimensions
const SCREEN_WIDTH = Dimensions.get('window').width;

// Colors
const COLORS = {
  primary: '#4CAF50',
  secondary: '#F44336',
  accent: '#FFD700',
  text: '#333333',
  lightText: '#757575',
  background: '#FFFFFF',
};

// Session categories
const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'cambridge', name: 'Cambridge' },
  { id: 'sat', name: 'SAT' },
  { id: 'ielts', name: 'IELTS' },
];

// Sample session data
const SESSIONS = [
  {
    id: '1',
    title: 'Trigonometry Fundamentals',
    time: '09:00 AM - 10:30 AM',
    date: 'Monday, June 10, 2023',
    instructor: 'Dr. Mark Anderson',
    students: 24,
    isLive: false,
    curriculum: 'cambridge',
    image: 'https://i.imgur.com/JR67iYK.png',
  },
  {
    id: '2',
    title: 'SAT Reading Comprehension',
    time: '11:00 AM - 12:30 PM',
    date: 'Monday, June 10, 2023',
    instructor: 'Dr. Jessica Liu',
    students: 18,
    isLive: true,
    curriculum: 'sat',
    image: 'https://i.imgur.com/6ULPqYq.png',
  },
  {
    id: '3',
    title: 'IELTS Speaking Practice',
    time: '02:00 PM - 03:30 PM',
    date: 'Monday, June 10, 2023',
    instructor: 'Emma Wilson',
    students: 12,
    isLive: false,
    curriculum: 'ielts',
    image: 'https://i.imgur.com/NvxMSR7.png',
  },
  {
    id: '4',
    title: 'Biology Cell Structure',
    time: '04:00 PM - 05:30 PM',
    date: 'Tuesday, June 11, 2023',
    instructor: 'Dr. Emily Parker',
    students: 20,
    isLive: false,
    curriculum: 'cambridge',
    image: 'https://i.imgur.com/bXmRxKv.png',
  },
  {
    id: '5',
    title: 'SAT Math Problem Solving',
    time: '09:00 AM - 10:30 AM',
    date: 'Tuesday, June 11, 2023',
    instructor: 'Michael Johnson',
    students: 15,
    isLive: false,
    curriculum: 'sat',
    image: 'https://i.imgur.com/6ULPqYq.png',
  },
  {
    id: '6',
    title: 'Cambridge Physics: Forces',
    time: '11:00 AM - 12:30 PM',
    date: 'Tuesday, June 11, 2023', 
    instructor: 'Dr. Robert Thompson',
    students: 22,
    isLive: false,
    curriculum: 'cambridge',
    image: 'https://i.imgur.com/JR67iYK.png',
  },
  {
    id: '7',
    title: 'IELTS Writing Task 2',
    time: '02:00 PM - 03:30 PM',
    date: 'Wednesday, June 12, 2023',
    instructor: 'Emma Wilson',
    students: 16,
    isLive: false,
    curriculum: 'ielts',
    image: 'https://i.imgur.com/NvxMSR7.png',
  },
  {
    id: '8',
    title: 'Cambridge Chemistry',
    time: '04:00 PM - 05:30 PM',
    date: 'Wednesday, June 12, 2023',
    instructor: 'Dr. Mark Anderson',
    students: 19,
    isLive: false,
    curriculum: 'cambridge',
    image: 'https://i.imgur.com/JR67iYK.png',
  },
];

const AllSessionsScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Filter sessions based on selected category
  const filteredSessions = selectedCategory === 'all' 
    ? SESSIONS 
    : SESSIONS.filter(session => session.curriculum === selectedCategory);
  
  // Group sessions by date
  const groupedSessions = filteredSessions.reduce((groups, session) => {
    const date = session.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {});
  
  // Convert grouped sessions to array format for FlatList
  const sessionsData = Object.keys(groupedSessions).map(date => ({
    date,
    sessions: groupedSessions[date],
  }));
  
  // Handle session selection
  const handleSessionPress = (session) => {
    if (session.isLive) {
      navigation.navigate('LiveSession', { sessionId: session.id });
    } else {
      // For sessions in the future, could show a registration screen
      // or add to calendar option
      navigation.navigate('SessionDetails', { sessionId: session.id });
    }
  };
  
  // Render category tab
  const renderCategoryTab = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory === item.id && styles.selectedCategoryTab,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text 
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );
  
  // Render session item
  const renderSessionItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.sessionCard}
      onPress={() => handleSessionPress(item)}
    >
      <View style={styles.sessionImageContainer}>
        <Image source={{ uri: item.image }} style={styles.sessionImage} />
        {item.isLive && <View style={styles.liveBadge}><Text style={styles.liveText}>LIVE</Text></View>}
      </View>
      
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.instructorName}>{item.instructor}</Text>
        
        <View style={styles.sessionDetails}>
          <View style={styles.detailItem}>
            <Clock size={14} color={COLORS.lightText} />
            <Text style={styles.detailText}>{item.time}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Users2 size={14} color={COLORS.lightText} />
            <Text style={styles.detailText}>{item.students} students</Text>
          </View>
        </View>
      </View>
      
      <ChevronRight size={20} color={COLORS.lightText} style={styles.chevron} />
    </TouchableOpacity>
  );
  
  // Render date section
  const renderDateSection = ({ item }) => (
    <View style={styles.dateSection}>
      <Text style={styles.dateText}>{item.date}</Text>
      <FlatList
        data={item.sessions}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );
  
  return (
    <View style={styles.container}>
      {/* Categories tabs */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={CATEGORIES}
          renderItem={renderCategoryTab}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </View>
      
      {/* Sessions list */}
      <FlatList
        data={sessionsData}
        renderItem={renderDateSection}
        keyExtractor={(item) => item.date}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CalendarClock size={64} color={COLORS.lightText} />
            <Text style={styles.emptyText}>No sessions available</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  categoriesContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  selectedCategoryTab: {
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
  dateSection: {
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    padding: 16,
    paddingBottom: 8,
  },
  sessionCard: {
    flexDirection: 'row',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionImageContainer: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
  },
  sessionImage: {
    width: '100%',
    height: '100%',
  },
  liveBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sessionInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  sessionTitle: {
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
  sessionDetails: {
    flexDirection: 'row',
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
  chevron: {
    alignSelf: 'center',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.lightText,
    marginTop: 16,
  },
});

export default AllSessionsScreen; 