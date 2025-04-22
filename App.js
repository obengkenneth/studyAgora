import 'react-native-url-polyfill/auto';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './app/navigation/AuthContext';
import AppNavigator from './app/navigation/AppNavigator';
import { testSupabaseConnection } from './app/services/supabase';
import { useEffect } from 'react';

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
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
} 