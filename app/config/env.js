import Constants from 'expo-constants';

// Get environment variables from Expo's Constants.manifest.extra
// or use environment variables directly (for older Expo versions)
const getEnvVars = () => {
  try {
    // For Expo SDK 41 and below
    if (Constants.manifest && Constants.manifest.extra) {
      return Constants.manifest.extra;
    }
    
    // For Expo SDK 42+
    return {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    };
  } catch (error) {
    // Fallback to hardcoded values if needed
    return {
      supabaseUrl: "https://zhtaaeyijaqeqzcmpxnp.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpodGFhZXlpamFxZXF6Y21weG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NzU5MDksImV4cCI6MjA2MDA1MTkwOX0.656lE7AQSAkd_WmsSdOV6TIVxKR41cDXORTCPYV0oIg",
    };
  }
};

const ENV = getEnvVars();

export default {
  SUPABASE_URL: ENV.supabaseUrl,
  SUPABASE_ANON_KEY: ENV.supabaseAnonKey,
}; 