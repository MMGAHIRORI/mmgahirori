import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();
      if (profile?.role === 'admin' || profile?.role === 'super_admin' || profile?.role === 'operator' || profile?.role === 'temp_admin_creator') {
        navigate('/admin');
      }
    };
    
    checkUser();
    
    // Listen for auth state changes to handle automatic redirects
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        checkUser();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sign in existing user only (signup removed)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (data.session) {
        // First, check if profile exists
        const { data: profiles, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', data.session.user.id);

        // Debug logging
        console.log('Login Debug - User ID:', data.session.user.id);
        console.log('Login Debug - Profiles found:', profiles);
        console.log('Login Debug - Profile Error:', profileError);
        
        let profile = null;
        
        if (profileError) {
          console.error('Profile fetch error:', profileError);
          await supabase.auth.signOut();
          throw new Error(`Profile fetch failed: ${profileError.message}`);
        }
        
        if (!profiles || profiles.length === 0) {
          // No profile found - create one for this user
          console.log('No profile found, creating default profile...');
          
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert({
              user_id: data.session.user.id,
              email: data.session.user.email,
              name: data.session.user.email?.split('@')[0] || 'User',
              role: 'user', // Default role
              can_read: true,
              can_write: false,
              is_disabled: false,
              can_manage_events: false,
              can_manage_gallery: false,
              can_manage_livestream: false,
              can_edit_profile: false,
              can_manage_users: false,
              is_main_admin: false
            })
            .select()
            .single();
            
          if (createError) {
            console.error('Failed to create profile:', createError);
            await supabase.auth.signOut();
            throw new Error(`Failed to create user profile: ${createError.message}`);
          }
          
          profile = newProfile;
        } else if (profiles.length > 1) {
          // Multiple profiles found - use the first one
          console.warn('Multiple profiles found, using the first one');
          profile = profiles[0];
        } else {
          // Single profile found - perfect
          profile = profiles[0];
        }

        if (profile?.role === 'admin') {
          toast({ title: "Login Successful", description: "Welcome to admin panel" });
          navigate('/admin');
        } else if (profile?.role === 'super_admin') {
          toast({ title: "Login Successful", description: "Welcome, Main Administrator" });
          navigate('/admin');
        } else if (profile?.role === 'operator') {
          toast({ title: "Login Successful", description: "Welcome to operator panel" });
          navigate('/admin');
        } else if (profile?.role === 'temp_admin_creator') {
          toast({ title: "Login Successful", description: "Welcome to temporary admin setup" });
          navigate('/admin');
        } else {
          console.log('Access denied - Profile role:', profile?.role);
          await supabase.auth.signOut();
          throw new Error(`Access denied: Invalid role '${profile?.role}'. Admin or operator privileges required.`);
        }
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20 flex items-center justify-center px-4">
      <Card className="w-full max-w-md divine-shadow">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 spiritual-gradient rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold devanagari spiritual-gradient bg-clip-text text-transparent">
            प्रबंधन लॉगिन
          </CardTitle>
          <p className="text-muted-foreground">Admin & Operator Login</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
                placeholder="admin@maharshi.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full spiritual-gradient border-0"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Admin and operator access only. Contact the administrator if you need access.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;