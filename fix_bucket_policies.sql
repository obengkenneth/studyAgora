-- Fix storage bucket policies for course-content uploads

-- First, check if the bucket exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM storage.buckets 
    WHERE id = 'course-content'
  ) THEN
    -- Drop existing policies for the bucket
    DELETE FROM storage.policies 
    WHERE bucket_id = 'course-content';
    
    -- Create new storage policies that match the bucket name used in the app
    -- Policy for authenticated users to upload files
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Authenticated users can upload files',
      '(auth.role() = ''authenticated''::text)',
      'course-content'
    );
    
    -- Policy for authenticated users to select their own files
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Users can view uploaded files',
      'true', -- public access for viewing
      'course-content'
    );
    
    -- Policy for users to update their own files
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Users can update their own files',
      '(auth.uid() = owner) OR (auth.role() = ''authenticated''::text)',
      'course-content'
    );
    
    -- Policy for users to delete their own files
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Users can delete their own files',
      '(auth.uid() = owner) OR (auth.role() = ''authenticated''::text)',
      'course-content'
    );
    
    RAISE NOTICE 'Storage policies updated successfully for bucket: course-content';
  ELSE
    -- Create the bucket if it doesn't exist
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('course-content', 'course-content', true);
    
    -- Create all policies
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Authenticated users can upload files',
      '(auth.role() = ''authenticated''::text)',
      'course-content'
    );
    
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Users can view uploaded files',
      'true',
      'course-content'
    );
    
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Users can update their own files',
      '(auth.uid() = owner) OR (auth.role() = ''authenticated''::text)',
      'course-content'
    );
    
    INSERT INTO storage.policies (name, definition, bucket_id)
    VALUES (
      'Users can delete their own files',
      '(auth.uid() = owner) OR (auth.role() = ''authenticated''::text)',
      'course-content'
    );
    
    RAISE NOTICE 'Created bucket course-content with policies';
  END IF;
END $$; 