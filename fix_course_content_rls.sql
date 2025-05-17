-- Fix RLS policies for course_content table

-- First check if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_content') THEN
    -- Temporarily disable RLS to allow fixing the table
    ALTER TABLE public.course_content DISABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Course content is viewable by everyone" ON public.course_content;
    DROP POLICY IF EXISTS "Facilitators can view all content for their courses" ON public.course_content;
    DROP POLICY IF EXISTS "Facilitators can create content for their courses" ON public.course_content;
    DROP POLICY IF EXISTS "Facilitators can update content for their courses" ON public.course_content;
    DROP POLICY IF EXISTS "Facilitators can delete content for their courses" ON public.course_content;
    DROP POLICY IF EXISTS "Facilitators can update/delete their own course content" ON public.course_content;
    
    -- Create new policies
    
    -- Allow anyone to view published content
    CREATE POLICY "Course content is viewable by everyone" 
      ON public.course_content FOR SELECT 
      USING (is_published = true);
    
    -- Allow facilitators to view their own course content
    CREATE POLICY "Facilitators can view all content for their courses" 
      ON public.course_content FOR SELECT 
      TO authenticated
      USING (
        created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.courses c
          WHERE c.id = course_id AND c.created_by = auth.uid()
        )
      );
    
    -- Simplified insert policy for facilitators
    CREATE POLICY "Facilitators can create content for courses" 
      ON public.course_content FOR INSERT 
      TO authenticated
      WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
          SELECT 1 FROM public.user_profiles up
          WHERE up.user_id = auth.uid() AND up.user_group = 'facilitator'
        )
      );
    
    -- Allow facilitators to update their own content
    CREATE POLICY "Facilitators can update their own content" 
      ON public.course_content FOR UPDATE 
      TO authenticated
      USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid());
    
    -- Allow facilitators to delete their own content
    CREATE POLICY "Facilitators can delete their own content" 
      ON public.course_content FOR DELETE 
      TO authenticated
      USING (created_by = auth.uid());
    
    -- Re-enable RLS
    ALTER TABLE public.course_content ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'RLS policies for course_content table updated successfully';
  ELSE
    RAISE EXCEPTION 'course_content table does not exist!';
  END IF;
END $$; 