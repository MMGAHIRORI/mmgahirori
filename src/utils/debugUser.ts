import { supabase } from "@/integrations/supabase/client";

/**
 * Debug function to check user profile information
 * Call this in browser console: window.debugUser('email@example.com')
 */
export const debugUser = async (email: string) => {
  console.log('=== USER DEBUG INFO ===');
  console.log('Email:', email);
  
  try {
    // Check if user exists in user_profiles
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email);
    
    console.log('Profile Query Error:', profileError);
    console.log('Profile Data:', profiles);
    
    // Check if user exists in admin_users
    const { data: adminUsers, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email);
    
    console.log('Admin Users Query Error:', adminError);
    console.log('Admin Users Data:', adminUsers);
    
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Current Session:', session);
    
    return {
      profiles,
      adminUsers,
      session,
      profileError,
      adminError
    };
    
  } catch (error) {
    console.error('Debug error:', error);
    return { error };
  }
};

/**
 * Debug function to check all users in database
 */
export const debugAllUsers = async () => {
  console.log('=== ALL USERS DEBUG ===');
  
  try {
    // Get all profiles
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('All Profiles Error:', allProfilesError);
    console.log('All Profiles:', allProfiles);
    
    // Get all admin users
    const { data: allAdminUsers, error: allAdminError } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('All Admin Users Error:', allAdminError);
    console.log('All Admin Users:', allAdminUsers);
    
    return {
      allProfiles,
      allAdminUsers,
      allProfilesError,
      allAdminError
    };
    
  } catch (error) {
    console.error('Debug all users error:', error);
    return { error };
  }
};

// Make functions available globally for console use
if (typeof window !== 'undefined') {
  (window as any).debugUser = debugUser;
  (window as any).debugAllUsers = debugAllUsers;
}
