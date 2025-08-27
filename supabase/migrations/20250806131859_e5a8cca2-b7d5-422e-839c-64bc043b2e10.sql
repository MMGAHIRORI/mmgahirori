-- Fix storage policies for gallery-photos bucket uploads

-- Create storage policies for gallery photos bucket
CREATE POLICY "Allow public read access to gallery photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'gallery-photos');

CREATE POLICY "Allow admin upload to gallery photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'gallery-photos' 
  AND EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Allow admin update gallery photos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'gallery-photos' 
  AND EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Allow admin delete gallery photos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'gallery-photos' 
  AND EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid()
  )
);