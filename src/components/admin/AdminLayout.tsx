import { useState, useEffect, ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { 
  Home, 
  Calendar, 
  Image, 
  Users, 
  Radio, 
  Settings, 
  Menu, 
  LogOut, 
  ChevronLeft,
  Bell,
  Search,
  RefreshCw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getTempUserProfile } from "@/integrations/supabase/tempUsers";
import { useSessionManager } from "@/hooks/useSessionManager";
import { performCompleteLogout, clearAuthState } from "@/utils/logout";

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  labelHi: string;
  icon: typeof Home;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Initialize session management
  const { refreshSession } = useSessionManager();

  const navItems: NavItem[] = [
    { path: "/admin", label: "Dashboard", labelHi: "डैशबोर्ड", icon: Home },
    { path: "/admin/events", label: "Events", labelHi: "कार्यक्रम", icon: Calendar },
    { path: "/admin/gallery", label: "Gallery", labelHi: "गैलरी", icon: Image },
    { path: "/admin/live-stream", label: "Live Stream", labelHi: "लाइव स्ट्रीम", icon: Radio },
    { path: "/admin/users", label: "Users", labelHi: "यूज़र", icon: Users },
    { path: "/admin/settings", label: "Settings", labelHi: "सेटिंग्स", icon: Settings },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/admin-login");
        return;
      }

      // Check if user profile exists
      const { data: profiles, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id);

      let profile = null;
      
      if (profileError) {
        console.error('Profile fetch error:', profileError);
        await supabase.auth.signOut();
        navigate("/admin-login");
        return;
      }
      
      if (!profiles || profiles.length === 0) {
        console.log('No profile found for user, logging out');
        await supabase.auth.signOut();
        navigate("/admin-login");
        return;
      } else if (profiles.length > 1) {
        console.warn('Multiple profiles found, using the first admin/operator profile');
        // Find the first admin/operator profile
        profile = profiles.find(p => ['admin', 'super_admin', 'operator', 'temp_admin_creator'].includes(p.role)) || profiles[0];
      } else {
        profile = profiles[0];
      }

      // Allow admin, super_admin, operator, and temp_admin_creator roles
      if (!['admin', 'super_admin', 'operator', 'temp_admin_creator'].includes(profile?.role)) {
        await supabase.auth.signOut();
        navigate("/admin-login");
        return;
      }

      // Additional check for temporary users - verify not expired
      if (profile?.role === 'temp_admin_creator') {
        const tempProfile = await getTempUserProfile();
        if (!tempProfile) {
          await supabase.auth.signOut();
          navigate("/temp-login");
          return;
        }
      }

      setUserProfile(profile);
      setIsAuthLoading(false);
    };

    // Initial auth check
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log('User signed out or session expired, redirecting to login');
        setUserProfile(null);
        setIsAuthLoading(false);
        // Use replace: true to prevent back navigation to admin pages
        navigate("/admin-login", { replace: true });
        // Force page reload to clear all cached state
        setTimeout(() => {
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = "/admin-login";
          }
        }, 50);
        return;
      }
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed, session is still valid');
        // Session is still valid, continue
        return;
      }
      
      // For other events like SIGNED_IN, recheck auth
      if (event === 'SIGNED_IN') {
        checkAuth();
      }
    });

    // Set up a periodic session check (every 5 minutes)
    const sessionCheckInterval = setInterval(async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        console.log('Session check failed or expired, logging out');
        await supabase.auth.signOut();
        return;
      }
      
      // Check if session is close to expiring (within 5 minutes)
      const expiresAt = session.expires_at;
      const now = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = expiresAt - now;
      
      if (timeUntilExpiry < 300) { // 5 minutes
        console.log('Session expiring soon, attempting refresh');
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.log('Failed to refresh session, logging out');
          await supabase.auth.signOut();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Cleanup function
    return () => {
      subscription.unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // Clear user profile and loading state immediately
      setUserProfile(null);
      setIsAuthLoading(true);
      
      // Clear auth state immediately
      clearAuthState();
      
      // Show success message (will be brief due to reload)
      toast({
        title: "Logging out...",
        description: "Please wait while we log you out.",
      });
      
      // Perform complete logout (this will redirect and reload)
      await performCompleteLogout();
      
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even on error
      await performCompleteLogout();
    }
  };

  const goToWebsite = () => {
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="sm" className="fixed top-4 left-4 z-50">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 spiritual-gradient rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">॥</span>
                </div>
                <div>
                  <h3 className="font-bold devanagari text-primary">प्रबंधन पैनल</h3>
                  <p className="text-xs text-muted-foreground">Admin Panel</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    asChild
                    className="w-full justify-start"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link to={item.path} className="flex items-center space-x-3">
                      <Icon className="h-4 w-4" />
                      <div className="text-left">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground devanagari">{item.labelHi}</p>
                      </div>
                    </Link>
                  </Button>
                );
              })}
            </nav>

            <div className="p-4 border-t space-y-2">
              <Button variant="outline" size="sm" className="w-full" onClick={goToWebsite}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Website
              </Button>
              <Button variant="destructive" size="sm" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed left-0 top-0 h-full w-64 bg-card border-r border-border shadow-sm">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 spiritual-gradient rounded-full flex items-center justify-center">
                <span className="text-white font-bold">॥</span>
              </div>
              <div>
                <h3 className="font-bold devanagari text-primary">प्रबंधन पैनल</h3>
                <p className="text-xs text-muted-foreground">Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  asChild
                  className="w-full justify-start"
                >
                  <Link to={item.path} className="flex items-center space-x-3">
                    <Icon className="h-4 w-4" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground devanagari">{item.labelHi}</p>
                    </div>
                  </Link>
                </Button>
              );
            })}
          </nav>

          <div className="p-4 border-t space-y-2">
            <Button variant="outline" size="sm" className="w-full" onClick={goToWebsite}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Website
            </Button>
            <Button variant="destructive" size="sm" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
          <div className="flex h-16 items-center justify-between px-4 md:px-8">
            <div className="flex items-center space-x-4">
              <div className="md:hidden w-10" /> {/* Spacer for mobile menu button */}
              <div>
                <h1 className="text-lg font-semibold">
                  {navItems.find(item => isActive(item.path))?.label || "Dashboard"}
                </h1>
                <p className="text-xs text-muted-foreground devanagari">
                  {navItems.find(item => isActive(item.path))?.labelHi || "डैशबोर्ड"}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search..." 
                    className="pl-8 w-64"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={refreshSession}
                  title="Refresh session to extend login time"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="spiritual-gradient text-white text-xs">
                    {userProfile?.name?.charAt(0)?.toUpperCase() || "A"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-medium">{userProfile?.name || "Admin"}</p>
                  <p className="text-xs text-muted-foreground">
                    {userProfile?.role === 'super_admin' ? 'Main Administrator' :
                     userProfile?.role === 'operator' ? 'Operator' : 
                     userProfile?.role === 'temp_admin_creator' ? 'Temp Admin' : 'Administrator'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
