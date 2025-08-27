import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface GalleryPhoto {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  category: string | null;
  is_featured: boolean;
  show_on_home_page: boolean;
  display_order: number;
}

const Gallery = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    filterPhotos();
  }, [photos, searchTerm, selectedCategory]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching photos:', error);
        return;
      }

      setPhotos(data || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(
        (data || [])
          .map(photo => photo.category)
          .filter(Boolean) as string[]
      )];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPhotos = () => {
    let filtered = photos;

    if (searchTerm) {
      filtered = filtered.filter(photo =>
        photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(photo => photo.category === selectedCategory);
    }

    setFilteredPhotos(filtered);
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'ashram': 'आश्रम',
      'events': 'कार्यक्रम',
      'katha': 'कथा',
      'yagya': 'यज्ञ',
      'festivals': 'त्योहार',
      'saints': 'संत',
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 devanagari">
              आश्रम गैलरी
            </h1>
            <p className="text-lg text-muted-foreground">Ashram Gallery</p>
          </div>
          
          <div className="gallery-grid">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 devanagari spiritual-gradient bg-clip-text text-transparent">
            आश्रम गैलरी
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Ashram Gallery - Capturing Divine Moments
          </p>
          <p className="text-muted-foreground devanagari max-w-2xl mx-auto">
            आश्रम की पवित्र गतिविधियों, कार्यक्रमों और दिव्य क्षणों की झलक
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="खोजें... (Search photos)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory(null);
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="devanagari"
            >
              सभी
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="devanagari"
              >
                {getCategoryLabel(category)}
              </Button>
            ))}
          </div>
        </div>

        {/* Photo Gallery */}
        {filteredPhotos.length > 0 ? (
          <div className="gallery-grid">
            {filteredPhotos.map((photo, index) => (
              <Dialog key={photo.id}>
                <DialogTrigger asChild>
                  <Card className="gallery-item cursor-pointer group animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <CardContent className="p-0 relative">
                      <div className="aspect-square overflow-hidden rounded-lg">
                        <img
                          src={photo.image_url}
                          alt={photo.title || "Gallery Image"}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 rounded-lg flex items-end">
                        <div className="p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          {photo.is_featured && (
                            <Badge className="mb-2 spiritual-gradient border-0">
                              <Heart className="w-3 h-3 mr-1" />
                              विशेष
                            </Badge>
                          )}
                          {photo.title && (
                            <h3 className="font-semibold devanagari mb-1">
                              {photo.title}
                            </h3>
                          )}
                          {photo.category && (
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryLabel(photo.category)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                
                <DialogContent className="max-w-4xl max-h-[90vh] p-0">
                  <VisuallyHidden>
                    <DialogTitle>{photo.title || "Gallery Photo"}</DialogTitle>
                    <DialogDescription>
                      {photo.description || "View gallery photo in full size"}
                    </DialogDescription>
                  </VisuallyHidden>
                  <div className="relative">
                    <img
                      src={photo.image_url}
                      alt={photo.title || "Gallery Image"}
                      className="w-full h-auto max-h-[80vh] object-contain"
                    />
                    {(photo.title || photo.description) && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                        {photo.title && (
                          <h3 className="text-lg font-semibold devanagari mb-2">
                            {photo.title}
                          </h3>
                        )}
                        {photo.description && (
                          <p className="text-sm devanagari">
                            {photo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {photo.is_featured && (
                            <Badge className="spiritual-gradient border-0">
                              <Heart className="w-3 h-3 mr-1" />
                              विशेष
                            </Badge>
                          )}
                          {photo.category && (
                            <Badge variant="secondary">
                              {getCategoryLabel(photo.category)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <p className="text-muted-foreground devanagari mb-2">
                कोई फोटो नहीं मिली
              </p>
              <p className="text-sm text-muted-foreground">
                No photos found matching your criteria
              </p>
            </CardContent>
          </Card>
        )}

        {/* Photo Count */}
        {filteredPhotos.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              {filteredPhotos.length} photos{selectedCategory && ` in ${getCategoryLabel(selectedCategory)}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;