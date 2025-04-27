import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground, Image, FlatList } from 'react-native';
import { Clock, Users2, Mic, Video, Calendar, ChevronRight, Play, FileText, ArrowRight } from 'lucide-react-native';
import Button from '../components/Button';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

export default function SessionsScreen({ navigation }) {
  // Sample data for today's sessions
  const todaySessions = [
    {
      id: '1',
      title: 'Cambridge IGCSE Mathematics',
      time: '10:00 AM - 11:30 AM',
      instructor: 'Dr. Sarah Johnson',
      students: 24,
      isLive: true,
    },
    {
      id: '2',
      title: 'SAT Verbal Reasoning',
      time: '2:00 PM - 3:30 PM',
      instructor: 'Prof. Michael Chen',
      students: 18,
      isLive: false,
    },
    {
      id: '3',
      title: 'IELTS Speaking Practice',
      time: '4:00 PM - 5:30 PM',
      instructor: 'Ms. Emma Thompson',
      students: 12,
      isLive: false,
    },
  ];

  // Sample data for recent recordings
  const recentRecordings = [
    {
      id: '1',
      title: 'Cambridge IGCSE Physics: Forces and Motion',
      instructor: 'Dr. Robert Wilson',
      date: 'Oct 15, 2023',
      duration: '1h 25m',
      thumbnail: 'https://i.imgur.com/JR6B1yN.jpg',
    },
    {
      id: '2',
      title: 'SAT Math: Advanced Algebra',
      instructor: 'Prof. Michael Chen',
      date: 'Oct 12, 2023',
      duration: '1h 15m',
      thumbnail: 'https://i.imgur.com/6vYNJUo.jpg',
    },
    {
      id: '3',
      title: 'IELTS Writing: Task 2 Strategies',
      instructor: 'Ms. Emma Thompson',
      date: 'Oct 10, 2023',
      duration: '1h 40m',
      thumbnail: 'https://i.imgur.com/3dKbhDk.jpg',
    },
  ];

  const handleJoinSession = (sessionId) => {
    navigation.navigate('LiveSession', { sessionId });
  };

  const handleViewAllSessions = () => {
    navigation.navigate('LiveSessionsList');
  };

  const handleViewAllRecordings = () => {
    navigation.navigate('AllRecordings');
  };

  const handleViewRecording = (recordingId) => {
    navigation.navigate('RecordingPlayer', { recordingId });
  };

  // Session card component
  const SessionCard = ({ session }) => {
    const isLiveSoon = !session.isLive && new Date().getHours() < parseInt(session.time.split(':')[0]);
    
    return (
      <View style={styles.sessionCard}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle}>{session.title}</Text>
          
          <View style={styles.sessionDetail}>
            <Clock size={16} color={COLORS.lightText} />
            <Text style={styles.sessionDetailText}>{session.time}</Text>
          </View>
          
          <View style={styles.sessionDetail}>
            <Users2 size={16} color={COLORS.lightText} />
            <Text style={styles.sessionDetailText}>{session.students} Students</Text>
          </View>
          
          <View style={styles.sessionDetail}>
            <Text style={styles.instructorName}>{session.instructor}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.joinButton, 
            { backgroundColor: session.isLive ? COLORS.secondary : COLORS.primary }
          ]}
          onPress={() => handleJoinSession(session.id)}
        >
          <Text style={styles.joinButtonText}>
            {session.isLive ? 'Join Now' : 'Join Later'}
          </Text>
        </TouchableOpacity>
        
        {session.isLive && (
          <View style={styles.liveIndicator}>
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>
    );
  };

  // Recording card component
  const RecordingCard = ({ recording }) => (
    <TouchableOpacity 
      style={styles.recordingCard}
      onPress={() => handleViewRecording(recording.id)}
    >
      <Image
        source={{ uri: recording.thumbnail }}
        style={styles.recordingThumbnail}
      />
      <View style={styles.playIconContainer}>
        <Play size={24} color="#FFFFFF" fill="#FFFFFF" />
      </View>
      <View style={styles.recordingInfo}>
        <Text style={styles.recordingTitle} numberOfLines={2}>
          {recording.title}
        </Text>
        <Text style={styles.recordingInstructor}>{recording.instructor}</Text>
        <View style={styles.recordingMeta}>
          <View style={styles.recordingDetail}>
            <Calendar size={14} color={COLORS.lightText} />
            <Text style={styles.recordingDetailText}>{recording.date}</Text>
          </View>
          <View style={styles.recordingDetail}>
            <Clock size={14} color={COLORS.lightText} />
            <Text style={styles.recordingDetailText}>{recording.duration}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Live Sessions</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={handleViewAllSessions}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.sectionTitle}>Today's Sessions</Text>
      
      <View style={styles.sessionsContainer}>
        {todaySessions.map(session => (
          <SessionCard key={session.id} session={session} />
        ))}
      </View>
      
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Recent Recordings</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={handleViewAllRecordings}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <ChevronRight size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.recordingsContainer}>
        <FlatList
          data={recentRecordings}
          renderItem={({ item }) => <RecordingCard recording={item} />}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recordingsList}
        />
      </View>
      
      <View style={styles.resourcesSection}>
        <View style={styles.resourcesHeader}>
          <Text style={styles.resourcesTitle}>Study Resources</Text>
          <TouchableOpacity style={styles.resourcesButton}>
            <Text style={styles.resourcesButtonText}>Browse All</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.resourcesSubtitle}>
          Access notes, past questions, and study guides
        </Text>
        
        <View style={styles.resourceTypes}>
          <TouchableOpacity style={styles.resourceType}>
            <View style={[styles.resourceIconContainer, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
              <FileText size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.resourceTypeText}>Study Notes</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceType}>
            <View style={[styles.resourceIconContainer, { backgroundColor: 'rgba(211, 47, 47, 0.1)' }]}>
              <FileText size={24} color={COLORS.secondary} />
            </View>
            <Text style={styles.resourceTypeText}>Past Questions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceType}>
            <View style={[styles.resourceIconContainer, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
              <FileText size={24} color={COLORS.accent} />
            </View>
            <Text style={styles.resourceTypeText}>Textbooks</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: COLORS.primary,
    fontWeight: '500',
    marginRight: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sessionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sessionCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
  },
  sessionInfo: {
    flex: 1,
    paddingRight: 12,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  sessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sessionDetailText: {
    fontSize: 14,
    color: COLORS.lightText,
    marginLeft: 6,
  },
  instructorName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonText: {
    color: COLORS.background,
    fontWeight: '600',
    fontSize: 14,
  },
  liveIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  liveText: {
    color: COLORS.background,
    fontWeight: '700',
    fontSize: 10,
  },
  recordingsContainer: {
    marginBottom: 24,
  },
  recordingsList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  recordingCard: {
    width: 280,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  recordingThumbnail: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  playIconContainer: {
    position: 'absolute',
    top: 160/2 - 24,
    left: 280/2 - 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingInfo: {
    padding: 12,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  recordingInstructor: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    marginBottom: 8,
  },
  recordingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recordingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingDetailText: {
    fontSize: 12,
    color: COLORS.lightText,
    marginLeft: 4,
  },
  resourcesSection: {
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  resourcesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  resourcesButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  resourcesButtonText: {
    color: COLORS.background,
    fontWeight: '600',
    fontSize: 12,
    marginRight: 4,
  },
  resourcesSubtitle: {
    fontSize: 14,
    color: COLORS.lightText,
    marginBottom: 16,
  },
  resourceTypes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  resourceType: {
    alignItems: 'center',
    width: '30%',
  },
  resourceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  resourceTypeText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
  },
}); 