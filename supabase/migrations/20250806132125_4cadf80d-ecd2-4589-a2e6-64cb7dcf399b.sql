-- Fix storage RLS policies for gallery photos upload
-- First drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to gallery photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin upload to gallery photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update gallery photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete gallery photos" ON storage.objects;

-- Create more permissive policies for gallery photos bucket
CREATE POLICY "Public can view gallery photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'gallery-photos');

CREATE POLICY "Anyone can upload to gallery photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'gallery-photos');

CREATE POLICY "Anyone can update gallery photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'gallery-photos');

CREATE POLICY "Anyone can delete gallery photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'gallery-photos');