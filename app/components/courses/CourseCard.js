import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Clock, Users2 } from 'lucide-react-native';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

const CourseCard = ({ course, onPress }) => {
  return (
    <TouchableOpacity style={styles.courseCard} onPress={onPress}>
      <Image 
        source={{ uri: course.image || 'https://via.placeholder.com/640x360?text=No+Image' }} 
        style={styles.courseImage}
        resizeMode="cover"
      />
      <View style={styles.courseContent}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <View style={styles.courseMetaContainer}>
          {course.duration && (
            <View style={styles.metaItem}>
              <Clock size={16} color={COLORS.lightText} />
              <Text style={styles.metaText}>{course.duration}</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Users2 size={16} color={COLORS.lightText} />
            <Text style={styles.metaText}>{course.level || 'All Levels'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
    overflow: 'hidden',
  },
  courseImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#E5E7EB',
  },
  courseContent: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  courseMetaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.lightText,
    marginLeft: 4,
  },
});

export default CourseCard;
