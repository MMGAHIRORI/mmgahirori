import { supabase } from "./client";

export interface CreatedAdminUserResult {
  userId: string;
  email: string;
}

export const createAdminUser = async (
  email: string,
  password: string,
  role: 'admin' | 'user' | 'operator' = 'admin',
  permissions?: {
    can_manage_events?: boolean;
    can_manage_gallery?: boolean;
    can_manage_livestream?: boolean;
    can_edit_profile?: boolean;
    can_manage_users?: boolean;
  }
): Promise<CreatedAdminUserResult> => {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/admin-login`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("User sign up failed");
  }

  // Get current user to set as creator
  const { data: { session } } = await supabase.auth.getSession();
  const createdBy = session?.user?.id || null;
  
  // Set default permissions based on role
  const defaultPermissions = {
    can_read: true,
    can_write: role === 'admin',
    can_manage_events: role === 'admin',
    can_manage_gallery: role === 'admin',
    can_manage_livestream: role === 'admin',
    can_edit_profile: role === 'admin',
    can_manage_users: role === 'admin', // Admins can manage users by default
    is_disabled: false,
    is_main_admin: false, // New users are never main admin
    created_by: createdBy
  };

  // Override with custom permissions if provided
  const finalPermissions = permissions ? { ...defaultPermissions, ...permissions } : defaultPermissions;

  // First, check if profile already exists
  const { data: existingProfiles } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', data.user.id);
  
  let profileUpdated = false;
  
  if (existingProfiles && existingProfiles.length > 0) {
    // Profile exists, update it
    console.log('Profile exists, updating...');
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        role,
        ...finalPermissions
      })
      .eq('user_id', data.user.id);
    
    if (updateError) {
      throw new Error(`Failed to update user profile: ${updateError.message}`);
    }
    profileUpdated = true;
  } else {
    // No profile exists, create one
    console.log('No profile exists, creating new one...');
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: data.user.id,
        email: email,
        name: email.split('@')[0], // Use email prefix as default name
        role,
        ...finalPermissions
      });
    
    if (insertError) {
      // Try with upsert as fallback
      console.log('Insert failed, trying upsert...');
      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: data.user.id,
          email: email,
          name: email.split('@')[0],
          role,
          ...finalPermissions
        });
      
      if (upsertError) {
        throw new Error(`Failed to create user profile: ${upsertError.message}`);
      }
    }
    profileUpdated = true;
  }

  if (!profileUpdated) {
    throw new Error('Failed to update user profile after multiple attempts');
  }

  // Add to admin_users table for admin and operator roles
  if (role === 'admin' || role === 'operator') {
    const { error: adminError } = await supabase
      .from("admin_users")
      .insert({ user_id: data.user.id, email, role });
    if (adminError) {
      // Ignore soft-fail for legacy table to avoid blocking flow
      console.warn('admin_users insert failed', adminError);
    }
  }

  return { userId: data.user.id, email };
};

export const sendPasswordReset = async (email: string): Promise<void> => {
  if (!email) throw new Error("Email is required");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/admin-login`,
  });

  if (error) {
    throw new Error(error.message);
  }
};


