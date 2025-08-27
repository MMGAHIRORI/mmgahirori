import { supabase } from '@/integrations/supabase/client';

export const setCurrentUserAsMainAdmin = async (): Promise<void> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session found');
    }

    // Update current user to be the main admin
    const { error } = await supabase
      .from('user_profiles')
      .update({
        role: 'super_admin',
        is_main_admin: true,
        can_read: true,
        can_write: true,
        can_manage_events: true,
        can_manage_gallery: true,
        can_manage_livestream: true,
        can_edit_profile: true,
        can_manage_users: true,
        is_disabled: false
      })
      .eq('user_id', session.user.id);

    if (error) {
      throw new Error(`Failed to set main admin: ${error.message}`);
    }

    console.log('Current user set as main admin successfully');
  } catch (error) {
    console.error('Error setting main admin:', error);
    throw error;
  }
};

export const checkIfMainAdminExists = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('is_main_admin', true)
      .limit(1);

    if (error) {
      throw new Error(`Error checking main admin: ${error.message}`);
    }

    return (data && data.length > 0);
  } catch (error) {
    console.error('Error checking main admin:', error);
    return false;
  }
};
