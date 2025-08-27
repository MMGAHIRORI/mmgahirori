import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { clearAuthState } from '@/utils/logout';

export const useAuthGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isActive = true;

    const checkAuthOnPageLoad = async () => {
      // Only check if we're on an admin page
      if (!location.pathname.startsWith('/admin')) {
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isActive) return; // Component unmounted
        
        if (error || !session) {
          console.log('No valid session found on page load, redirecting to login');
          clearAuthState();
          navigate('/admin-login', { replace: true });
          return;
        }

        // Verify user has proper role
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (!isActive) return; // Component unmounted

        if (!profile || !['admin', 'super_admin', 'operator', 'temp_admin_creator'].includes(profile.role)) {
          console.log('User does not have admin privileges, logging out');
          await supabase.auth.signOut();
          clearAuthState();
          navigate('/admin-login', { replace: true });
        }
      } catch (error) {
        if (!isActive) return;
        console.error('Auth check error:', error);
        clearAuthState();
        navigate('/admin-login', { replace: true });
      }
    };

    // Check auth immediately
    checkAuthOnPageLoad();

    // Listen for route changes (back/forward navigation)
    const handlePopState = () => {
      if (location.pathname.startsWith('/admin')) {
        checkAuthOnPageLoad();
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Listen for page visibility changes (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden && location.pathname.startsWith('/admin')) {
        checkAuthOnPageLoad();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      isActive = false;
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [location.pathname, navigate]);
};
