import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Timer } from "lucide-react";
import { loginTempUser } from "@/integrations/supabase/tempUsers";
import { toast } from "sonner";

const TempUserLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
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
      await loginTempUser(formData.email, formData.password);
      toast.success("Login successful! Redirecting to Admin Dashboard...");
      navigate("/admin");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Timer className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Temporary User Login
          </CardTitle>
          <CardDescription className="text-gray-600">
            Login with your temporary account to create the system admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Limited Access:</strong> This account can only create one admin user and expires in 24 hours.
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
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
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
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
                  Logging in...
                </>
              ) : (
                "Login to Temporary Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate("/temp-setup")}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Need to create a temporary account? Set up here
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TempUserLogin;
