-- Fix course_content table structure

-- First check if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'course_content') THEN
    -- Add missing columns if they don't exist
    
    -- Check and add file_url column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_content' AND column_name = 'file_url') THEN
      ALTER TABLE public.course_content ADD COLUMN file_url TEXT;
    END IF;
    
    -- Check and add file_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_content' AND column_name = 'file_name') THEN
      ALTER TABLE public.course_content ADD COLUMN file_name TEXT;
    END IF;
    
    -- Check and add file_size column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_content' AND column_name = 'file_size') THEN
      ALTER TABLE public.course_content ADD COLUMN file_size INTEGER;
    END IF;
    
    -- Check and add file_type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'course_content' AND column_name = 'file_type') THEN
      ALTER TABLE public.course_content ADD COLUMN file_type TEXT;
    END IF;

    -- Success message
    RAISE NOTICE 'course_content table columns updated successfully';
  ELSE
    -- Table doesn't exist
    RAISE EXCEPTION 'course_content table does not exist!';
  END IF;
END $$;

-- Allow facilitators to update/delete their own course content
CREATE POLICY "Facilitators can update/delete their own course content"
  ON course_content
  FOR UPDATE USING (created_by = auth.uid())
  FOR DELETE USING (created_by = auth.uid()); 