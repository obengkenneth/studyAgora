import { createClient } from '@supabase/supabase-js';
import { createCoursesTableSQL, dropCoursesTableSQL } from './app/services/migrations/create_courses_table.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Creating courses table...');
    
    // Execute the SQL directly
    const { error } = await supabase.sql(createCoursesTableSQL);
    
    if (error) {
      console.error('Error creating courses table:', error);
      return;
    }
    
    // Now run the function to create the table
    const { error: runError } = await supabase.rpc('create_courses_table');
    
    if (runError) {
      console.error('Error running create_courses_table function:', runError);
      return;
    }
    
    console.log('Courses table created successfully!');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

runMigration().catch(console.error); 