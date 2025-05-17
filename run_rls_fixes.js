import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
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

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseKey);

async function runFixes() {
  try {
    console.log('Running RLS and bucket policy fixes...');
    
    // Read bucket policy fixes
    const bucketFixSQL = fs.readFileSync(path.join(process.cwd(), 'fix_bucket_policies.sql'), 'utf8');
    console.log('Applying bucket policy fixes...');
    const { error: bucketError } = await supabase.sql(bucketFixSQL);
    
    if (bucketError) {
      console.error('Error applying bucket policy fixes:', bucketError);
    } else {
      console.log('Bucket policy fixes applied successfully!');
    }
    
    // Read table RLS fixes
    const rlsFixSQL = fs.readFileSync(path.join(process.cwd(), 'fix_course_content_rls.sql'), 'utf8');
    console.log('Applying course_content RLS fixes...');
    const { error: rlsError } = await supabase.sql(rlsFixSQL);
    
    if (rlsError) {
      console.error('Error applying RLS fixes:', rlsError);
    } else {
      console.log('RLS fixes applied successfully!');
    }
    
    console.log('All fixes completed!');
  } catch (error) {
    console.error('Error running fixes:', error);
  }
}

runFixes(); 