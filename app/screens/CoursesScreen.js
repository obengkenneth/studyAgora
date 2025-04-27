import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
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

export default function CoursesScreen({ navigation }) {
  // Sample course data - in a real app, this would come from your API/backend
  const coursesData = {
    cambridge: [
      {
        id: 'igcse-math',
        title: 'IGCSE Mathematics',
        duration: '12 weeks',
        students: 24,
        image: 'https://images.unsplash.com/photo-1581544291234-d2d469dc9922?q=80&w=1974&auto=format',
      },
    ],
    sat: [
      {
        id: 'sat-math-english',
        title: 'SAT Math & English',
        duration: '16 weeks',
        students: 32,
        image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973&auto=format',
      },
    ],
    ielts: [
      {
        id: 'ielts-prep',
        title: 'IELTS Preparation',
        duration: '8 weeks',
        students: 18,
        image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1974&auto=format',
      },
    ],
  };

  const handleCoursePress = (courseId) => {
    navigation.navigate('CourseDetails', { courseId });
  };

  // Course card component
  const CourseCard = ({ course }) => (
    <TouchableOpacity 
      style={styles.courseCard}
      onPress={() => handleCoursePress(course.id)}
    >
      <Image 
        source={{ uri: course.image }} 
        style={styles.courseImage}
        resizeMode="cover"
      />
      <View style={styles.courseContent}>
        <Text style={styles.courseTitle}>{course.title}</Text>
        <View style={styles.courseMetaContainer}>
          <View style={styles.metaItem}>
            <Clock size={16} color={COLORS.lightText} />
            <Text style={styles.metaText}>{course.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Users2 size={16} color={COLORS.lightText} />
            <Text style={styles.metaText}>{course.students} students</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Available Courses</Text>
        <Text style={styles.subheading}>Choose your learning path</Text>

        {/* Cambridge Programs Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Cambridge Programs</Text>
          {coursesData.cambridge.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </View>

        {/* SAT Preparation Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>SAT Preparation</Text>
          {coursesData.sat.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </View>

        {/* IELTS Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>IELTS Preparation</Text>
          {coursesData.ielts.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
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
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subheading: {
    fontSize: 16,
    color: COLORS.lightText,
    marginBottom: 24,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  courseCard: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseImage: {
    width: '100%',
    height: 180,
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
    marginLeft: 6,
    color: COLORS.lightText,
    fontSize: 14,
  },
}); 