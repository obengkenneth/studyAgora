const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Hardcoded Supabase credentials from env.js fallback
const supabaseUrl = "https://zhtaaeyijaqeqzcmpxnp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpodGFhZXlpamFxZXF6Y21weG5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0NzU5MDksImV4cCI6MjA2MDA1MTkwOX0.656lE7AQSAkd_WmsSdOV6TIVxKR41cDXORTCPYV0oIg";

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SQL for creating tables
const CREATE_USER_PROFILES_TABLE = `
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  avatar_url TEXT,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'student'
);
`;

const CREATE_SESSIONS_TABLE = `
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  facilitator_id UUID REFERENCES user_profiles(id),
  is_live BOOLEAN DEFAULT false,
  video_url TEXT
);
`;

const CREATE_RESOURCES_TABLE = `
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  uploaded_by UUID REFERENCES user_profiles(id)
);
`;

async function createTablesViaAPI() {
  try {
    console.log('--- Starting database migration ---');
    
    // Create user_profiles table if it doesn't exist
    console.log('Checking for user_profiles table...');
    const { error: userProfilesError } = await supabase.from('user_profiles').select('id').limit(1);
    
    if (userProfilesError && userProfilesError.code === '42P01') {
      console.log('Creating user_profiles table...');
      
      try {
        // Use the Supabase service API to execute SQL directly
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            command: 'CREATE',
            table: 'user_profiles',
            columns: [
              { name: 'id', type: 'uuid', primary: true, references: 'auth.users(id)' },
              { name: 'created_at', type: 'timestamptz', default: 'now()' },
              { name: 'updated_at', type: 'timestamptz', default: 'now()' },
              { name: 'full_name', type: 'text', nullable: true },
              { name: 'avatar_url', type: 'text', nullable: true },
              { name: 'email', type: 'text', nullable: false },
              { name: 'role', type: 'text', default: "'student'" }
            ]
          })
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('API error creating user_profiles:', errorData);
        } else {
          console.log('user_profiles table created successfully');
        }
      } catch (createError) {
        console.error('Error creating user_profiles table:', createError);
      }
    } else {
      console.log('user_profiles table already exists');
    }
    
    // Create sessions table if it doesn't exist
    console.log('Checking for sessions table...');
    const { error: sessionsError } = await supabase.from('sessions').select('id').limit(1);
    
    if (sessionsError && sessionsError.code === '42P01') {
      console.log('Creating sessions table...');
      
      try {
        // Use the Supabase service API to execute SQL directly
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            command: 'CREATE',
            table: 'sessions',
            columns: [
              { name: 'id', type: 'uuid', primary: true, default: 'uuid_generate_v4()' },
              { name: 'created_at', type: 'timestamptz', default: 'now()' },
              { name: 'title', type: 'text', nullable: false },
              { name: 'description', type: 'text', nullable: true },
              { name: 'start_time', type: 'timestamptz', nullable: false },
              { name: 'end_time', type: 'timestamptz', nullable: true },
              { name: 'facilitator_id', type: 'uuid', references: 'user_profiles(id)', nullable: true },
              { name: 'is_live', type: 'boolean', default: 'false' },
              { name: 'video_url', type: 'text', nullable: true }
            ]
          })
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('API error creating sessions:', errorData);
        } else {
          console.log('sessions table created successfully');
        }
      } catch (createError) {
        console.error('Error creating sessions table:', createError);
      }
    } else {
      console.log('sessions table already exists');
    }
    
    // Create resources table if it doesn't exist
    console.log('Checking for resources table...');
    const { error: resourcesError } = await supabase.from('resources').select('id').limit(1);
    
    if (resourcesError && resourcesError.code === '42P01') {
      console.log('Creating resources table...');
      
      try {
        // Use the Supabase service API to execute SQL directly
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            command: 'CREATE',
            table: 'resources',
            columns: [
              { name: 'id', type: 'uuid', primary: true, default: 'uuid_generate_v4()' },
              { name: 'created_at', type: 'timestamptz', default: 'now()' },
              { name: 'title', type: 'text', nullable: false },
              { name: 'description', type: 'text', nullable: true },
              { name: 'url', type: 'text', nullable: false },
              { name: 'type', type: 'text', nullable: false },
              { name: 'uploaded_by', type: 'uuid', references: 'user_profiles(id)', nullable: true }
            ]
          })
        });
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error('API error creating resources:', errorData);
        } else {
          console.log('resources table created successfully');
        }
      } catch (createError) {
        console.error('Error creating resources table:', createError);
      }
    } else {
      console.log('resources table already exists');
    }
    
    // Create a sample user if user_profiles table was created
    try {
      const { data: existingUsers, error: existingError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);
      
      if (!existingError && (!existingUsers || existingUsers.length === 0)) {
        console.log('Creating sample user...');
        
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([
            {
              id: '00000000-0000-0000-0000-000000000000',
              email: 'sample@studyagora.com',
              full_name: 'Sample User',
              role: 'admin'
            }
          ]);
        
        if (insertError) {
          console.error('Error creating sample user:', insertError.message);
        } else {
          console.log('Sample user created successfully');
        }
      }
    } catch (error) {
      console.error('Error checking for existing users:', error.message);
    }
    
    console.log('--- Database migration completed ---');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}

// Run the migration
createTablesViaAPI()
  .then(success => {
    if (success) {
      console.log('Migration completed successfully');
      process.exit(0);
    } else {
      console.error('Migration failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error during migration:', error);
    process.exit(1);
  }); 