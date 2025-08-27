import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getTempUserProfile } from "@/integrations/supabase/tempUsers";
import { clearAuthState } from "@/utils/logout";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        if (requireAdmin) {
          // Check if user has admin privileges
          const { data: profiles, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id);

          if (profileError) {
            console.error('Profile fetch error:', profileError);
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
          
          let profile = null;
          
          if (!profiles || profiles.length === 0) {
            console.log('No profile found for user');
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          } else if (profiles.length > 1) {
            console.warn('Multiple profiles found, using the first admin/operator profile');
            // Find the first admin/operator profile
            profile = profiles.find(p => ['admin', 'super_admin', 'operator', 'temp_admin_creator'].includes(p.role)) || profiles[0];
          } else {
            profile = profiles[0];
          }

          // Allow admin, super_admin, operator, and temp_admin_creator roles
          if (['admin', 'super_admin', 'operator', 'temp_admin_creator'].includes(profile?.role)) {
            // Additional check for temporary users - verify not expired
            if (profile.role === 'temp_admin_creator') {
              const tempProfile = await getTempUserProfile();
              if (!tempProfile) {
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
              }
            }
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        clearAuthState();
        setIsAuthenticated(false);
      } else if (event === 'SIGNED_IN' && session) {
        checkAuth();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login page
    const redirectTo = requireAdmin ? "/admin-login" : "/temp-login";
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
