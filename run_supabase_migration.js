const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('⛔ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env file');
  process.exit(1);
}

// Create a Supabase client with the service role key (this bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('Using service role key to bypass RLS policies');

// Export function to create service client (for use in code that needs to bypass RLS)
function createServiceClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('⛔ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Export function to create anonymous client (for normal user operations)
function createAnonClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⛔ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env');
    return null;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  });
}

// Path to migration file
const migrationFilePath = process.argv[2] || path.join(__dirname, 'app/services/migrations/initial_schema.sql');

async function runMigration() {
  try {
    console.log(`🔄 Running migration from ${migrationFilePath}...`);
    
    // Read the SQL file
    const sql = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Execute the SQL
    const { error } = await supabase.rpc('pgmigrate', { query: sql });
    
    if (error) {
      console.error('⛔ Migration failed with pgmigrate:', error);
      throw error;
    }
    
    console.log('✅ Migration completed successfully!');
    
    // Test the connection
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
      
    if (testError) {
      console.error('⚠️ Database connection test failed:', testError);
    } else {
      console.log('✅ Database connection test successful:', testData ? `Found ${testData.length} profiles` : 'No profiles yet');
    }
    
  } catch (err) {
    console.error('⛔ Unexpected error:', err);
    throw err;
  }
}

// Alternative approach if rpc doesn't work
async function runDirectSql() {
  try {
    console.log(`🔄 Running direct SQL from ${migrationFilePath}...`);
    
    // Read the SQL file
    const sql = fs.readFileSync(migrationFilePath, 'utf8');
    
    // Execute the SQL directly
    const { error } = await supabase.sql(sql);
    
    if (error) {
      console.error('⛔ Direct SQL execution failed:', error);
      process.exit(1);
    }
    
    console.log('✅ SQL executed successfully!');
  } catch (err) {
    console.error('⛔ Unexpected error in direct SQL:', err);
    process.exit(1);
  }
}

// Run the migration if this file is executed directly
if (require.main === module) {
  console.log('📋 Starting database migrations...');
  runMigration().catch(async (err) => {
    console.error('❌ Error with pgmigrate method, trying direct SQL...');
    await runDirectSql();
  });
}

// Export functions for use in other files
module.exports = {
  supabase,
  createServiceClient,
  createAnonClient,
  runMigration,
  runDirectSql
}; 