-- This script sets up the database schema for StudyAgora

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'super-secret-jwt-token-with-at-least-32-characters';

-- User Profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    full_name TEXT,
    user_group TEXT CHECK (user_group IN ('student', 'parent', 'facilitator')),
    curriculum TEXT CHECK (curriculum IN ('cambridge', 'sat', 'ielts')),
    location TEXT,
    school TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create an index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);

-- Enable Row Level Security on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
-- Allow users to view their own profile
CREATE POLICY view_own_profile ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own profile
CREATE POLICY insert_own_profile ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY update_own_profile ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create a profile for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 