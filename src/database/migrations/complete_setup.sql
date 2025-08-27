-- Complete database setup for Mangal project
-- Run this entire script in your Supabase SQL Editor

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT,
    role TEXT DEFAULT 'user',
    can_read BOOLEAN DEFAULT true,
    can_write BOOLEAN DEFAULT false,
    is_disabled BOOLEAN DEFAULT false,
    admin_created BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create admin_users table (for backward compatibility)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time TIME,
    event_type TEXT,
    image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create gallery_photos table
CREATE TABLE IF NOT EXISTS gallery_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    category TEXT,
    display_order INTEGER,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create live_stream_settings table
CREATE TABLE IF NOT EXISTS live_stream_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stream_title TEXT,
    stream_description TEXT,
    youtube_embed_url TEXT,
    is_live BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create trigger to auto-create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (user_id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        'user'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gallery_photos_updated_at BEFORE UPDATE ON gallery_photos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_live_stream_settings_updated_at BEFORE UPDATE ON live_stream_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Insert default live stream settings
INSERT INTO live_stream_settings (stream_title, stream_description, is_live) 
VALUES ('Live Stream', 'Default stream configuration', false)
ON CONFLICT (id) DO NOTHING;

-- 9. Enable RLS on user_profiles (but with permissive policies for now)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Simple policy: authenticated users can read and update their own profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles  
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles (role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles (email);
CREATE INDEX IF NOT EXISTS idx_events_date ON events (event_date);
CREATE INDEX IF NOT EXISTS idx_gallery_featured ON gallery_photos (is_featured);

-- 11. Verify setup
SELECT 'Database setup completed successfully!' as status;

-- Show table structure
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_profiles', 'admin_users', 'events', 'gallery_photos', 'live_stream_settings');
