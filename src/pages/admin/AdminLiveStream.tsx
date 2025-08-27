import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Radio, Save, Play, Square, Eye, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";

interface LiveStreamSettings {
  id: string;
  is_live: boolean;
  stream_title: string | null;
  stream_description: string | null;
  youtube_embed_url: string | null;
  updated_at: string;
}

const AdminLiveStream = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [formData, setFormData] = useState({
    is_live: false,
    stream_title: "",
    stream_description: "",
    youtube_embed_url: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStreamSettings();
  }, []);

  const fetchStreamSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('live_stream_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setFormData({
          is_live: data.is_live || false,
          stream_title: data.stream_title || "",
          stream_description: data.stream_description || "",
          youtube_embed_url: data.youtube_embed_url || ""
        });
      }
    } catch (error) {
      console.error('Error fetching stream settings:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: existing } = await supabase
        .from('live_stream_settings')
        .select('id')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('live_stream_settings')
          .update(formData)
          .eq('id', existing.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('live_stream_settings')
          .insert([formData]);
        
        if (error) throw error;
      }

      toast({ 
        title: "Success", 
        description: "Live stream settings updated successfully" 
      });
      setHasChanges(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const extractYouTubeEmbedUrl = (url: string): string => {
    if (!url) return "";
    
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[7].length === 11) {
      return `https://www.youtube.com/embed/${match[7]}`;
    }
    
    // If already an embed URL, return as is
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    return url;
  };

  const handleYouTubeUrlChange = (url: string) => {
    const embedUrl = extractYouTubeEmbedUrl(url);
    handleInputChange('youtube_embed_url', embedUrl);
  };

  const toggleLiveStatus = () => {
    handleInputChange('is_live', !formData.is_live);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold devanagari">लाइव स्ट्रीम प्रबंधन</h1>
            <p className="text-muted-foreground">Manage live stream settings and status</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${formData.is_live ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium">
              {formData.is_live ? 'LIVE' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Live Status Toggle */}
        <Card className="divine-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Radio className="h-5 w-5" />
              <span>Stream Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  formData.is_live ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {formData.is_live ? (
                    <Play className="h-6 w-6 text-red-600" />
                  ) : (
                    <Square className="h-6 w-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">
                    {formData.is_live ? 'Stream is LIVE' : 'Stream is OFFLINE'}
                  </h3>
                  <p className="text-sm text-muted-foreground devanagari">
                    {formData.is_live ? 'स्ट्रीम चालू है' : 'स्ट्रीम बंद है'}
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.is_live}
                onCheckedChange={toggleLiveStatus}
                className="data-[state=checked]:bg-red-600"
              />
            </div>
            {formData.is_live && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-800">
                  Stream is currently visible to website visitors
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Stream Configuration */}
          <Card className="divine-shadow">
            <CardHeader>
              <CardTitle>Stream Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="stream_title">Stream Title</Label>
                  <Input
                    id="stream_title"
                    value={formData.stream_title}
                    onChange={(e) => handleInputChange('stream_title', e.target.value)}
                    placeholder="Daily Katha Live Stream"
                    className="devanagari"
                  />
                </div>

                <div>
                  <Label htmlFor="stream_description">Stream Description</Label>
                  <Textarea
                    id="stream_description"
                    value={formData.stream_description}
                    onChange={(e) => handleInputChange('stream_description', e.target.value)}
                    placeholder="Join us for our daily spiritual discourse..."
                    rows={4}
                    className="devanagari"
                  />
                </div>

                <div>
                  <Label htmlFor="youtube_url">YouTube URL</Label>
                  <Input
                    id="youtube_url"
                    value={formData.youtube_embed_url}
                    onChange={(e) => handleYouTubeUrlChange(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=VIDEO_ID or embed URL"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You can paste any YouTube URL format - it will be automatically converted to embed format
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading || !hasChanges}
                  className="w-full spiritual-gradient border-0 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{isLoading ? 'Saving...' : 'Save Settings'}</span>
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="divine-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Live Preview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${formData.is_live ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium">
                    {formData.is_live ? 'LIVE' : 'OFFLINE'}
                  </span>
                </div>

                {formData.stream_title && (
                  <div>
                    <h3 className="font-semibold text-lg devanagari">{formData.stream_title}</h3>
                  </div>
                )}

                {formData.stream_description && (
                  <div>
                    <p className="text-sm text-muted-foreground devanagari">{formData.stream_description}</p>
                  </div>
                )}

                {formData.youtube_embed_url ? (
                  <div className="aspect-video">
                    <iframe
                      src={formData.youtube_embed_url}
                      className="w-full h-full rounded-lg"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex flex-col items-center justify-center text-center p-4">
                    <Radio className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No stream URL configured</p>
                    <p className="text-xs text-muted-foreground devanagari">
                      स्ट्रीम URL कॉन्फ़िगर नहीं किया गया
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions & Tips */}
        <Card className="divine-shadow">
          <CardHeader>
            <CardTitle>Instructions & Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">How to Use</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• <strong>Stream Status:</strong> Toggle to show/hide the live stream on the website</p>
                  <p>• <strong>YouTube URL:</strong> Paste any YouTube URL - regular watch URLs will be automatically converted</p>
                  <p>• <strong>Stream Title:</strong> This will be displayed as the heading of the live stream section</p>
                  <p>• <strong>Description:</strong> Additional information about the current stream</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3 devanagari">उपयोग निर्देश</h4>
                <div className="space-y-2 text-sm text-muted-foreground devanagari">
                  <p>• <strong>स्ट्रीम स्थिति:</strong> वेबसाइट पर लाइव स्ट्रीम दिखाने/छुपाने के लिए टॉगल करें</p>
                  <p>• <strong>YouTube URL:</strong> कोई भी YouTube URL पेस्ट करें - यह स्वचालित रूप से बदल जाएगा</p>
                  <p>• <strong>स्ट्रीम शीर्षक:</strong> यह लाइव स्ट्रीम सेक्शन के शीर्षक के रूप में दिखाया जाएगा</p>
                  <p>• <strong>विवरण:</strong> वर्तमान स्ट्रीम के बारे में अतिरिक्त जानकारी</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="divine-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 spiritual-gradient rounded-full flex items-center justify-center mx-auto mb-3">
                <Play className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">Start Stream</h3>
              <p className="text-xs text-muted-foreground mb-3">Begin broadcasting to your audience</p>
              <Button 
                size="sm" 
                onClick={() => handleInputChange('is_live', true)}
                disabled={formData.is_live}
                className="w-full"
              >
                Go Live
              </Button>
            </CardContent>
          </Card>

          <Card className="divine-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <Square className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-1">Stop Stream</h3>
              <p className="text-xs text-muted-foreground mb-3">End the current broadcast</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleInputChange('is_live', false)}
                disabled={!formData.is_live}
                className="w-full"
              >
                Stop Stream
              </Button>
            </CardContent>
          </Card>

          <Card className="divine-shadow">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">Preview</h3>
              <p className="text-xs text-muted-foreground mb-3">View how it appears on website</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open('/', '_blank')}
                className="w-full"
              >
                View Website
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminLiveStream;
