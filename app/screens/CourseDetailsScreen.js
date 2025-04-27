import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
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

export default function CourseDetailsScreen({ route, navigation }) {
  const { courseId } = route.params || {};

  // In a real app, you would fetch course details based on courseId
  // For now, we're using sample data
  const courseDetails = {
    id: courseId || 'unknown',
    title: getCourseTitle(courseId),
    description: 'This comprehensive course is designed to help students master the fundamentals and advanced concepts required for success in their exams.',
    duration: '12 weeks',
    schedule: 'Tuesdays and Thursdays, 4:00 PM - 6:00 PM',
    instructor: 'Dr. Sarah Johnson',
    price: '$299',
    startDate: 'January 15, 2023',
    curriculum: [
      'Introduction to core concepts',
      'Problem-solving techniques',
      'Advanced theories and applications',
      'Exam preparation strategies',
      'Practice tests and feedback',
    ],
  };

  function getCourseTitle(id) {
    if (!id) return 'Course Details';

    const courseMap = {
      'igcse-math': 'IGCSE Mathematics',
      'sat-math-english': 'SAT Math & English',
      'ielts-prep': 'IELTS Preparation',
    };

    return courseMap[id] || 'Course Details';
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{courseDetails.title}</Text>
        <Text style={styles.instructor}>Instructor: {courseDetails.instructor}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{courseDetails.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <Text style={styles.detailText}>Duration: {courseDetails.duration}</Text>
          <Text style={styles.detailText}>Classes: {courseDetails.schedule}</Text>
          <Text style={styles.detailText}>Start Date: {courseDetails.startDate}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Curriculum</Text>
          {courseDetails.curriculum.map((item, index) => (
            <Text key={index} style={styles.curriculumItem}>• {item}</Text>
          ))}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{courseDetails.price}</Text>
          <Button 
            title="Enroll Now" 
            variant="primary" 
            onPress={() => alert('Enrollment process will be implemented here')}
            style={styles.enrollButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  instructor: {
    fontSize: 16,
    color: COLORS.lightText,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    color: COLORS.text,
  },
  curriculumItem: {
    fontSize: 16,
    marginBottom: 8,
    paddingLeft: 8,
    color: COLORS.text,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 30,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  enrollButton: {
    minWidth: 120,
  },
}); 