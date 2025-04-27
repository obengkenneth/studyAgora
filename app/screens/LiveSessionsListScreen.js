import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Users } from 'lucide-react-native';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

export default function LiveSessionsListScreen({ navigation }) {
  // Sample data for upcoming sessions
  const [sessions] = useState([
    {
      id: 'algebra-session',
      title: 'Advanced Algebra',
      instructor: 'Dr. Smith',
      date: 'Today',
      time: '3:00 PM - 4:30 PM',
      participants: 18,
      isLive: true,
      subject: 'Mathematics',
      level: 'Intermediate',
      curriculum: 'Cambridge',
    },
    {
      id: 'ielts-speaking',
      title: 'IELTS Speaking Practice',
      instructor: 'Ms. Johnson',
      date: 'Today',
      time: '5:00 PM - 6:00 PM',
      participants: 12,
      isLive: false,
      subject: 'English',
      level: 'Advanced',
      curriculum: 'IELTS',
    },
    {
      id: 'physics-session',
      title: 'Physics: Mechanics Review',
      instructor: 'Prof. Williams',
      date: 'Tomorrow',
      time: '10:00 AM - 11:30 AM',
      participants: 24,
      isLive: false,
      subject: 'Physics',
      level: 'Intermediate',
      curriculum: 'Cambridge',
    },
    {
      id: 'sat-math',
      title: 'SAT Math Prep',
      instructor: 'Dr. Garcia',
      date: 'Tomorrow',
      time: '2:00 PM - 3:30 PM',
      participants: 30,
      isLive: false,
      subject: 'Mathematics',
      level: 'Advanced',
      curriculum: 'SAT',
    },
    {
      id: 'chemistry-session',
      title: 'Chemistry: Organic Compounds',
      instructor: 'Dr. Chen',
      date: 'Wed, Jun 15',
      time: '4:00 PM - 5:30 PM',
      participants: 15,
      isLive: false,
      subject: 'Chemistry',
      level: 'Advanced',
      curriculum: 'Cambridge',
    },
  ]);

  // Filter for live sessions
  const liveNow = sessions.filter(session => session.isLive);
  
  // Filter for upcoming sessions
  const upcoming = sessions.filter(session => !session.isLive);

  const handleJoinSession = (session) => {
    navigation.navigate('LiveSession', { sessionId: session.id });
  };

  const renderSessionItem = ({ item, index }) => {
    // Check if this is a live session in the horizontal list
    const isLiveInHorizontalList = item.isLive && liveNow && liveNow.length > 0;
    
    return (
    <TouchableOpacity 
      style={[
        styles.sessionCard,
        isLiveInHorizontalList && { width: 300 }
      ]}
      onPress={() => handleJoinSession(item)}
    >
      <View style={styles.sessionHeader}>
        <View style={styles.curriculumBadge}>
          <Text style={styles.curriculumText}>{item.curriculum}</Text>
        </View>
        {item.isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveText}>LIVE NOW</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.sessionTitle}>{item.title}</Text>
      <Text style={styles.instructorName}>{item.instructor}</Text>
      
      <View style={styles.sessionDetails}>
        <View style={styles.detailItem}>
          <Calendar size={16} color={COLORS.lightText} />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Clock size={16} color={COLORS.lightText} />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Users size={16} color={COLORS.lightText} />
          <Text style={styles.detailText}>{item.participants} enrolled</Text>
        </View>
      </View>
      
      <View style={styles.subjectLevelContainer}>
        <View style={styles.subjectBadge}>
          <Text style={styles.subjectText}>{item.subject}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{item.level}</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.joinButton,
          item.isLive ? styles.joinLiveButton : {}
        ]}
        onPress={() => handleJoinSession(item)}
      >
        <Text style={styles.joinButtonText}>
          {item.isLive ? 'Join Now' : 'Enroll'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.screenTitle}>Live Sessions</Text>
        
        {liveNow && liveNow.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Happening Now</Text>
            <FlatList
              data={liveNow}
              renderItem={renderSessionItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.liveSessionsList}
            />
          </View>
        )}
        
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
          <FlatList
            data={upcoming}
            renderItem={renderSessionItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.upcomingSessionsList}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  liveSessionsList: {
    paddingRight: 16,
  },
  upcomingSessionsList: {
    paddingBottom: 20,
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    width: '100%',
    marginRight: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  curriculumBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  curriculumText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  liveBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  instructorName: {
    color: COLORS.lightText,
    marginBottom: 12,
  },
  sessionDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    color: COLORS.lightText,
    marginLeft: 8,
    fontSize: 14,
  },
  subjectLevelContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  subjectBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  subjectText: {
    color: '#1976D2',
    fontSize: 12,
  },
  levelBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  levelText: {
    color: '#FFA000',
    fontSize: 12,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinLiveButton: {
    backgroundColor: COLORS.secondary,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 