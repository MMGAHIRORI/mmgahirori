import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Timer, AlertCircle, Shield, LogOut, User } from "lucide-react";
import { getTempUserProfile, checkTempUserExpiry } from "@/integrations/supabase/tempUsers";
import { supabase } from "@/integrations/supabase/client";
import AdminCreationForm from "./AdminCreationForm";
import { toast } from "sonner";

interface TempUserAdminViewProps {
  tempUserProfile: any;
}

const TempUserAdminView = ({ tempUserProfile }: TempUserAdminViewProps) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    updateTimeRemaining();
    
    // Set up interval to check expiry and update time remaining
    const interval = setInterval(() => {
      updateTimeRemaining();
      checkExpiry();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [tempUserProfile]);

  const updateTimeRemaining = () => {
    if (!tempUserProfile?.expires_at) return;
    
    const now = new Date();
    const expiresAt = new Date(tempUserProfile.expires_at);
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) {
      setTimeRemaining("Expired");
      setIsExpired(true);
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    setTimeRemaining(`${hours}h ${minutes}m remaining`);
  };

  const checkExpiry = async () => {
    const expired = await checkTempUserExpiry();
    if (expired) {
      setIsExpired(true);
      toast.error("Temporary user has expired");
      handleLogout();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/temp-login");
  };

  const handleAdminCreated = (adminData: { userId: string; email: string }) => {
    toast.success("Admin user created successfully! Temporary account is now disabled.");
    setTimeout(() => {
      handleLogout();
    }, 3000);
  };

  if (isExpired) {
    return (
      <div className="p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-red-800">Account Expired</CardTitle>
            <CardDescription>
              This temporary account has expired and can no longer be used.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Return to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Temporary User Status Header */}
      <Card className="mb-8 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Timer className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-orange-800">Temporary Admin Setup</CardTitle>
                <CardDescription className="text-orange-700">
                  Welcome, {tempUserProfile?.name} - Create your permanent admin account
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={isExpired ? "destructive" : "secondary"}>
                <Timer className="w-3 h-3 mr-1" />
                {timeRemaining}
              </Badge>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <User className="w-4 h-4 mr-2" />
              Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <Badge variant="outline">Temporary</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expires:</span>
                <span className="font-medium text-orange-600">{timeRemaining}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Admin Creation:</span>
                <Badge variant={tempUserProfile?.admin_created ? "destructive" : "default"}>
                  {tempUserProfile?.admin_created ? "Used" : "Available"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">System Access:</span>
                <Badge variant="destructive">Restricted</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Next Action</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {tempUserProfile?.admin_created 
                ? "Admin user has been created. This account is now disabled."
                : "Create your permanent admin user below to complete setup."
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Creation Section */}
      <div className="flex justify-center">
        {tempUserProfile?.admin_created ? (
          <Card className="w-full max-w-2xl border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader className="text-center">
              <CardTitle className="text-green-800">Setup Complete</CardTitle>
              <CardDescription className="text-green-700">
                The permanent admin user has been successfully created.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="border-green-200">
                <Shield className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  This temporary account has been automatically disabled. Use your new admin credentials to access the full system.
                </AlertDescription>
              </Alert>
              <div className="mt-4 text-center">
                <Button onClick={handleLogout} className="bg-green-600 hover:bg-green-700">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout and Use Admin Login
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full max-w-4xl">
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Restricted Access:</strong> As a temporary user, you can only create the permanent admin account. All other admin functions are disabled until you create and login with the admin user.
              </AlertDescription>
            </Alert>
            <AdminCreationForm onAdminCreated={handleAdminCreated} />
          </div>
        )}
      </div>

      {/* Help Section */}
      {!tempUserProfile?.admin_created && (
        <Card className="mt-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-lg">Setup Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Current Limitations:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Can only create one admin user</li>
                  <li>• No access to user management</li>
                  <li>• No access to content management</li>
                  <li>• No access to system settings</li>
                  <li>• Account expires in 24 hours</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">After Creating Admin:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Temporary account is automatically disabled</li>
                  <li>• Admin has full system privileges</li>
                  <li>• Access all admin dashboard features</li>
                  <li>• Manage users, content, and settings</li>
                  <li>• Create additional users as needed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TempUserAdminView;
