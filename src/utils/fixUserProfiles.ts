import { supabase } from '@/integrations/supabase/client';

export const fixExistingUserProfile = async (userId: string, email: string): Promise<void> => {
  try {
    console.log('Fixing profile for user:', userId, email);
    
    // First, check what profiles exist for this user
    const { data: existingProfiles, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId);
    
    if (fetchError) {
      throw new Error(`Failed to fetch existing profiles: ${fetchError.message}`);
    }
    
    console.log('Existing profiles:', existingProfiles);
    
    if (!existingProfiles || existingProfiles.length === 0) {
      // No profile exists, create one
      console.log('Creating new profile...');
      
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          email: email,
          name: email.split('@')[0] || 'User',
          role: 'operator', // Default to operator for existing users
          can_read: true,
          can_write: false,
          is_disabled: false,
          can_manage_events: false,
          can_manage_gallery: false,
          can_manage_livestream: false,
          can_edit_profile: false,
          can_manage_users: false,
          is_main_admin: false
        });
      
      if (insertError) {
        throw new Error(`Failed to create profile: ${insertError.message}`);
      }
      
      console.log('Profile created successfully');
    } else if (existingProfiles.length > 1) {
      // Multiple profiles exist, delete duplicates and keep the first admin/operator one
      console.log('Multiple profiles found, cleaning up...');
      
      const adminProfile = existingProfiles.find(p => ['admin', 'super_admin', 'operator'].includes(p.role));
      const keepProfile = adminProfile || existingProfiles[0];
      
      // Delete all other profiles
      const profilesToDelete = existingProfiles.filter(p => p.user_id !== keepProfile.user_id || p.created_at !== keepProfile.created_at);
      
      for (const profileToDelete of profilesToDelete) {
        const { error: deleteError } = await supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', profileToDelete.user_id)
          .eq('created_at', profileToDelete.created_at);
        
        if (deleteError) {
          console.error('Failed to delete duplicate profile:', deleteError);
        }
      }
      
      console.log('Duplicate profiles cleaned up');
    } else {
      console.log('Profile exists and is unique, no action needed');
    }
    
  } catch (error) {
    console.error('Error fixing user profile:', error);
    throw error;
  }
};

export const fixAllExistingProfiles = async (): Promise<void> => {
  try {
    console.log('Fixing all existing user profiles...');
    
    // Get all auth users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      throw new Error(`Failed to fetch auth users: ${usersError.message}`);
    }
    
    for (const user of users) {
      if (user.email) {
        try {
          await fixExistingUserProfile(user.id, user.email);
        } catch (error) {
          console.error(`Failed to fix profile for user ${user.email}:`, error);
          // Continue with other users
        }
      }
    }
    
    console.log('All profiles fixed successfully');
  } catch (error) {
    console.error('Error fixing all profiles:', error);
    throw error;
  }
};
