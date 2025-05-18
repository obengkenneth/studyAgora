-- Migration: 003_role_curriculum_tables
-- Description: Creates tables for role management and curriculum relationships

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT roles_pkey PRIMARY KEY (id),
  CONSTRAINT roles_name_key UNIQUE (name)
);

-- Insert default roles
INSERT INTO public.roles (name, description) VALUES
  ('student', 'Regular student user with access to enrolled courses'),
  ('parent', 'Parent user who can oversee student progress'),
  ('facilitator', 'Teacher or educator who can create and manage courses'),
  ('admin', 'Administrator with full system access')
ON CONFLICT (name) DO NOTHING;

-- Create user_roles junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT user_roles_pkey PRIMARY KEY (id),
  CONSTRAINT user_roles_user_id_role_id_key UNIQUE (user_id, role_id),
  CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE
);

-- Create index for faster role lookup
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles USING btree (role_id);

-- Create table to store all curriculums
CREATE TABLE IF NOT EXISTS public.curriculums (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  name text NOT NULL,
  description text,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT curriculums_pkey PRIMARY KEY (id),
  CONSTRAINT curriculums_name_key UNIQUE (name)
);

-- Insert default curriculums
INSERT INTO public.curriculums (name, description) VALUES
  ('cambridge', 'Cambridge International Examinations curriculum'),
  ('sat', 'Scholastic Assessment Test preparation'),
  ('ielts', 'International English Language Testing System preparation')
ON CONFLICT (name) DO NOTHING;

-- Create user_curriculums junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.user_curriculums (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL,
  curriculum_id uuid NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT user_curriculums_pkey PRIMARY KEY (id),
  CONSTRAINT user_curriculums_user_id_curriculum_id_key UNIQUE (user_id, curriculum_id),
  CONSTRAINT user_curriculums_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT user_curriculums_curriculum_id_fkey FOREIGN KEY (curriculum_id) REFERENCES public.curriculums(id) ON DELETE CASCADE
);

-- Create index for faster curriculum lookup
CREATE INDEX IF NOT EXISTS idx_user_curriculums_user_id ON public.user_curriculums USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_curriculums_curriculum_id ON public.user_curriculums USING btree (curriculum_id);

-- Migration function to populate user_roles and user_curriculums from existing user_profiles
-- This will map existing users to the new role and curriculum system
CREATE OR REPLACE FUNCTION migrate_user_profiles() RETURNS void AS $$
DECLARE
  profile_record RECORD;
  role_id uuid;
  curriculum_id uuid;
BEGIN
  -- Migrate each user profile to the new tables
  FOR profile_record IN SELECT * FROM public.user_profiles WHERE user_id IS NOT NULL LOOP
    -- Find role ID for the user's group
    SELECT id INTO role_id FROM public.roles WHERE name = profile_record.user_group;
    
    -- If role exists, create user_role entry
    IF role_id IS NOT NULL THEN
      INSERT INTO public.user_roles (user_id, role_id)
      VALUES (profile_record.user_id, role_id)
      ON CONFLICT (user_id, role_id) DO NOTHING;
    END IF;
    
    -- Find curriculum ID for the user's curriculum if it exists
    IF profile_record.curriculum IS NOT NULL THEN
      SELECT id INTO curriculum_id FROM public.curriculums WHERE name = profile_record.curriculum;
      
      -- If curriculum exists, create user_curriculum entry
      IF curriculum_id IS NOT NULL THEN
        INSERT INTO public.user_curriculums (user_id, curriculum_id, is_primary)
        VALUES (profile_record.user_id, curriculum_id, true)
        ON CONFLICT (user_id, curriculum_id) DO NOTHING;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Run the migration function
SELECT migrate_user_profiles();

-- Drop the migration function as it's no longer needed
DROP FUNCTION migrate_user_profiles();

-- Record this migration
INSERT INTO migrations (name) VALUES ('003_role_curriculum_tables');
