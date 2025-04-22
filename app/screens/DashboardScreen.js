import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { supabase } from '../services/supabase';

export default function DashboardScreen({ navigation }) {
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Dashboard</Text>
        
        {/* Learning Modules Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Modules</Text>
          
          <View style={styles.cardRow}>
            {/* Live Sessions Card */}
            <TouchableOpacity 
              style={[styles.card, styles.halfCard]}
              onPress={() => navigation.navigate('LiveSessions')}
            >
              <View style={[styles.cardIcon, styles.blueIcon]}>
                <Text style={styles.iconText}>LIVE</Text>
              </View>
              <Text style={styles.cardTitle}>Live Sessions</Text>
              <Text style={styles.cardDescription}>Join interactive learning sessions</Text>
            </TouchableOpacity>
            
            {/* Recorded Sessions Card */}
            <TouchableOpacity 
              style={[styles.card, styles.halfCard]}
              onPress={() => navigation.navigate('RecordedSessions')}
            >
              <View style={[styles.cardIcon, styles.purpleIcon]}>
                <Text style={styles.purpleIconText}>VIDEO</Text>
              </View>
              <Text style={styles.cardTitle}>Recorded Sessions</Text>
              <Text style={styles.cardDescription}>Watch pre-recorded lessons</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Resources Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Resources</Text>
          
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Resources')}
          >
            <View style={styles.horizontalCard}>
              <View style={[styles.squareIcon, styles.greenIcon]}>
                <Text style={styles.greenIconText}>DOCS</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Resource Library</Text>
                <Text style={styles.cardDescription}>
                  Access study materials, practice questions, and textbooks
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.horizontalCard}>
              <View style={[styles.squareIcon, styles.yellowIcon]}>
                <Text style={styles.yellowIconText}>PROFILE</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>My Profile</Text>
                <Text style={styles.cardDescription}>
                  Manage your account settings and preferences
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.card, styles.redCard]}
            onPress={signOut}
          >
            <View style={styles.horizontalCard}>
              <View style={[styles.squareIcon, styles.redIcon]}>
                <Text style={styles.redIconText}>EXIT</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Sign Out</Text>
                <Text style={styles.cardDescription}>
                  Log out of your account
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f9fafb', // gray-50
  },
  container: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937', // gray-800
    marginBottom: 16,
  },
  cardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 16,
  },
  halfCard: {
    width: '48%',
  },
  cardIcon: {
    height: 96,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blueIcon: {
    backgroundColor: '#dbeafe', // blue-100
  },
  purpleIcon: {
    backgroundColor: '#f3e8ff', // purple-100
  },
  greenIcon: {
    backgroundColor: '#dcfce7', // green-100
  },
  yellowIcon: {
    backgroundColor: '#fef9c3', // yellow-100
  },
  redIcon: {
    backgroundColor: '#fee2e2', // red-100
  },
  iconText: {
    fontWeight: 'bold',
    color: '#3b82f6', // blue-500
  },
  purpleIconText: {
    fontWeight: 'bold',
    color: '#a855f7', // purple-500
  },
  greenIconText: {
    fontWeight: 'bold',
    color: '#22c55e', // green-500
  },
  yellowIconText: {
    fontWeight: 'bold',
    color: '#eab308', // yellow-500
  },
  redIconText: {
    fontWeight: 'bold',
    color: '#ef4444', // red-500
  },
  cardTitle: {
    fontWeight: 'bold',
    color: '#1f2937', // gray-800
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280', // gray-600
    marginTop: 4,
  },
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  squareIcon: {
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  redCard: {
    backgroundColor: '#fff1f2', // red-50
  },
}); 