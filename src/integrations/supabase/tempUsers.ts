import { supabase } from "./client";

export type TempUserProfile = {
  user_id: string;
  name: string;
  email: string;
  role: "temp_admin_creator";
  can_read: boolean;
  can_write: boolean;
  is_disabled: boolean;
  created_at: string;
  updated_at: string;
  admin_created: boolean;
  expires_at: string;
};

export const createTempUser = async (
  email: string,
  password: string,
  name: string
): Promise<{ userId: string; email: string }> => {
  if (!email || !password || !name) {
    throw new Error("Email, password, and name are required");
  }

  // Create user with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("User sign up failed");
  }

  // Set expiration to 24 hours from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Update user profile with temporary admin creator role
  const { error: roleError } = await supabase
    .from('user_profiles')
    .update({ 
      role: 'temp_admin_creator',
      name: name,
      can_read: false,
      can_write: false,
      is_disabled: false,
      admin_created: false,
      expires_at: expiresAt.toISOString()
    })
    .eq('user_id', data.user.id);

  if (roleError) {
    throw new Error(roleError.message);
  }

  return { userId: data.user.id, email };
};

export const getTempUserProfile = async (): Promise<TempUserProfile | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("role", "temp_admin_creator")
      .single();
      
    if (error) {
      console.error('Error fetching temp user profile:', error);
      return null;
    }
    return data as TempUserProfile;
  } catch (err) {
    console.error('Exception in getTempUserProfile:', err);
    return null;
  }
};

export const checkTempUserExpiry = async (): Promise<boolean> => {
  const profile = await getTempUserProfile();
  if (!profile) return true; // Consider expired if no profile found
  
  const now = new Date();
  const expiresAt = new Date(profile.expires_at);
  
  return now > expiresAt;
};

export const createAdminFromTempUser = async (
  adminEmail: string,
  adminPassword: string,
  adminName: string
): Promise<{ userId: string; email: string }> => {
  const tempProfile = await getTempUserProfile();
  
  if (!tempProfile) {
    throw new Error("No temporary user profile found");
  }

  // Check if temp user has already created an admin
  if (tempProfile.admin_created) {
    throw new Error("This temporary user has already created an admin user");
  }

  // Check if temp user has expired
  const isExpired = await checkTempUserExpiry();
  if (isExpired) {
    throw new Error("Temporary user has expired");
  }

  // Create the admin user
  const { data, error } = await supabase.auth.signUp({
    email: adminEmail,
    password: adminPassword,
    options: {
      data: {
        name: adminName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("Admin user creation failed");
  }

  // Set admin role and full privileges
  const { error: adminRoleError } = await supabase
    .from('user_profiles')
    .update({ 
      role: 'admin',
      name: adminName,
      can_read: true,
      can_write: true,
      is_disabled: false
    })
    .eq('user_id', data.user.id);

  if (adminRoleError) {
    throw new Error(adminRoleError.message);
  }

  // Also add to admin_users table for backward compatibility
  const { error: adminError } = await supabase
    .from("admin_users")
    .insert({ user_id: data.user.id, email: adminEmail, role: "admin" });

  if (adminError) {
    console.warn('admin_users insert failed', adminError);
  }

  // Mark temporary user as having created an admin and disable it
  const { error: tempUpdateError } = await supabase
    .from('user_profiles')
    .update({ 
      admin_created: true,
      is_disabled: true
    })
    .eq('user_id', tempProfile.user_id);

  if (tempUpdateError) {
    console.error('Failed to update temp user status:', tempUpdateError);
  }

  return { userId: data.user.id, email: adminEmail };
};

export const disableExpiredTempUsers = async (): Promise<void> => {
  const now = new Date().toISOString();
  
  const { error } = await supabase
    .from('user_profiles')
    .update({ is_disabled: true })
    .eq('role', 'temp_admin_creator')
    .lt('expires_at', now)
    .eq('is_disabled', false);

  if (error) {
    console.error('Failed to disable expired temp users:', error);
  }
};

export const loginTempUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  // Check if user is a temp user and not expired
  const tempProfile = await getTempUserProfile();
  if (tempProfile) {
    const isExpired = await checkTempUserExpiry();
    if (isExpired) {
      await supabase.auth.signOut();
      throw new Error("Temporary user has expired");
    }
  }

  return data;
};
