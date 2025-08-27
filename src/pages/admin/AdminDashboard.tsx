import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  Image, 
  Users, 
  Radio, 
  Plus, 
  Activity,
  TrendingUp,
  Eye,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { getTempUserProfile } from "@/integrations/supabase/tempUsers";
import TempUserAdminView from "@/components/TempUserAdminView";

interface DashboardStats {
  totalEvents: number;
  upcomingEvents: number;
  totalPhotos: number;
  featuredPhotos: number;
  totalUsers: number;
  adminUsers: number;
  isLiveStreamActive: boolean;
}

interface RecentEvent {
  id: string;
  title: string;
  event_date: string;
  is_featured: boolean;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    totalPhotos: 0,
    featuredPhotos: 0,
    totalUsers: 0,
    adminUsers: 0,
    isLiveStreamActive: false,
  });
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tempUserProfile, setTempUserProfile] = useState<any>(null);
  const [isTemporaryUser, setIsTemporaryUser] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Check if current user is a temporary user
      const tempProfile = await getTempUserProfile();
      if (tempProfile) {
        setTempUserProfile(tempProfile);
        setIsTemporaryUser(true);
        setLoading(false);
        return; // Don't fetch other data for temp users
      }

      // Fetch events stats
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      // Fetch gallery stats
      const { data: photos } = await supabase
        .from('gallery_photos')
        .select('*');

      // Fetch user stats
      const { data: users } = await supabase
        .from('user_profiles')
        .select('*');

      // Fetch admin users stats
      const { data: adminUsers } = await supabase
        .from('admin_users')
        .select('*');

      // Fetch live stream status
      const { data: liveStreamSettings } = await supabase
        .from('live_stream_settings')
        .select('is_live')
        .single();

      const now = new Date();
      const upcomingEvents = events?.filter(event => 
        new Date(event.event_date) >= now
      ) || [];

      const featuredPhotos = photos?.filter(photo => photo.is_featured) || [];

      setStats({
        totalEvents: events?.length || 0,
        upcomingEvents: upcomingEvents.length,
        totalPhotos: photos?.length || 0,
        featuredPhotos: featuredPhotos.length,
        totalUsers: users?.length || 0,
        adminUsers: adminUsers?.length || 0,
        isLiveStreamActive: liveStreamSettings?.is_live || false,
      });

      // Set recent events (last 5)
      setRecentEvents(events?.slice(0, 5) || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </AdminLayout>
    );
  }

  // If this is a temporary user, show the restricted admin creation view
  if (isTemporaryUser && tempUserProfile) {
    return (
      <div className="min-h-screen">
        <TempUserAdminView tempUserProfile={tempUserProfile} />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2 devanagari spiritual-gradient bg-clip-text text-transparent">
            स्वागत है प्रबंधन पैनल में
          </h1>
          <p className="text-muted-foreground">
            Welcome to the Admin Dashboard - Manage your ashram's digital presence
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="divine-shadow hover:glow-effect transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.upcomingEvents} upcoming
              </p>
            </CardContent>
          </Card>

          <Card className="divine-shadow hover:glow-effect transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gallery</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPhotos}</div>
              <p className="text-xs text-muted-foreground">
                {stats.featuredPhotos} featured
              </p>
            </CardContent>
          </Card>

          <Card className="divine-shadow hover:glow-effect transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.adminUsers} admins
              </p>
            </CardContent>
          </Card>

          <Card className="divine-shadow hover:glow-effect transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Stream</CardTitle>
              <Radio className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${stats.isLiveStreamActive ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm font-medium">
                  {stats.isLiveStreamActive ? 'LIVE' : 'OFFLINE'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Stream status
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="divine-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 devanagari">
                <Calendar className="h-5 w-5 text-primary" />
                <span>कार्यक्रम प्रबंधन</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground devanagari">
                नए कार्यक्रम जोड़ें और मौजूदा को संपादित करें
              </p>
              <div className="flex flex-col space-y-2">
                <Button size="sm" asChild className="spiritual-gradient border-0">
                  <Link to="/admin/events">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/admin/events">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Events
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="divine-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 devanagari">
                <Image className="h-5 w-5 text-primary" />
                <span>गैलरी प्रबंधन</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground devanagari">
                फोटो अपलोड करें और गैलरी व्यवस्थित करें
              </p>
              <div className="flex flex-col space-y-2">
                <Button size="sm" asChild className="spiritual-gradient border-0">
                  <Link to="/admin/gallery">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Photo
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/admin/gallery">
                    <Eye className="h-4 w-4 mr-2" />
                    View Gallery
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="divine-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 devanagari">
                <Users className="h-5 w-5 text-primary" />
                <span>यूज़र प्रबंधन</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground devanagari">
                एडमिन यूजर्स और अनुमतियां प्रबंधित करें
              </p>
              <div className="flex flex-col space-y-2">
                <Button size="sm" asChild className="spiritual-gradient border-0">
                  <Link to="/admin/users">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/admin/users">
                    <Eye className="h-4 w-4 mr-2" />
                    Manage Users
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="divine-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Events</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentEvents.length > 0 ? (
                <div className="space-y-3">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(event.event_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        {event.is_featured && (
                          <Badge className="spiritual-gradient border-0 text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent events found
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="divine-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>System Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Website Status</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Online
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Live Stream</span>
                  <Badge variant="secondary" className={stats.isLiveStreamActive ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}>
                    {stats.isLiveStreamActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Storage</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    Available
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Website Link */}
        <Card className="divine-shadow bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2 devanagari">आश्रम वेबसाइट देखें</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Visit the main website to see how your changes appear to visitors
            </p>
            <Button asChild className="spiritual-gradient border-0">
              <Link to="/">
                <Eye className="h-4 w-4 mr-2" />
                View Website
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
