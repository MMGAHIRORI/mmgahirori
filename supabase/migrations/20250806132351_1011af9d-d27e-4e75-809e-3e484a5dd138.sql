-- Fix RLS policies for gallery_photos table to allow uploads
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admin can manage gallery photos" ON gallery_photos;
DROP POLICY IF EXISTS "Gallery photos are publicly readable" ON gallery_photos;

-- Create new permissive policies
CREATE POLICY "Gallery photos are publicly readable" 
ON gallery_photos 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert gallery photos" 
ON gallery_photos 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update gallery photos" 
ON gallery_photos 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete gallery photos" 
ON gallery_photos 
FOR DELETE 
USING (true);