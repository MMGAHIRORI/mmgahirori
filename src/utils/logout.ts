import { supabase } from '@/integrations/supabase/client';

export const performCompleteLogout = async (): Promise<void> => {
  try {
    console.log('Starting complete logout process...');
    
    // 1. Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Supabase signout error:', error);
      // Continue with logout even if there's an error
    }
    
    // 2. Clear all localStorage data
    try {
      localStorage.clear();
      console.log('localStorage cleared');
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    
    // 3. Clear all sessionStorage data
    try {
      sessionStorage.clear();
      console.log('sessionStorage cleared');
    } catch (e) {
      console.error('Error clearing sessionStorage:', e);
    }
    
    // 4. Clear any Supabase specific storage
    try {
      // Clear auth storage keys that might be cached
      const authKeys = [
        'supabase.auth.token',
        'sb-auth-token',
        'supabase-auth-token'
      ];
      
      authKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      console.log('Supabase auth keys cleared');
    } catch (e) {
      console.error('Error clearing auth keys:', e);
    }
    
    // 5. Force reload to clear any memory state
    console.log('Forcing page reload to clear all state...');
    
    // Small delay to ensure all async operations complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Force navigation and reload
    window.location.href = '/admin-login';
    
    // Fallback reload if navigation doesn't work
    setTimeout(() => {
      window.location.reload();
    }, 200);
    
  } catch (error) {
    console.error('Complete logout error:', error);
    // Even if there are errors, force the page reload
    window.location.href = '/admin-login';
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
};

export const clearAuthState = (): void => {
  // Clear any auth-related data that might be in memory or storage
  try {
    // Clear auth tokens from various possible storage locations
    const possibleKeys = [
      'supabase.auth.token',
      'sb-auth-token', 
      'supabase-auth-token',
      'auth-session',
      'user-session',
      'admin-session'
    ];
    
    possibleKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.log('Auth state cleared from storage');
  } catch (error) {
    console.error('Error clearing auth state:', error);
  }
};
