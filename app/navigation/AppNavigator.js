import React from 'react';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import DashboardScreen from '../screens/DashboardScreen';
import UserGroupScreen from '../screens/UserGroupScreen';
import CurriculumSelectScreen from '../screens/CurriculumSelectScreen';
import VerificationPendingScreen from '../screens/VerificationPendingScreen';

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
        options={{
          title: 'Study Agora',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      {/* Additional screens will be added here as we develop them */}
    </AppStack.Navigator>
  );
}

export default function Navigation() {
  const { user, loading, userProfile } = useAuth();
  
  // Determine which navigator to show
  let initialRouteName = "Auth";
  
  if (user) {
    if (userProfile) {
      // Check if onboarding is needed
      const needsOnboarding = !userProfile.user_group || !userProfile.curriculum;
      initialRouteName = needsOnboarding ? "Onboarding" : "App";
    } else {
      // User is logged in but no profile yet, start onboarding
      initialRouteName = "Onboarding";
    }
  }
  
  console.log('Navigation state:', { 
    userState: user ? 'Logged in' : 'Not logged in', 
    profileState: userProfile ? 'Has profile' : 'No profile',
    onboardingNeeded: userProfile && (!userProfile.user_group || !userProfile.curriculum),
    selectedStack: initialRouteName
  });
  
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
    marginTop: 10,
    color: COLORS.primary,
    fontSize: 16,
  },
}); 