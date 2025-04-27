import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../navigation/AuthContext';
import { supabase } from '../services/supabase';
import { Bell, CreditCard, Settings, HelpCircle, LogOut } from 'lucide-react-native';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

export default function ProfileScreen({ navigation }) {
  const { user, userProfile } = useAuth();

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
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  // Profile data
  const profileData = {
    name: userProfile?.full_name || 'John Doe',
    email: user?.email || 'john.doe@example.com',
    avatar: userProfile?.avatar_url || 'https://via.placeholder.com/150',
    stats: {
      courses: 12,
      sessions: 48,
      progress: 85
    }
  };

  const menuItems = [
    {
      icon: <Bell size={24} color="#5b5b5b" />,
      title: 'Notifications',
      onPress: () => navigation.navigate('Notifications')
    },
    {
      icon: <CreditCard size={24} color="#5b5b5b" />,
      title: 'Payment Methods',
      onPress: () => navigation.navigate('PaymentMethods')
    },
    {
      icon: <Settings size={24} color="#5b5b5b" />,
      title: 'Settings',
      onPress: () => navigation.navigate('Settings')
    },
    {
      icon: <HelpCircle size={24} color="#5b5b5b" />,
      title: 'Help & Support',
      onPress: () => navigation.navigate('Support')
    }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image 
          source={{ uri: profileData.avatar }} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>{profileData.name}</Text>
        <Text style={styles.email}>{profileData.email}</Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profileData.stats.courses}</Text>
          <Text style={styles.statLabel}>Courses</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profileData.stats.sessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{profileData.stats.progress}%</Text>
          <Text style={styles.statLabel}>Progress</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuIconContainer}>
              {item.icon}
            </View>
            <Text style={styles.menuText}>{item.title}</Text>
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={handleSignOut}
        >
          <View style={styles.menuIconContainer}>
            <LogOut size={24} color={COLORS.secondary} />
          </View>
          <Text style={[styles.menuText, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: COLORS.lightText,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  menuContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 32,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIconContainer: {
    width: 24,
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: COLORS.text,
  },
  logoutText: {
    color: COLORS.secondary,
  },
}); 