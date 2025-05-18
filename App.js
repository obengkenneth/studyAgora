import 'react-native-url-polyfill/auto';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './app/navigation/AuthContext';
import AppNavigator from './app/navigation/AppNavigator';
import { testSupabaseConnection } from './app/services/supabase';
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { BeautifulAlert } from './app/components/BeautifulAlert';

// Initialize WebBrowser for OAuth redirects
WebBrowser.maybeCompleteAuthSession();

export default function App() {
  useEffect(() => {
    // Test Supabase connection when app loads
    testSupabaseConnection()
      .then(isConnected => {
        console.log('Supabase connection test:', isConnected ? 'Success' : 'Failed');
      })
      .catch(error => {
        console.error('Error testing Supabase connection:', error);
      });
      
    // Set up deep link handler
    const linkingSubscription = Linking.addEventListener('url', handleDeepLink);
    
    return () => {
      linkingSubscription.remove();
    };
  }, []);
  
  const handleDeepLink = (event) => {
    console.log('Deep link detected:', event.url);
    // The actual auth handling is done in the signInWithGoogle function
  };

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
        <BeautifulAlert />
      </AuthProvider>
    </SafeAreaProvider>
  );
} 