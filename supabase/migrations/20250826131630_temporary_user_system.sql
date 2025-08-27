-- Create temporary users table
CREATE TABLE public.temporary_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  can_create_admin BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create admin creation log table to track admin creation attempts
CREATE TABLE public.admin_creation_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  temporary_user_id UUID NOT NULL REFERENCES public.temporary_users(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES public.admin_users(id),
  attempt_successful BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  error_message TEXT
);

-- Create system settings table to track if main admin has been created
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert initial system setting to track admin creation
INSERT INTO public.system_settings (setting_key, setting_value) 
VALUES ('main_admin_created', 'false');

-- Enable Row Level Security
ALTER TABLE public.temporary_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_creation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for temporary users
CREATE POLICY "Temporary users can view their own record" 
ON public.temporary_users 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can manage temporary users" 
ON public.temporary_users 
FOR ALL 
USING (true);

-- Create policies for admin creation log
CREATE POLICY "Temporary users can view their own creation attempts" 
ON public.admin_creation_log 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.temporary_users 
    WHERE user_id = auth.uid() AND id = temporary_user_id
  )
);

CREATE POLICY "System can manage admin creation log" 
ON public.admin_creation_log 
FOR ALL 
USING (true);

-- Create policies for system settings
CREATE POLICY "Anyone can read system settings" 
ON public.system_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Only admin can update system settings" 
ON public.system_settings 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE user_id = auth.uid()
  )
);

-- Create trigger for automatic timestamp updates on temporary_users
CREATE TRIGGER update_temporary_users_updated_at
  BEFORE UPDATE ON public.temporary_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on system_settings
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically expire temporary users and revoke admin creation privilege
CREATE OR REPLACE FUNCTION public.expire_temporary_users()
RETURNS void AS $$
BEGIN
  -- Disable admin creation privilege for expired users
  UPDATE public.temporary_users
  SET can_create_admin = false,
      updated_at = now()
  WHERE expires_at < now() AND can_create_admin = true;
  
  -- Log the expiration
  INSERT INTO public.admin_creation_log (
    temporary_user_id, 
    attempt_successful, 
    error_message
  )
  SELECT 
    id,
    false,
    'Temporary user expired'
  FROM public.temporary_users
  WHERE expires_at < now() 
    AND can_create_admin = false 
    AND id NOT IN (
      SELECT temporary_user_id 
      FROM public.admin_creation_log 
      WHERE error_message = 'Temporary user expired'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to revoke admin creation privilege after successful admin creation
CREATE OR REPLACE FUNCTION public.revoke_admin_creation_privilege()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the temporary user to revoke admin creation privilege
  UPDATE public.temporary_users
  SET can_create_admin = false,
      updated_at = now()
  WHERE id = NEW.temporary_user_id;
  
  -- Update system settings to indicate main admin has been created
  UPDATE public.system_settings
  SET setting_value = 'true',
      updated_at = now()
  WHERE setting_key = 'main_admin_created';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically revoke privilege after successful admin creation
CREATE TRIGGER revoke_privilege_after_admin_creation
  AFTER INSERT ON public.admin_creation_log
  FOR EACH ROW
  WHEN (NEW.attempt_successful = true)
  EXECUTE FUNCTION public.revoke_admin_creation_privilege();

-- Function to check if main admin already exists
CREATE OR REPLACE FUNCTION public.main_admin_exists()
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT setting_value::boolean 
    FROM public.system_settings 
    WHERE setting_key = 'main_admin_created'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to validate temporary user can create admin
CREATE OR REPLACE FUNCTION public.can_temporary_user_create_admin(temp_user_id UUID)
RETURNS boolean AS $$
DECLARE
  temp_user_record RECORD;
BEGIN
  -- Check if main admin already exists
  IF public.main_admin_exists() THEN
    RETURN false;
  END IF;
  
  -- Get temporary user record
  SELECT * INTO temp_user_record
  FROM public.temporary_users
  WHERE id = temp_user_id;
  
  -- Check if temporary user exists, has privilege, and hasn't expired
  IF temp_user_record.id IS NULL THEN
    RETURN false;
  END IF;
  
  IF NOT temp_user_record.can_create_admin THEN
    RETURN false;
  END IF;
  
  IF temp_user_record.expires_at < now() THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;
