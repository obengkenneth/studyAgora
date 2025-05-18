import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens from their new locations
import CurriculumsScreen from '../screens/curriculums/CurriculumsScreen';
import SubjectsScreen from '../screens/subjects/SubjectsScreen';
import CoursesScreen from '../screens/courses/CoursesScreen';
import CourseDetailsScreen from '../screens/courses/CourseDetailsScreen';

const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Curriculums" component={CurriculumsScreen} />
      <Stack.Screen name="Subjects" component={SubjectsScreen} />
      <Stack.Screen name="Courses" component={CoursesScreen} />
      <Stack.Screen name="CourseDetails" component={CourseDetailsScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
