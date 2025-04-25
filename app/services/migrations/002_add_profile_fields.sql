-- Migration: 002_add_profile_fields
-- Description: Adds additional fields to the user_profiles table

-- Add bio field to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add avatar_url field to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add subject_interests array field for tracking specific subjects
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS subject_interests TEXT[];

-- Record this migration
INSERT INTO migrations (name) VALUES ('002_add_profile_fields'); 