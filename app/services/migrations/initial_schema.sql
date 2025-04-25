-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS session_enrollments;
DROP TABLE IF EXISTS session_resources;
DROP TABLE IF EXISTS live_sessions;
DROP TABLE IF EXISTS pre_recorded_sessions;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS user_profiles;

-- Core user profile table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    full_name TEXT,
    user_group TEXT CHECK (user_group IN ('student', 'parent', 'facilitator')),
    curriculum TEXT CHECK (curriculum IN ('cambridge', 'sat', 'ielts')),
    location TEXT,
    school TEXT,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    UNIQUE(user_id)
);

-- Educational resources (notes, books, past questions)
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    resource_type TEXT CHECK (resource_type IN ('note', 'book', 'past_question', 'other')),
    curriculum TEXT CHECK (curriculum IN ('cambridge', 'sat', 'ielts')),
    subject TEXT,
    file_url TEXT,
    thumbnail_url TEXT,
    creator_id UUID REFERENCES user_profiles(user_id),
    is_public BOOLEAN DEFAULT FALSE,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Pre-recorded learning sessions
CREATE TABLE IF NOT EXISTS pre_recorded_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    curriculum TEXT CHECK (curriculum IN ('cambridge', 'sat', 'ielts')),
    subject TEXT,
    duration INTEGER, -- in minutes
    video_url TEXT,
    thumbnail_url TEXT,
    facilitator_id UUID REFERENCES user_profiles(user_id),
    is_published BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Live learning sessions
CREATE TABLE IF NOT EXISTS live_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    curriculum TEXT CHECK (curriculum IN ('cambridge', 'sat', 'ielts')),
    subject TEXT,
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_duration INTEGER, -- in minutes
    meeting_url TEXT,
    facilitator_id UUID REFERENCES user_profiles(user_id),
    max_participants INTEGER,
    is_cancelled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Resources linked to sessions
CREATE TABLE IF NOT EXISTS session_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES live_sessions(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    UNIQUE(session_id, resource_id)
);

-- Track session enrollments
CREATE TABLE IF NOT EXISTS session_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES live_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('registered', 'attended', 'cancelled', 'no_show')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    UNIQUE(session_id, user_id)
);

-- Create indexes for commonly queried columns
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_group ON user_profiles(user_group);
CREATE INDEX IF NOT EXISTS idx_user_profiles_curriculum ON user_profiles(curriculum);
CREATE INDEX IF NOT EXISTS idx_user_profiles_deleted_at ON user_profiles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_resources_curriculum ON resources(curriculum);
CREATE INDEX IF NOT EXISTS idx_resources_creator_id ON resources(creator_id);
CREATE INDEX IF NOT EXISTS idx_resources_deleted_at ON resources(deleted_at);
CREATE INDEX IF NOT EXISTS idx_pre_recorded_sessions_deleted_at ON pre_recorded_sessions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_live_sessions_facilitator_id ON live_sessions(facilitator_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_scheduled_start ON live_sessions(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_live_sessions_deleted_at ON live_sessions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_session_enrollments_user_id ON session_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_session_enrollments_deleted_at ON session_enrollments(deleted_at);
CREATE INDEX IF NOT EXISTS idx_session_resources_deleted_at ON session_resources(deleted_at);

-- Create trigger function to update updated_at column
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for soft delete
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  NEW.deleted_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER set_timestamp_user_profiles
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_resources
BEFORE UPDATE ON resources
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_pre_recorded_sessions
BEFORE UPDATE ON pre_recorded_sessions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_live_sessions
BEFORE UPDATE ON live_sessions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_session_enrollments
BEFORE UPDATE ON session_enrollments
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Setup Row Level Security (RLS)
-- Enable row level security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_recorded_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_enrollments ENABLE ROW LEVEL SECURITY;

-- Create policies
-- User Profiles policy (users can only update their own profile)
DROP POLICY IF EXISTS "Users can view all active profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;

CREATE POLICY "Users can view all active profiles"
    ON user_profiles FOR SELECT
    USING (deleted_at IS NULL);

-- More permissive insert policy to allow signup flow to work
CREATE POLICY "Anyone can insert a user profile"
    ON user_profiles FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id AND deleted_at IS NULL)
    WITH CHECK (auth.uid() = user_id);

-- Resources policies
CREATE POLICY "Anyone can view public active resources"
    ON resources FOR SELECT
    USING ((is_public = true OR auth.uid() = creator_id) AND deleted_at IS NULL);

CREATE POLICY "Facilitators can insert resources"
    ON resources FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid() AND user_group = 'facilitator' AND deleted_at IS NULL
        )
    );

CREATE POLICY "Creators can update their active resources"
    ON resources FOR UPDATE
    USING (auth.uid() = creator_id AND deleted_at IS NULL)
    WITH CHECK (auth.uid() = creator_id);

-- Pre-recorded sessions policies 
CREATE POLICY "Anyone can view published active pre-recorded sessions"
    ON pre_recorded_sessions FOR SELECT
    USING ((is_published = true OR auth.uid() = facilitator_id) AND deleted_at IS NULL);

CREATE POLICY "Facilitators can insert pre-recorded sessions"
    ON pre_recorded_sessions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid() AND user_group = 'facilitator' AND deleted_at IS NULL
        )
    );

CREATE POLICY "Facilitators can update their active pre-recorded sessions"
    ON pre_recorded_sessions FOR UPDATE
    USING (auth.uid() = facilitator_id AND deleted_at IS NULL)
    WITH CHECK (auth.uid() = facilitator_id);

-- Live sessions policies
CREATE POLICY "Anyone can view active live sessions"
    ON live_sessions FOR SELECT
    USING (deleted_at IS NULL);

CREATE POLICY "Facilitators can insert live sessions"
    ON live_sessions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_id = auth.uid() AND user_group = 'facilitator' AND deleted_at IS NULL
        )
    );

CREATE POLICY "Facilitators can update their active live sessions"
    ON live_sessions FOR UPDATE
    USING (auth.uid() = facilitator_id AND deleted_at IS NULL)
    WITH CHECK (auth.uid() = facilitator_id);

-- Views for active records (not soft-deleted)
CREATE OR REPLACE VIEW active_user_profiles AS
SELECT * FROM user_profiles WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_resources AS
SELECT * FROM resources WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_pre_recorded_sessions AS
SELECT * FROM pre_recorded_sessions WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_live_sessions AS
SELECT * FROM live_sessions WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW active_session_enrollments AS
SELECT * FROM session_enrollments WHERE deleted_at IS NULL; 