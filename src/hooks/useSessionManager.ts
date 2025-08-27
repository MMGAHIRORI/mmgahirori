import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { performCompleteLogout, clearAuthState } from '@/utils/logout';

export const useSessionManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const sessionCheckRef = useRef<NodeJS.Timeout>();
  const warningShownRef = useRef(false);

  useEffect(() => {
    // Set up session monitoring
    const setupSessionMonitoring = () => {
      // Clear any existing interval
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
      }

      // Check session every minute
      sessionCheckRef.current = setInterval(async () => {
        try {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error || !session) {
            console.log('Session check: No valid session, logging out');
            await handleSessionExpiry();
            return;
          }

          const now = Math.floor(Date.now() / 1000);
          const expiresAt = session.expires_at || 0;
          const timeUntilExpiry = expiresAt - now;

          // Show warning when 5 minutes remain
          if (timeUntilExpiry < 300 && timeUntilExpiry > 240 && !warningShownRef.current) {
            warningShownRef.current = true;
            toast({
              title: "Session Expiring Soon",
              description: "Your session will expire in 5 minutes. Please save your work.",
              variant: "destructive",
            });

            // Reset warning flag after 2 minutes so it can show again if needed
            setTimeout(() => {
              warningShownRef.current = false;
            }, 2 * 60 * 1000);
          }

          // Force logout when session expires
          if (timeUntilExpiry < 0) {
            console.log('Session expired, forcing logout');
            await handleSessionExpiry();
          }
        } catch (error) {
          console.error('Session check error:', error);
          await handleSessionExpiry();
        }
      }, 60 * 1000); // Check every minute
    };

    const handleSessionExpiry = async () => {
      console.log('Handling session expiry');
      
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please login again.",
        variant: "destructive",
      });
      
      // Use comprehensive logout to ensure complete cleanup
      await performCompleteLogout();
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log('Auth state: User signed out or no session');
        if (sessionCheckRef.current) {
          clearInterval(sessionCheckRef.current);
        }
        
        // Clear auth state immediately
        clearAuthState();
        
        // Force logout to ensure complete cleanup
        if (window.location.pathname.startsWith('/admin')) {
          await performCompleteLogout();
        } else {
          navigate('/admin-login', { replace: true });
        }
        return;
      }
      
      if (event === 'SIGNED_IN') {
        console.log('Auth state: User signed in, setting up session monitoring');
        setupSessionMonitoring();
        return;
      }
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Auth state: Token refreshed successfully');
        // Reset warning flag when token is refreshed
        warningShownRef.current = false;
        return;
      }
    });

    // Initial setup if already authenticated
    const initializeIfAuthenticated = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('Initial session found, setting up monitoring');
        setupSessionMonitoring();
      }
    };

    initializeIfAuthenticated();

    // Cleanup function
    return () => {
      subscription.unsubscribe();
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
      }
    };
  }, [navigate, toast]);

  // Manual session refresh function
  const refreshSession = async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        throw error;
      }
      toast({
        title: "Session Refreshed",
        description: "Your session has been extended.",
      });
    } catch (error) {
      console.error('Failed to refresh session:', error);
      toast({
        title: "Session Refresh Failed",
        description: "Unable to refresh session. Please login again.",
        variant: "destructive",
      });
    }
  };

  return {
    refreshSession,
  };
};
