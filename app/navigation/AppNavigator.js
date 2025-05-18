import React, { useEffect } from 'react';
import { ActivityIndicator, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserCircle } from 'lucide-react-native';

// Screens
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import DashboardScreen from '../screens/DashboardScreen';
import UserGroupScreen from '../screens/UserGroupScreen';
import CurriculumSelectScreen from '../screens/CurriculumSelectScreen';
import VerificationPendingScreen from '../screens/VerificationPendingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SupportScreen from '../screens/SupportScreen';
import CoursesScreen from '../screens/CoursesScreen';
import CourseDetailsScreen from '../screens/CourseDetailsScreen';
import AllRecordingsScreen from '../screens/AllRecordingsScreen';
import RecordingPlayerScreen from '../screens/RecordingPlayerScreen';
import SessionsScreen from '../screens/SessionsScreen';
import LiveSessionScreen from '../screens/LiveSessionScreen';
import LiveSessionsListScreen from '../screens/LiveSessionsListScreen';
import AllSessionsScreen from '../screens/AllSessionsScreen';
import CourseContentScreen from '../screens/CourseContentScreen';

// Auth Context
import { useAuth } from './AuthContext';

// App color scheme
const COLORS = {
  primary: '#4CAF50', // Green
  secondary: '#D32F2F', // Red
  accent: '#FFD700', // Gold
  text: '#1F2937',
  lightText: '#6B7280',
  background: '#FFFFFF',
};

// Stacks
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const OnboardingStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator 
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="UserGroup" component={UserGroupScreen} />
      <AuthStack.Screen name="CurriculumSelect" component={CurriculumSelectScreen} />
      <AuthStack.Screen name="VerificationPending" component={VerificationPendingScreen} />
    </AuthStack.Navigator>
  );
}

function OnboardingNavigator() {
  const { pendingVerification } = useAuth();
  
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={pendingVerification ? "VerificationPending" : "UserGroup"}
    >
      <OnboardingStack.Screen name="UserGroup" component={UserGroupScreen} />
      <OnboardingStack.Screen name="CurriculumSelect" component={CurriculumSelectScreen} />
      <OnboardingStack.Screen name="VerificationPending" component={VerificationPendingScreen} />
    </OnboardingStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator>
      <AppStack.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={({ navigation }) => ({
          title: 'Study Agora',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Profile')}
              style={{ marginRight: 15 }}
            >
              <UserCircle size={28} color="#fff" />
            </TouchableOpacity>
          ),
        })}
      />
      <AppStack.Screen 
        name="Sessions" 
        component={SessionsScreen}
        options={{
          headerShown: true,
          title: 'Sessions',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <AppStack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          headerShown: true,
          title: 'My Profile',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <AppStack.Screen 
        name="RecordingPlayer" 
        component={RecordingPlayerScreen}
        options={{
          headerShown: true,
          title: 'Recording',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <AppStack.Screen 
        name="LiveSession" 
        component={LiveSessionScreen}
        options={{ headerShown: false }}
      />
      <AppStack.Screen 
        name="LiveSessionsList" 
        component={LiveSessionsListScreen}
        options={{
          headerShown: true,
          title: 'Live Sessions',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <AppStack.Screen 
        name="AllSessions" 
        component={AllSessionsScreen}
        options={{
          headerShown: true,
          title: 'All Sessions',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <AppStack.Screen 
        name="AllRecordings" 
        component={AllRecordingsScreen}
        options={{
          headerShown: true,
          title: 'Recordings',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <AppStack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{
          headerShown: true,
          title: 'Notifications',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <AppStack.Screen 
        name="PaymentMethods" 
        component={PaymentMethodsScreen}
        options={{
          headerShown: true,
          title: 'Payment Methods',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <AppStack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: 'Settings',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <AppStack.Screen 
        name="Support" 
        component={SupportScreen}
        options={{
          headerShown: true,
          title: 'Support',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <AppStack.Screen 
        name="Courses" 
        component={CoursesScreen}
        options={{
          headerShown: true,
          title: 'Courses',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <AppStack.Screen 
        name="CourseDetails" 
        component={CourseDetailsScreen}
        options={{
          headerShown: true,
          title: 'Course Details',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <AppStack.Screen 
        name="CourseContent" 
        component={CourseContentScreen}
        options={{
          headerShown: true,
          title: 'Course Content',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </AppStack.Navigator>
  );
}

export default function Navigation() {
  const { user, loading, userProfile, userRoles, userCurriculums, refreshProfile } = useAuth();
  
  // Force refresh user profile when mounting
  useEffect(() => {
    if (user && !userProfile) {
      console.log('Navigation: User exists but no profile, refreshing profile');
      refreshProfile();
    }
  }, [user, userProfile, refreshProfile]);
  
  // Determine which navigator to show
  let initialRouteName = "Auth";
  
  if (user) {
    console.log('Navigation: User is authenticated:', user.id);
    
    // Check if user has completed onboarding by looking at our new tables
    const hasRole = userRoles && userRoles.length > 0;
    const hasCurriculum = userCurriculums && userCurriculums.length > 0;
    
    if (hasRole && hasCurriculum) {
      console.log('Navigation: User has role and curriculum assigned');
      console.log('Navigation: Roles:', JSON.stringify(userRoles));
      console.log('Navigation: Curriculums:', JSON.stringify(userCurriculums));
      initialRouteName = "App";
    } else {
      // User needs to complete onboarding
      console.log('Navigation: User missing role or curriculum, starting onboarding');
      console.log('Navigation: Has role:', hasRole);
      console.log('Navigation: Has curriculum:', hasCurriculum);
      initialRouteName = "Onboarding";
    }
    
    console.log('Navigation: Setting initialRouteName to', initialRouteName);
  } else {
    console.log('Navigation: No authenticated user, showing Auth screens');
  }
  
  // Log navigation state changes
  useEffect(() => {
  console.log('Navigation state:', { 
    userState: user ? 'Logged in' : 'Not logged in', 
    hasRoles: userRoles && userRoles.length > 0,
    hasCurriculums: userCurriculums && userCurriculums.length > 0,
    onboardingNeeded: !(userRoles && userRoles.length > 0 && userCurriculums && userCurriculums.length > 0),
    selectedStack: initialRouteName
  });
  }, [user, userProfile, userRoles, userCurriculums, initialRouteName]);
  
  // Show a loading indicator while checking auth state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator 
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRouteName}
      >
        <RootStack.Screen name="Auth" component={AuthNavigator} />
        <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        <RootStack.Screen name="App" component={AppNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.lightText,
  }
}); 