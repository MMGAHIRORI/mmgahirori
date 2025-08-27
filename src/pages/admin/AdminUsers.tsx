import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createAdminUser, sendPasswordReset } from "@/integrations/supabase/adminUsers";
import { listAllProfiles, updateUserRole, updateUserPermissions, sendPasswordResetTo } from "@/integrations/supabase/users";
import { 
  Users, 
  Plus, 
  Mail, 
  KeyRound, 
  Search,
  Shield,
  UserCheck,
  UserX,
  Edit,
  Crown
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AdminLayout from "@/components/admin/AdminLayout";
import { getCurrentProfile } from "@/integrations/supabase/users";
import { setCurrentUserAsMainAdmin, checkIfMainAdminExists } from "@/utils/setMainAdmin";
import { fixAllExistingProfiles } from "@/utils/fixUserProfiles";

interface AdminUserRow {
  id: string;
  user_id: string;
  email: string;
  role: string | null;
  created_at: string;
}

interface ProfileRow {
  user_id: string;
  name: string;
  email: string;
  role: string;
  can_read: boolean;
  can_write: boolean;
  is_disabled: boolean;
  can_manage_events: boolean;
  can_manage_gallery: boolean;
  can_manage_livestream: boolean;
  can_edit_profile: boolean;
  can_manage_users: boolean;
  is_main_admin: boolean;
  created_by?: string;
  created_at: string;
}

const AdminUsers = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUserRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [currentUser, setCurrentUser] = useState<ProfileRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showMainAdminSetup, setShowMainAdminSetup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ 
    email: "", 
    password: "", 
    role: "admin",
    can_manage_events: true,
    can_manage_gallery: true,
    can_manage_livestream: true,
    can_edit_profile: true,
    can_manage_users: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminUsers();
    fetchProfiles();
    checkMainAdminStatus();
  }, []);
  
  const checkMainAdminStatus = async () => {
    try {
      const hasMainAdmin = await checkIfMainAdminExists();
      const current = await getCurrentProfile();
      
      setCurrentUser(current as ProfileRow);
      
      if (!hasMainAdmin && current) {
        setShowMainAdminSetup(true);
      }
    } catch (error) {
      console.error('Error checking main admin status:', error);
    }
  };
  
  const handleSetMainAdmin = async () => {
    try {
      await setCurrentUserAsMainAdmin();
      toast({
        title: "Success",
        description: "You have been set as the main administrator with full permissions"
      });
      setShowMainAdminSetup(false);
      fetchProfiles();
      checkMainAdminStatus();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchAdminUsers = async () => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setAdminUsers(data || []);
  };

  const fetchProfiles = async () => {
    try {
      const items = await listAllProfiles();
      setProfiles(items as any);
    } catch (e) {
      // ignore
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    setIsLoading(true);
    try {
      // Create user with enhanced permissions
      const permissions = formData.role === 'operator' ? {
        can_manage_events: formData.can_manage_events,
        can_manage_gallery: formData.can_manage_gallery,
        can_manage_livestream: formData.can_manage_livestream,
        can_edit_profile: formData.can_edit_profile
      } : undefined;
      
      const result = await createAdminUser(
        formData.email, 
        formData.password, 
        formData.role as 'admin' | 'operator' | 'user',
        permissions
      );
      
      console.log('User created successfully:', result);
      toast({ 
        title: "Success", 
        description: `${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)} user created successfully. They may need to verify their email to login.` 
      });
      setFormData({ 
        email: "", 
        password: "", 
        role: "admin",
        can_manage_events: true,
        can_manage_gallery: true,
        can_manage_livestream: true,
        can_edit_profile: true,
        can_manage_users: false
      });
      setShowForm(false);
      fetchAdminUsers();
      fetchProfiles();
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordReset(email);
      toast({ title: "Success", description: `Password reset link sent to ${email}` });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Main Admin Setup Dialog */}
        <Dialog open={showMainAdminSetup} onOpenChange={() => {}}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center devanagari">मुख्य व्यवस्थापक सेटअप</DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 spiritual-gradient rounded-full flex items-center justify-center mx-auto">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg devanagari">आपको मुख्य व्यवस्थापक बनाएं</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Set yourself as the main administrator with full control over user management and system settings.
                </p>
              </div>
              <Button 
                onClick={handleSetMainAdmin}
                className="w-full spiritual-gradient border-0"
              >
                <Crown className="h-4 w-4 mr-2" />
                Set as Main Admin
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold devanagari">यूज़र प्रबंधन</h1>
            <p className="text-muted-foreground">Manage users, roles, and permissions</p>
            {currentUser?.is_main_admin && (
              <Badge className="mt-2 spiritual-gradient border-0">
                <Crown className="h-3 w-3 mr-1" />
                Main Administrator
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={async () => {
                try {
                  await fixAllExistingProfiles();
                  toast({
                    title: "Success",
                    description: "All user profiles have been fixed"
                  });
                  fetchProfiles();
                } catch (error: any) {
                  toast({
                    title: "Error",
                    description: error.message,
                    variant: "destructive"
                  });
                }
              }}
              variant="outline"
              size="sm"
            >
              <Shield className="h-4 w-4 mr-2" />
              Fix Profiles
            </Button>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button className="spiritual-gradient border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="devanagari">नया यूज़र जोड़ें</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    required 
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Temporary Password *</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={formData.password} 
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                    required 
                    minLength={6}
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <select 
                    id="role" 
                    className="w-full px-3 py-2 border border-input rounded-md bg-background" 
                    value={formData.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      setFormData({ 
                        ...formData, 
                        role: newRole,
                        // Auto-set permissions based on role
                        can_manage_events: newRole === 'admin',
                        can_manage_gallery: newRole === 'admin',
                        can_manage_livestream: newRole === 'admin',
                        can_edit_profile: newRole === 'admin'
                      });
                    }}
                  >
                    <option value="admin">Administrator</option>
                    <option value="operator">Operator</option>
                    <option value="user">Normal User</option>
                  </select>
                </div>
                
                {/* Admin Permissions */}
                {formData.role === 'admin' && (
                  <div className="space-y-3">
                    <Label className="devanagari">एडमिन अनुमतियाँ (Admin Permissions)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.can_manage_users}
                          onChange={(e) => setFormData({ ...formData, can_manage_users: e.target.checked })}
                          className="rounded"
                        />
                        <span className="devanagari">यूज़र प्रबंधन (Manage Users)</span>
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground devanagari">
                      यूज़र प्रबंधन की अनुमति देकर दूसरे यूजर्स को control कर सकते हैं
                    </p>
                  </div>
                )}
                
                {/* Operator Permissions */}
                {formData.role === 'operator' && (
                  <div className="space-y-3">
                    <Label className="devanagari">ऑपरेटर अनुमतियाँ (Operator Permissions)</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.can_manage_events}
                          onChange={(e) => setFormData({ ...formData, can_manage_events: e.target.checked })}
                          className="rounded"
                        />
                        <span className="devanagari">कार्यक्रम प्रबंधन (Manage Events)</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.can_manage_gallery}
                          onChange={(e) => setFormData({ ...formData, can_manage_gallery: e.target.checked })}
                          className="rounded"
                        />
                        <span className="devanagari">गैलरी प्रबंधन (Manage Gallery)</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.can_manage_livestream}
                          onChange={(e) => setFormData({ ...formData, can_manage_livestream: e.target.checked })}
                          className="rounded"
                        />
                        <span className="devanagari">लाइव स्ट्रीम प्रबंधन (Manage Live Stream)</span>
                      </label>
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.can_edit_profile}
                          onChange={(e) => setFormData({ ...formData, can_edit_profile: e.target.checked })}
                          className="rounded"
                          disabled
                        />
                        <span className="devanagari text-muted-foreground">प्रोफ़ाइल संपादन (Edit Profile) - Operators cannot edit profile</span>
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground devanagari">
                      ऑपरेटर अपना प्रोफ़ाइल या पासवर्ड संपादित नहीं कर सकते
                    </p>
                  </div>
                )}
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" disabled={isLoading} className="spiritual-gradient border-0 flex-1">
                    {isLoading ? 'Creating...' : 'Create User'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  An email verification may be required before the user can login.
                </p>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="divine-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{profiles.length}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>
          <Card className="divine-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {profiles.filter(p => p.role === 'admin').length}
              </div>
              <div className="text-sm text-muted-foreground">Administrators</div>
            </CardContent>
          </Card>
          <Card className="divine-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {profiles.filter(p => p.role === 'operator').length}
              </div>
              <div className="text-sm text-muted-foreground">Operators</div>
            </CardContent>
          </Card>
          <Card className="divine-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {profiles.filter(p => p.is_disabled).length}
              </div>
              <div className="text-sm text-muted-foreground">Disabled Users</div>
            </CardContent>
          </Card>
          <Card className="divine-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {profiles.filter(p => p.can_write).length}
              </div>
              <div className="text-sm text-muted-foreground">Can Write</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="divine-shadow">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* All Users */}
        <Card className="divine-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>All Users</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? 'No users match your search criteria' : 'No users found'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProfiles.map((profile) => (
                  <div key={profile.user_id} className={`border rounded-lg p-4 ${
                    profile.is_main_admin ? 'border-primary bg-primary/5' : ''
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          profile.is_main_admin ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                          profile.role === 'admin' || profile.role === 'super_admin' ? 'spiritual-gradient' : 
                          'bg-secondary'
                        }`}>
                          {profile.is_main_admin ? (
                            <Crown className="h-5 w-5 text-white" />
                          ) : profile.role === 'admin' || profile.role === 'super_admin' ? (
                            <Shield className="h-5 w-5 text-white" />
                          ) : (
                            <Users className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium">{profile.name || 'Unnamed User'}</h3>
                            {profile.is_main_admin && (
                              <Badge className="text-xs bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0">
                                MAIN ADMIN
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
                          {profile.created_by && profile.created_by !== profile.user_id && (
                            <p className="text-xs text-muted-foreground">Created by admin</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            profile.role === 'super_admin' ? 'default' :
                            profile.role === 'admin' ? 'default' : 
                            profile.role === 'operator' ? 'default' : 
                            'secondary'
                          }
                          className={
                            profile.role === 'super_admin' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0' :
                            profile.role === 'admin' ? 'spiritual-gradient border-0' : 
                            profile.role === 'operator' ? 'bg-blue-600 hover:bg-blue-700' : 
                            ''
                          }
                        >
                          {profile.role === 'super_admin' ? 'Super Admin' :
                           profile.role === 'admin' ? 'Administrator' : 
                           profile.role === 'operator' ? 'Operator' : 'User'}
                        </Badge>
                        {profile.is_disabled && (
                          <Badge variant="destructive">Disabled</Badge>
                        )}
                      </div>
                    </div>

                    {/* Show controls only if not main admin */}
                    {!profile.is_main_admin ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                        <div>
                          <Label className="text-xs text-muted-foreground">Role</Label>
                          <select
                            className="w-full px-2 py-1 border rounded text-sm"
                            value={profile.role}
                            onChange={async (e) => {
                              try {
                                const newRole = e.target.value as 'user' | 'admin' | 'operator';
                                await updateUserRole(profile.user_id, newRole);
                                fetchProfiles();
                                toast({ title: 'Success', description: 'Role updated successfully' });
                              } catch (error: any) {
                                toast({ title: 'Error', description: error.message, variant: 'destructive' });
                              }
                            }}
                          >
                            <option value="user">User</option>
                            <option value="operator">Operator</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={profile.can_read}
                            onChange={async (e) => {
                              try {
                                await updateUserPermissions(profile.user_id, { can_read: e.target.checked });
                                fetchProfiles();
                                toast({ title: 'Updated', description: 'Read permission updated' });
                              } catch (error: any) {
                                toast({ title: 'Error', description: error.message, variant: 'destructive' });
                              }
                            }}
                            className="rounded"
                          />
                          <span>Read</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={profile.can_write}
                            onChange={async (e) => {
                              try {
                                await updateUserPermissions(profile.user_id, { can_write: e.target.checked });
                                fetchProfiles();
                                toast({ title: 'Updated', description: 'Write permission updated' });
                              } catch (error: any) {
                                toast({ title: 'Error', description: error.message, variant: 'destructive' });
                              }
                            }}
                            className="rounded"
                          />
                          <span>Write</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={profile.can_manage_events}
                            onChange={async (e) => {
                              try {
                                await updateUserPermissions(profile.user_id, { can_manage_events: e.target.checked });
                                fetchProfiles();
                                toast({ title: 'Updated', description: 'Events permission updated' });
                              } catch (error: any) {
                                toast({ title: 'Error', description: error.message, variant: 'destructive' });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="devanagari text-xs">कार्यक्रम</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={profile.can_manage_gallery}
                            onChange={async (e) => {
                              try {
                                await updateUserPermissions(profile.user_id, { can_manage_gallery: e.target.checked });
                                fetchProfiles();
                                toast({ title: 'Updated', description: 'Gallery permission updated' });
                              } catch (error: any) {
                                toast({ title: 'Error', description: error.message, variant: 'destructive' });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="devanagari text-xs">गैलरी</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={profile.can_manage_livestream}
                            onChange={async (e) => {
                              try {
                                await updateUserPermissions(profile.user_id, { can_manage_livestream: e.target.checked });
                                fetchProfiles();
                                toast({ title: 'Updated', description: 'Live stream permission updated' });
                              } catch (error: any) {
                                toast({ title: 'Error', description: error.message, variant: 'destructive' });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="devanagari text-xs">लाइव स्ट्रीम</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={profile.can_edit_profile}
                            onChange={async (e) => {
                              try {
                                await updateUserPermissions(profile.user_id, { can_edit_profile: e.target.checked });
                                fetchProfiles();
                                toast({ title: 'Updated', description: 'Profile edit permission updated' });
                              } catch (error: any) {
                                toast({ title: 'Error', description: error.message, variant: 'destructive' });
                              }
                            }}
                            className="rounded"
                            disabled={profile.role === 'operator'}
                          />
                          <span className="devanagari text-xs">प्रोफ़ाइल</span>
                        </label>
                        <label className="flex items-center space-x-2 text-sm">
                          <input
                            type="checkbox"
                            checked={profile.can_manage_users}
                            onChange={async (e) => {
                              try {
                                await updateUserPermissions(profile.user_id, { can_manage_users: e.target.checked });
                                fetchProfiles();
                                toast({ title: 'Updated', description: 'User management permission updated' });
                              } catch (error: any) {
                                toast({ title: 'Error', description: error.message, variant: 'destructive' });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="devanagari text-xs">यूज़र प्रबंधन</span>
                        </label>
                      </div>

                        <div>
                          <label className="flex items-center space-x-2 text-sm">
                            <input
                              type="checkbox"
                              checked={profile.is_disabled}
                              onChange={async (e) => {
                                try {
                                  await updateUserPermissions(profile.user_id, { is_disabled: e.target.checked });
                                  fetchProfiles();
                                  toast({ 
                                    title: e.target.checked ? 'User disabled' : 'User enabled',
                                    description: `User has been ${e.target.checked ? 'disabled' : 'enabled'}`
                                  });
                                } catch (error: any) {
                                  toast({ title: 'Error', description: error.message, variant: 'destructive' });
                                }
                              }}
                              className="rounded"
                            />
                            <span>Disabled</span>
                          </label>
                        </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await sendPasswordResetTo(profile.email, '/admin-login');
                              toast({ 
                                title: 'Success', 
                                description: `Password reset link sent to ${profile.email}` 
                              });
                            } catch (err: any) {
                              toast({ 
                                title: 'Failed', 
                                description: err.message, 
                                variant: 'destructive' 
                              });
                            }
                          }}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a href={`mailto:${profile.email}`}>
                            <Mail className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Crown className="h-5 w-5 text-yellow-600" />
                          <p className="text-sm font-medium text-yellow-800 devanagari">
                            मुख्य व्यवस्थापक खाता - संपादन योग्य नहीं
                          </p>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">
                          Main administrator account cannot be modified for security reasons.
                        </p>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-muted-foreground">
                      Created: {new Date(profile.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Users Section */}
        <Card className="divine-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Administrator Accounts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {adminUsers.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No administrator accounts found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {adminUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between border rounded-md p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 spiritual-gradient rounded-full flex items-center justify-center">
                        <Crown className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Role: {user.role || 'admin'} • Created: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleResetPassword(user.email)}
                      >
                        <KeyRound className="h-4 w-4 mr-1" />
                        Reset Password
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`mailto:${user.email}`}>
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
