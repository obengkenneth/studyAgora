import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { useAuth } from '../navigation/AuthContext';
import Button from '../components/Button';
import { supabase } from '../services/supabase';
import { Book, Clock, Users2, Home, GraduationCap, Library } from 'lucide-react-native';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

export default function DashboardScreen({ navigation }) {
  const { userProfile } = useAuth();

  const handleSignOut = async () => {
    try {
    const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Trending Topics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trending Topics</Text>
          <TouchableOpacity style={styles.trendingCard}>
            <View style={styles.trendingIconContainer}>
              <Book size={24} color={COLORS.primary} />
              </View>
            <View style={styles.trendingContent}>
              <Text style={styles.trendingTitle}>WAEC Math Crash Course</Text>
              <View style={styles.trendingMeta}>
                <View style={styles.metaItem}>
                  <Clock size={16} color={COLORS.lightText} />
                  <Text style={styles.metaText}>5 weeks</Text>
              </View>
                <View style={styles.metaItem}>
                  <Users2 size={16} color={COLORS.lightText} />
                  <Text style={styles.metaText}>24 students</Text>
              </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Upcoming Sessions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
          <View style={styles.sessionCard}>
            <Text style={styles.sessionTime}>Today, 2:00 PM</Text>
            <Text style={styles.sessionTitle}>English Language</Text>
            <Text style={styles.sessionTeacher}>with Mr. Johnson</Text>
            <Button
              title="Join Session"
              onPress={() => navigation.navigate('LiveSession', { sessionId: 'algebra-session' })}
              variant="primary"
              style={styles.joinButton}
            />
              </View>
            </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Home size={24} color={COLORS.primary} />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Courses')}
        >
          <Book size={24} color={COLORS.lightText} />
          <Text style={styles.navText}>Courses</Text>
          </TouchableOpacity>
          <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Sessions')}
        >
          <GraduationCap size={24} color={COLORS.lightText} />
          <Text style={styles.navText}>Sessions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Library size={24} color={COLORS.lightText} />
          <Text style={styles.navText}>Library</Text>
          </TouchableOpacity>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  trendingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  trendingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  trendingContent: {
    flex: 1,
  },
  trendingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  trendingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    marginLeft: 4,
    color: '#6b7280',
    fontSize: 14,
  },
  sessionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionTime: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  sessionTeacher: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 16,
  },
  joinButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
  },
  bottomNav: {
    height: 60,
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingBottom: 8,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  activeNavText: {
    color: COLORS.primary,
    fontWeight: '500',
  },
}); 