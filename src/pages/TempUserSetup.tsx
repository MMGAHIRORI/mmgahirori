import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { createTempUser } from "@/integrations/supabase/tempUsers";
import { toast } from "sonner";

const TempUserSetup = () => {
  const [formData, setFormData] = useState({
    name: "Sangam",
    email: "mmgahirori@gmail.com",
    password: "Admin@123",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCreated, setIsCreated] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await createTempUser(formData.email, formData.password, formData.name);
      setIsCreated(true);
      toast.success("Temporary user account created successfully!");
      
      // Redirect to temp user login after 2 seconds
      setTimeout(() => {
        navigate("/temp-login");
      }, 2000);
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create temporary user");
      console.error("Error creating temporary user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Account Created Successfully!</CardTitle>
            <CardDescription>
              Your temporary user account has been created. You will be redirected to login shortly.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> This temporary account expires in 24 hours and can only create one admin user.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Initial System Setup
          </CardTitle>
          <CardDescription className="text-gray-600">
            Create a temporary user account to set up your first admin user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>One-Time Setup:</strong> This temporary account will expire in 24 hours and can only create exactly one admin user with full system privileges.
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Username</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter username"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Temporary Account"
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h4 className="text-sm font-semibold text-yellow-800 mb-2">Account Details Preview:</h4>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• Username: {formData.name || "Not set"}</li>
              <li>• Email: {formData.email || "Not set"}</li>
              <li>• Role: Temporary Admin Creator</li>
              <li>• Expires: 24 hours after creation</li>
              <li>• Privilege: Can create exactly 1 admin user</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TempUserSetup;
