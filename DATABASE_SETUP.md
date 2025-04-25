# StudyAgora Database Setup

This document explains how to set up and maintain the StudyAgora database in Supabase.

## Prerequisites

- A Supabase project with URL and API keys
- Node.js installed on your machine

## Setting Up Environment Variables

Create or update your `.env` file with the following variables:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

For security, it's preferable to use the `SUPABASE_SERVICE_ROLE_KEY` when running migrations, but the `SUPABASE_ANON_KEY` will work if your RLS policies are set up correctly.

## Running Migrations

### Option 1: Using the Migration Script (Recommended)

We've created a script to run migrations directly:

```bash
# Run the default migration file (initial_schema.sql)
node run_supabase_migration.js

# Or specify a specific migration file
node run_supabase_migration.js path/to/migration.sql
```

### Option 2: Manual SQL Execution

You can also run the SQL directly in the Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a "New Query"
4. Copy the contents of `app/services/migrations/initial_schema.sql`
5. Click "Run" to execute the SQL

### Option 3: Using the Supabase CLI

If you have the Supabase CLI installed:

```bash
# Initial setup
supabase init
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Database Schema

The database includes the following tables:

1. `user_profiles` - User information including role and curriculum
2. `resources` - Educational resources like notes and books
3. `pre_recorded_sessions` - For on-demand video content
4. `live_sessions` - For scheduled interactive sessions
5. `session_resources` - Junction table linking resources to sessions
6. `session_enrollments` - Track which users are enrolled in which sessions

## Key Fields in user_profiles

- `id`: Primary key, UUID
- `user_id`: References auth.users, used to link profile to auth
- `user_group`: One of 'student', 'parent', 'facilitator'
- `curriculum`: One of 'cambridge', 'sat', 'ielts'

## Troubleshooting

### Column not found error

If you see errors like `column user_profiles.user_id does not exist`, it means your database schema doesn't match what the code is expecting. Run the migration script to create the correct schema.

### RLS Policy Errors

If you get permission errors when accessing the database, check that:
1. The appropriate RLS policies are in place
2. You're using the correct Supabase key
3. The user has the appropriate role assigned

### Migration Script Failures

The script attempts to use two different methods to run migrations. If the first method fails (using RPC), it will fall back to direct SQL execution. If both fail:

1. Check that your Supabase URL and keys are correct
2. Ensure the SQL file exists at the specified path
3. Try running the SQL manually in the Supabase SQL Editor 