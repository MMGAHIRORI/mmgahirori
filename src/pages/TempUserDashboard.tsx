import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Timer, AlertCircle, User, LogOut, Shield } from "lucide-react";
import { getTempUserProfile, checkTempUserExpiry, disableExpiredTempUsers } from "@/integrations/supabase/tempUsers";
import { supabase } from "@/integrations/supabase/client";
import AdminCreationForm from "@/components/AdminCreationForm";
import { toast } from "sonner";

const TempUserDashboard = () => {
  const [tempUser, setTempUser] = useState<any>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTempUserData();
    
    // Set up interval to check expiry and update time remaining
    const interval = setInterval(() => {
      updateTimeRemaining();
      checkExpiry();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const loadTempUserData = async () => {
    try {
      const profile = await getTempUserProfile();
      if (!profile) {
        toast.error("No temporary user profile found");
        navigate("/temp-login");
        return;
      }
      
      setTempUser(profile);
      updateTimeRemaining(profile);
      
      const expired = await checkTempUserExpiry();
      if (expired) {
        setIsExpired(true);
        toast.error("Temporary user has expired");
      }
    } catch (error) {
      console.error("Error loading temp user data:", error);
      toast.error("Failed to load user data");
      navigate("/temp-login");
    } finally {
      setIsLoading(false);
    }
  };

  const updateTimeRemaining = (profile = tempUser) => {
    if (!profile) return;
    
    const now = new Date();
    const expiresAt = new Date(profile.expires_at);
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
      await disableExpiredTempUsers();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/temp-login");
  };

  const handleAdminCreated = (adminData: { userId: string; email: string }) => {
    toast.success("Admin user created! Redirecting to login...");
    setTimeout(() => {
      handleLogout();
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
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
            <p className="text-gray-600 mb-4">
              Please contact system administrator for assistance.
            </p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Timer className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Temporary User Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {tempUser?.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant={isExpired ? "destructive" : "secondary"}>
              {timeRemaining}
            </Badge>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Status Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Account Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Role:</span>
                  <Badge variant="outline">Temporary Admin Creator</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Admin Created:</span>
                  <Badge variant={tempUser?.admin_created ? "destructive" : "default"}>
                    {tempUser?.admin_created ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Remaining:</span>
                  <span className="font-medium text-orange-600">{timeRemaining}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Privileges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Read Access:</span>
                  <Badge variant="destructive">No</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Write Access:</span>
                  <Badge variant="destructive">No</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Create Admin:</span>
                  <Badge variant={tempUser?.admin_created ? "destructive" : "default"}>
                    {tempUser?.admin_created ? "Used" : "Available"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Creation Section */}
        <div className="flex justify-center">
          {tempUser?.admin_created ? (
            <Card className="w-full max-w-2xl">
              <CardHeader className="text-center">
                <CardTitle className="text-green-800">Admin User Already Created</CardTitle>
                <CardDescription>
                  This temporary account has already been used to create an admin user.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    The permanent admin user has been successfully created. This temporary account is now disabled and will be automatically removed when it expires.
                  </AlertDescription>
                </Alert>
                <div className="mt-4 text-center">
                  <Button onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Return to Login
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <AdminCreationForm onAdminCreated={handleAdminCreated} />
          )}
        </div>

        {/* Information Card */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Account Limitations:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Can only create one admin user</li>
                  <li>• No access to system content</li>
                  <li>• Expires automatically in 24 hours</li>
                  <li>• Cannot be renewed or extended</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">After Admin Creation:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Temporary account is disabled</li>
                  <li>• Admin has full system privileges</li>
                  <li>• Use admin credentials for future access</li>
                  <li>• Admin can create additional users</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TempUserDashboard;
