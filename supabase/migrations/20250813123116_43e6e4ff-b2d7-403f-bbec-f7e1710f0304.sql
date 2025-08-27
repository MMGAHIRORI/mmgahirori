-- Fix security vulnerability: Restrict gallery_photos operations to admin users only
-- Drop the existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can delete gallery photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Anyone can insert gallery photos" ON public.gallery_photos;
DROP POLICY IF EXISTS "Anyone can update gallery photos" ON public.gallery_photos;

-- Create secure policies that only allow admin users to modify gallery
CREATE POLICY "Admin users can insert gallery photos" 
ON public.gallery_photos 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admin users can update gallery photos" 
ON public.gallery_photos 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admin users can delete gallery photos" 
ON public.gallery_photos 
FOR DELETE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  )
);

-- Keep the public read access for the gallery display
-- (The existing "Gallery photos are publicly readable" policy remains unchanged)