import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Settings, 
  Save, 
  Database, 
  Shield,
  Palette,
  Globe,
  Bell,
  Info,
  HelpCircle,
  Download,
  Upload,
  Trash2
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

const AdminSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate saving settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold devanagari">सेटिंग्स</h1>
            <p className="text-muted-foreground">Configure system preferences and settings</p>
          </div>
          <Button onClick={handleSave} disabled={isLoading} className="spiritual-gradient border-0">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save All'}
          </Button>
        </div>

        {/* Website Settings */}
        <Card className="divine-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Website Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="site_title">Website Title</Label>
                <Input
                  id="site_title"
                  defaultValue="श्री महर्षि मंगल गिरि आश्रम"
                  className="devanagari"
                />
              </div>
              <div>
                <Label htmlFor="site_subtitle">Subtitle</Label>
                <Input
                  id="site_subtitle"
                  defaultValue="Shree Maharshi Mangal Giri Ashram"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="site_description">Website Description</Label>
              <Input
                id="site_description"
                defaultValue="आध्यात्मिक ज्ञान और शांति का केंद्र"
                className="devanagari"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  defaultValue="+91 9580094376"
                />
              </div>
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  defaultValue="mmgahirori@gmail.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                defaultValue="महर्षि मंगल गिरि आश्रम, अहिरोरी हरदोई 241121"
                className="devanagari"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="divine-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-5 w-5" />
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Dark Mode</Label>
                <p className="text-xs text-muted-foreground">Enable dark theme for the admin panel</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Compact Layout</Label>
                <p className="text-xs text-muted-foreground">Use a more compact layout for better space utilization</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Show Hindi Text</Label>
                <p className="text-xs text-muted-foreground devanagari">हिंदी पाठ प्रदर्शित करें</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="divine-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                <p className="text-xs text-muted-foreground">Add an extra layer of security to admin accounts</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto Logout</Label>
                <p className="text-xs text-muted-foreground">Automatically logout after 30 minutes of inactivity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Login Notifications</Label>
                <p className="text-xs text-muted-foreground">Send email notifications for new admin logins</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="pt-4">
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Change Admin Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="divine-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive notifications for new events, registrations, etc.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Browser push notifications for urgent alerts</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Weekly Reports</Label>
                <p className="text-xs text-muted-foreground">Weekly activity summary reports</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="divine-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="flex flex-col items-center space-y-2 p-4 h-auto">
                <Download className="h-6 w-6" />
                <span>Export Data</span>
                <span className="text-xs text-muted-foreground">Download all data as JSON</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 p-4 h-auto">
                <Upload className="h-6 w-6" />
                <span>Import Data</span>
                <span className="text-xs text-muted-foreground">Upload data from file</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center space-y-2 p-4 h-auto text-destructive">
                <Trash2 className="h-6 w-6" />
                <span>Clear Cache</span>
                <span className="text-xs text-muted-foreground">Clear all cached data</span>
              </Button>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800">Backup Recommendation</span>
              </div>
              <p className="text-sm text-yellow-700">
                It's recommended to backup your data regularly. Use the Export Data feature to download a complete backup.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card className="divine-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>System Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Version</Label>
                <p className="font-medium">1.0.0</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Updated</Label>
                <p className="font-medium">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Database Status</Label>
                <p className="font-medium text-green-600">Connected</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Storage Used</Label>
                <p className="font-medium">45 MB / 1 GB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card className="divine-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="h-5 w-5" />
              <span>Help & Support</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Quick Links</h4>
                <div className="space-y-2 text-sm">
                  <a href="#" className="block text-primary hover:underline">User Documentation</a>
                  <a href="#" className="block text-primary hover:underline">Video Tutorials</a>
                  <a href="#" className="block text-primary hover:underline">Keyboard Shortcuts</a>
                  <a href="#" className="block text-primary hover:underline">API Documentation</a>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 devanagari">सहायता लिंक</h4>
                <div className="space-y-2 text-sm devanagari">
                  <a href="#" className="block text-primary hover:underline">उपयोगकर्ता गाइड</a>
                  <a href="#" className="block text-primary hover:underline">वीडियो ट्यूटोरियल</a>
                  <a href="#" className="block text-primary hover:underline">सामान्य प्रश्न</a>
                  <a href="#" className="block text-primary hover:underline">तकनीकी सहायता</a>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Need help? Contact our support team at{" "}
                <a href="mailto:support@ashram.com" className="text-primary hover:underline">
                  support@ashram.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
