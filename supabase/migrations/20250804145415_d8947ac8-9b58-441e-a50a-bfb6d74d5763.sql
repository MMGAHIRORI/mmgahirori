-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_time TIME,
  image_url TEXT,
  event_type TEXT CHECK (event_type IN ('katha', 'bhagwat', 'yagya', 'other')),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gallery photos table
CREATE TABLE public.gallery_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT,
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create live streaming settings table
CREATE TABLE public.live_stream_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_embed_url TEXT,
  is_live BOOLEAN DEFAULT false,
  stream_title TEXT,
  stream_description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_stream_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Events are publicly readable" 
ON public.events 
FOR SELECT 
USING (true);

CREATE POLICY "Gallery photos are publicly readable" 
ON public.gallery_photos 
FOR SELECT 
USING (true);

CREATE POLICY "Live stream settings are publicly readable" 
ON public.live_stream_settings 
FOR SELECT 
USING (true);

-- Create policies for admin access
CREATE POLICY "Admin can manage events" 
ON public.events 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admin can manage gallery photos" 
ON public.gallery_photos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admin can manage live stream settings" 
ON public.live_stream_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Admin users can view admin list" 
ON public.admin_users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_photos_updated_at
  BEFORE UPDATE ON public.gallery_photos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_live_stream_settings_updated_at
  BEFORE UPDATE ON public.live_stream_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default live stream settings
INSERT INTO public.live_stream_settings (youtube_embed_url, is_live, stream_title)
VALUES ('', false, 'Maharshi Mangal Giri Ashram Live Katha');

-- Insert some sample data
INSERT INTO public.events (title, description, event_date, event_time, event_type, is_featured) VALUES
('श्रीमद् भागवत कथा', 'श्रीमद् भागवत की पवित्र कथा का आयोजन', '2024-08-15 10:00:00+00', '10:00', 'bhagwat', true),
('यज्ञ समारोह', 'महर्षि मंगल गिरि आश्रम में यज्ञ का आयोजन', '2024-08-20 06:00:00+00', '06:00', 'yagya', false);

INSERT INTO public.gallery_photos (title, description, image_url, category, is_featured) VALUES
('आश्रम दृश्य', 'महर्षि मंगल गिरि आश्रम का मुख्य दृश्य', '/placeholder.svg', 'ashram', true),
('यज्ञ समारोह', 'यज्ञ के दौरान का दृश्य', '/placeholder.svg', 'events', false);