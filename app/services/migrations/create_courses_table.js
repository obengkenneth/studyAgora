/**
 * Migration to create the courses table
 * 
 * Run this migration with:
 * node migrate.js app/services/migrations/create_courses_table.js
 */

export async function up(supabase) {
  const { error } = await supabase.rpc('create_courses_table');
  
  if (error) {
    console.error('Error creating courses table:', error);
    throw error;
  }
  
  console.log('Courses table created successfully!');
}

export async function down(supabase) {
  const { error } = await supabase.rpc('drop_courses_table');
  
  if (error) {
    console.error('Error dropping courses table:', error);
    throw error;
  }
  
  console.log('Courses table dropped successfully!');
}

/**
 * SQL Function for creating the courses table
 * This will be executed on the Supabase server
 */
export const createCoursesTableSQL = `
CREATE OR REPLACE FUNCTION create_courses_table()
RETURNS void AS $$
BEGIN
  -- Create courses table if it doesn't exist
  CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    duration TEXT NOT NULL,
    curriculum TEXT NOT NULL,
    image TEXT NOT NULL,
    students INTEGER DEFAULT 0,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
  );

  -- Add RLS policies
  -- Enable RLS
  ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

  -- Create policy to allow all users to view courses
  CREATE POLICY "Courses are viewable by everyone" 
    ON public.courses FOR SELECT 
    USING (true);

  -- Create policy to allow facilitators to insert courses
  CREATE POLICY "Facilitators can create courses" 
    ON public.courses FOR INSERT 
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.user_id = auth.uid() AND up.user_group = 'facilitator'
      )
    );

  -- Create policy to allow course creators to update their own courses
  CREATE POLICY "Facilitators can update their own courses" 
    ON public.courses FOR UPDATE 
    TO authenticated
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

  -- Create policy to allow course creators to delete their own courses
  CREATE POLICY "Facilitators can delete their own courses" 
    ON public.courses FOR DELETE 
    TO authenticated
    USING (created_by = auth.uid());
END;
$$ LANGUAGE plpgsql;
`;

/**
 * SQL Function for dropping the courses table
 * This will be executed on the Supabase server
 */
export const dropCoursesTableSQL = `
CREATE OR REPLACE FUNCTION drop_courses_table()
RETURNS void AS $$
BEGIN
  DROP TABLE IF EXISTS public.courses;
END;
$$ LANGUAGE plpgsql;
`; 