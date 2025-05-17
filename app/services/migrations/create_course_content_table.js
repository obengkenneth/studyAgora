/**
 * Migration to create the course_content table
 * 
 * Run this migration with:
 * node migrate.js app/services/migrations/create_course_content_table.js
 */

export async function up(supabase) {
    const { error } = await supabase.rpc('create_course_content_table');
    
    if (error) {
      console.error('Error creating course_content table:', error);
      throw error;
    }
    
    console.log('Course content table created successfully!');
  }
  
  export async function down(supabase) {
    const { error } = await supabase.rpc('drop_course_content_table');
    
    if (error) {
      console.error('Error dropping course_content table:', error);
      throw error;
    }
    
    console.log('Course content table dropped successfully!');
  }
  
  /**
   * SQL Function for creating the course_content table
   * This will be executed on the Supabase server
   */
  export const createCourseContentTableSQL = `
  CREATE OR REPLACE FUNCTION create_course_content_table()
  RETURNS void AS $$
  BEGIN
    -- Create course_content table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.course_content (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content_type TEXT NOT NULL CHECK (content_type IN ('text', 'video', 'document', 'link')),
      content TEXT,
      description TEXT,
      file_url TEXT,
      file_name TEXT,
      file_size INTEGER,
      file_type TEXT,
      order_index INTEGER NOT NULL DEFAULT 0,
      is_published BOOLEAN DEFAULT TRUE,
      created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  
    -- Create storage bucket for course content files if it doesn't exist
    BEGIN
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('course_content', 'course_content', true)
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION
      WHEN others THEN null;
    END;
  
    -- Add policy to allow authenticated users to upload files
    BEGIN
      INSERT INTO storage.policies (name, definition, bucket_id)
      VALUES (
        'Authenticated users can upload files',
        '(role() = ''authenticated''::text)',
        'course_content'
      )
      ON CONFLICT (name, bucket_id) DO NOTHING;
    EXCEPTION
      WHEN others THEN null;
    END;
  
    -- Add indexes
    CREATE INDEX IF NOT EXISTS course_content_course_id_idx ON public.course_content(course_id);
    CREATE INDEX IF NOT EXISTS course_content_order_idx ON public.course_content(order_index);
  
    -- Add RLS policies
    -- Enable RLS
    ALTER TABLE public.course_content ENABLE ROW LEVEL SECURITY;
  
    -- Create policy to allow all users to view published course content
    CREATE POLICY "Course content is viewable by everyone" 
      ON public.course_content FOR SELECT 
      USING (is_published = true);
  
    -- Create policy to allow facilitators to view all content for their courses
    CREATE POLICY "Facilitators can view all content for their courses" 
      ON public.course_content FOR SELECT 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.courses c
          WHERE c.id = course_id AND c.created_by = auth.uid()
        )
      );
  
    -- Create policy to allow facilitators to insert content for their courses
    CREATE POLICY "Facilitators can create content for their courses" 
      ON public.course_content FOR INSERT 
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.courses c
          WHERE c.id = course_id AND c.created_by = auth.uid()
        )
      );
  
    -- Create policy to allow facilitators to update content for their courses
    CREATE POLICY "Facilitators can update content for their courses" 
      ON public.course_content FOR UPDATE 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.courses c
          WHERE c.id = course_id AND c.created_by = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.courses c
          WHERE c.id = course_id AND c.created_by = auth.uid()
        )
      );
  
    -- Create policy to allow facilitators to delete content for their courses
    CREATE POLICY "Facilitators can delete content for their courses" 
      ON public.course_content FOR DELETE 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.courses c
          WHERE c.id = course_id AND c.created_by = auth.uid()
        )
      );
  END;
  $$ LANGUAGE plpgsql;
  `;
  
  /**
   * SQL Function for dropping the course_content table
   * This will be executed on the Supabase server
   */
  export const dropCourseContentTableSQL = `
  CREATE OR REPLACE FUNCTION drop_course_content_table()
  RETURNS void AS $$
  BEGIN
    DROP TABLE IF EXISTS public.course_content;
  END;
  $$ LANGUAGE plpgsql;
  `;