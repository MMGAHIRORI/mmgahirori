import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, CheckCircle } from "lucide-react";
import { createAdminFromTempUser } from "@/integrations/supabase/tempUsers";
import { toast } from "sonner";

interface AdminCreationFormProps {
  onAdminCreated?: (adminData: { userId: string; email: string }) => void;
}

const AdminCreationForm = ({ onAdminCreated }: AdminCreationFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const adminData = await createAdminFromTempUser(
        formData.email, 
        formData.password, 
        formData.name
      );
      
      setIsCompleted(true);
      toast.success("Admin user created successfully!");
      
      if (onAdminCreated) {
        onAdminCreated(adminData);
      }
      
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create admin user");
      console.error("Error creating admin user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isCompleted) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Admin User Created Successfully!</CardTitle>
          <CardDescription className="text-lg">
            Your permanent admin user has been created with full system privileges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Shield className="h-4 w-4" />
            <AlertDescription className="text-center">
              <strong>Setup Complete:</strong> The temporary user account has been automatically disabled. You can now use the admin credentials to access the full system.
            </AlertDescription>
          </Alert>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Use the admin credentials to login to the system</li>
              <li>Access the admin dashboard with full privileges</li>
              <li>Configure additional system settings as needed</li>
              <li>Create additional users through the admin panel</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-800">
          Create Permanent Admin User
        </CardTitle>
        <CardDescription>
          Set up your permanent admin account with full system privileges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>One-Time Only:</strong> This will create your permanent admin user and automatically disable the temporary account. This action cannot be undone.
          </AlertDescription>
        </Alert>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter admin full name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter admin email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter secure password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={isLoading}
                minLength={8}
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Admin Privileges Include:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Full system administration access</li>
              <li>• User management and permissions</li>
              <li>• Content management (events, gallery)</li>
              <li>• System settings configuration</li>
              <li>• Live stream management</li>
            </ul>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Admin User...
              </>
            ) : (
              "Create Permanent Admin User"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminCreationForm;
