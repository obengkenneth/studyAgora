import 'dotenv/config';

export default {
  expo: {
    name: "studyAgora",
    slug: "studyAgora",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/studyAgora.jpeg",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/studyAgora.jpeg",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/studyAgora.jpeg",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/studyAgora.jpeg"
    },
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    }
  }
}; 