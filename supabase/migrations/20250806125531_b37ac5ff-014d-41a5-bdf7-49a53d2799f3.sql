-- Create storage bucket for gallery photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery-photos', 'gallery-photos', true);

-- Create policies for gallery photo uploads
CREATE POLICY "Gallery photos are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'gallery-photos');

CREATE POLICY "Admins can upload gallery photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'gallery-photos' AND EXISTS (
  SELECT 1 FROM admin_users WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can update gallery photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'gallery-photos' AND EXISTS (
  SELECT 1 FROM admin_users WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can delete gallery photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'gallery-photos' AND EXISTS (
  SELECT 1 FROM admin_users WHERE user_id = auth.uid()
));