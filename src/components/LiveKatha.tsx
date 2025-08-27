import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Radio } from "lucide-react";

interface LiveStreamSettings {
  id: string;
  youtube_embed_url: string | null;
  is_live: boolean;
  stream_title: string | null;
  stream_description: string | null;
}

const LiveKatha = () => {
  const [streamSettings, setStreamSettings] = useState<LiveStreamSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreamSettings();
  }, []);

  const fetchStreamSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('live_stream_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching stream settings:', error);
        return;
      }

      setStreamSettings(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    
    // Convert YouTube watch URL to embed URL
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    }
    
    // Convert YouTube live URL to embed URL
    if (url.includes('youtube.com/live/')) {
      const videoId = url.split('/live/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`;
    }
    
    // If it's already an embed URL, return as is
    if (url.includes('youtube.com/embed/')) {
      return url;
    }
    
    return url;
  };

  if (loading) {
    return (
      <Card className="divine-shadow">
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Only show the live stream section if stream is actually live and has URL
  if (!streamSettings || !streamSettings.is_live || (!streamSettings.youtube_embed_url || streamSettings.youtube_embed_url.trim() === '')) {
    return null; // Don't render anything when not live
  }

  const embedUrl = getEmbedUrl(streamSettings.youtube_embed_url);

  return (
    <Card className="divine-shadow animate-fade-in-up">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 devanagari">
            <Radio className="h-5 w-5 text-primary" />
            <span>{streamSettings.stream_title || 'लाइव कथा'}</span>
          </CardTitle>
          {streamSettings.is_live && (
            <Badge variant="destructive" className="animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full mr-1" />
              LIVE
            </Badge>
          )}
        </div>
        {streamSettings.stream_description && (
          <p className="text-sm text-muted-foreground devanagari">
            {streamSettings.stream_description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="aspect-video w-full rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            title="Live Katha Stream"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveKatha;