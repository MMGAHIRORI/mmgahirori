import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Star, 
  Upload,
  X,
  Eye,
  Grid,
  List
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AdminLayout from "@/components/admin/AdminLayout";

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

const AdminGallery = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [filteredPhotos, setFilteredPhotos] = useState<GalleryPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    category: "",
    is_featured: false,
    show_on_home_page: false,
    display_order: 0
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const categories = [
    { value: 'katha', label: 'कथा (Katha)' },
    { value: 'yagya', label: 'यज्ञ (Yagya)' },
    { value: 'festivals', label: 'त्योहार (Festivals)' },
    { value: 'ashram', label: 'आश्रम (Ashram)' },
    { value: 'saints', label: 'संत (Saints)' },
    { value: 'daily', label: 'दैनिक (Daily)' },
    { value: 'other', label: 'अन्य (Other)' },
  ];

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    const filtered = photos.filter(photo => {
      const matchesSearch = !searchTerm || 
        photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        photo.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !selectedCategory || photo.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
    setFilteredPhotos(filtered);
  }, [photos, searchTerm, selectedCategory]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch photos",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setUploadPreview(previewUrl);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setUploadPreview(null);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('gallery-photos')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('gallery-photos')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let imageUrl = formData.image_url;

      // Upload new file if selected
      if (selectedFile) {
        imageUrl = await uploadFile(selectedFile);
      }

      const photoData = {
        ...formData,
        image_url: imageUrl
      };

      if (editingPhoto) {
        const { error } = await supabase
          .from('gallery_photos')
          .update(photoData)
          .eq('id', editingPhoto.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Photo updated successfully" });
      } else {
        if (!imageUrl) {
          throw new Error("Please select a photo to upload");
        }
        
        const { error } = await supabase
          .from('gallery_photos')
          .insert([photoData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Photo added successfully" });
      }

      resetForm();
      fetchPhotos();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save photo",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (photo: GalleryPhoto) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title || "",
      description: photo.description || "",
      image_url: photo.image_url,
      category: photo.category || "",
      is_featured: photo.is_featured,
      show_on_home_page: photo.show_on_home_page,
      display_order: photo.display_order
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const { error } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Success", description: "Photo deleted successfully" });
      fetchPhotos();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      category: "",
      is_featured: false,
      show_on_home_page: false,
      display_order: 0
    });
    setEditingPhoto(null);
    setShowForm(false);
    setSelectedFile(null);
    setUploadPreview(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold devanagari">गैलरी प्रबंधन</h1>
            <p className="text-muted-foreground">Manage gallery photos and collections</p>
          </div>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="spiritual-gradient border-0">
                <Plus className="h-4 w-4 mr-2" />
                Add Photo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="devanagari">
                  {editingPhoto ? 'फोटो संपादित करें' : 'नई फोटो जोड़ें'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="photo_upload">Upload Photo *</Label>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Input
                        id="photo_upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="flex-1"
                      />
                      {selectedFile && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={removeSelectedFile}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
                    {uploadPreview && (
                      <div className="relative w-full max-w-xs">
                        <img
                          src={uploadPreview}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-md border"
                        />
                      </div>
                    )}
                    {editingPhoto && !selectedFile && (
                      <div className="relative w-full max-w-xs">
                        <img
                          src={formData.image_url}
                          alt="Current photo"
                          className="w-full h-32 object-cover rounded-md border"
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          Current photo (upload new to replace)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Photo title..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Photo description..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div>
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_featured"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="rounded border-input"
                      />
                      <Label htmlFor="is_featured" className="devanagari">
                        विशेष फोटो (Featured Photo)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="show_on_home_page"
                        checked={formData.show_on_home_page}
                        onChange={(e) => setFormData({ ...formData, show_on_home_page: e.target.checked })}
                        className="rounded border-input"
                      />
                      <Label htmlFor="show_on_home_page" className="devanagari">
                        होम पेज पर दिखाएं (Show on Home Page)
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" disabled={isLoading} className="spiritual-gradient border-0">
                    {isLoading ? 'Saving...' : editingPhoto ? 'Update Photo' : 'Add Photo'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card className="divine-shadow">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search photos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background min-w-[150px]"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="border-0 rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="border-0 rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photos Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <Card key={photo.id} className="divine-shadow hover:glow-effect transition-all duration-300 overflow-hidden">
                <div className="relative group">
                  <img
                    src={photo.image_url}
                    alt={photo.title || "Gallery photo"}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/placeholder.svg";
                    }}
                  />
                  {photo.is_featured && (
                    <div className="absolute top-2 right-2">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(photo)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => handleDelete(photo.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-3">
                  {photo.title && (
                    <h3 className="font-medium text-sm mb-1 truncate">{photo.title}</h3>
                  )}
                  {photo.category && (
                    <Badge variant="secondary" className="text-xs mb-1">
                      {categories.find(c => c.value === photo.category)?.label || photo.category}
                    </Badge>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Order: {photo.display_order}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPhotos.map((photo) => (
              <Card key={photo.id} className="divine-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={photo.image_url}
                      alt={photo.title || "Gallery photo"}
                      className="w-16 h-16 object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.svg";
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{photo.title || "Untitled"}</h3>
                        {photo.is_featured && (
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        )}
                      </div>
                      {photo.category && (
                        <Badge variant="secondary" className="text-xs mb-2">
                          {categories.find(c => c.value === photo.category)?.label || photo.category}
                        </Badge>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Order: {photo.display_order}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(photo)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDelete(photo.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredPhotos.length === 0 && (
          <Card className="divine-shadow">
            <CardContent className="text-center py-12">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No photos found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedCategory ? 'No photos match your search criteria' : 'Start by uploading your first photo'}
              </p>
              {!searchTerm && !selectedCategory && (
                <Button onClick={() => setShowForm(true)} className="spiritual-gradient border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="divine-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{photos.length}</div>
              <div className="text-sm text-muted-foreground">Total Photos</div>
            </CardContent>
          </Card>
          <Card className="divine-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {photos.filter(p => p.is_featured).length}
              </div>
              <div className="text-sm text-muted-foreground">Featured Photos</div>
            </CardContent>
          </Card>
          <Card className="divine-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {new Set(photos.map(p => p.category).filter(Boolean)).size}
              </div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </CardContent>
          </Card>
          <Card className="divine-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{filteredPhotos.length}</div>
              <div className="text-sm text-muted-foreground">Filtered Results</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminGallery;
