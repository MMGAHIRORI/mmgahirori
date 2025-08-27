import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cleanupPastEvents } from "@/lib/eventCleanup";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Star, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AdminLayout from "@/components/admin/AdminLayout";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  event_type: string | null;
  image_url: string | null;
  is_featured: boolean;
}

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    event_type: "",
    image_url: "",
    is_featured: false
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const filtered = events.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.event_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [events, searchTerm]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(formData)
          .eq('id', editingEvent.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Event updated successfully" });
      } else {
        const { error } = await supabase
          .from('events')
          .insert([formData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Event created successfully" });
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save event",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || "",
      event_date: event.event_date.split('T')[0],
      event_time: event.event_time || "",
      event_type: event.event_type || "",
      image_url: event.image_url || "",
      is_featured: event.is_featured
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast({ title: "Success", description: "Event deleted successfully" });
      fetchEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      event_date: "",
      event_time: "",
      event_type: "",
      image_url: "",
      is_featured: false
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const eventTypes = [
    { value: 'katha', label: 'कथा (Katha)' },
    { value: 'bhagwat', label: 'भागवत (Bhagwat)' },
    { value: 'yagya', label: 'यज्ञ (Yagya)' },
    { value: 'festival', label: 'त्योहार (Festival)' },
    { value: 'puja', label: 'पूजा (Puja)' },
    { value: 'other', label: 'अन्य (Other)' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold devanagari">कार्यक्रम प्रबंधन</h1>
            <p className="text-muted-foreground">Manage ashram events and programs</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={async () => {
                if (confirm('This will delete all past events. Are you sure?')) {
                  const result = await cleanupPastEvents();
                  if (result.error) {
                    toast({ 
                      title: "Error", 
                      description: result.error, 
                      variant: "destructive" 
                    });
                  } else {
                    toast({ 
                      title: "Cleanup Complete", 
                      description: `${result.deletedCount} past events were removed` 
                    });
                    fetchEvents();
                  }
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cleanup Past Events
            </Button>
            <Dialog open={showForm} onOpenChange={setShowForm}>
              <DialogTrigger asChild>
                <Button className="spiritual-gradient border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="devanagari">
                  {editingEvent ? 'कार्यक्रम संपादित करें' : 'नया कार्यक्रम जोड़ें'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      placeholder="श्रीमद्भागवत कथा"
                    />
                  </div>
                  <div>
                    <Label htmlFor="event_type">Event Type</Label>
                    <select
                      id="event_type"
                      value={formData.event_type}
                      onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    >
                      <option value="">Select type</option>
                      {eventTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="event_date">Date *</Label>
                    <Input
                      id="event_date"
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="event_time">Time</Label>
                    <Input
                      id="event_time"
                      type="time"
                      value={formData.event_time}
                      onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Event details and information..."
                  />
                </div>
                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded border-input"
                  />
                  <Label htmlFor="is_featured" className="devanagari">
                    विशेष कार्यक्रम (Featured Event)
                  </Label>
                </div>
                <div className="flex space-x-2 pt-4">
                  <Button type="submit" disabled={isLoading} className="spiritual-gradient border-0">
                    {isLoading ? 'Saving...' : editingEvent ? 'Update Event' : 'Create Event'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search */}
        <Card className="divine-shadow">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="divine-shadow hover:glow-effect transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                      <span>{event.title}</span>
                      {event.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      )}
                    </CardTitle>
                    {event.event_type && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {eventTypes.find(t => t.value === event.event_type)?.label || event.event_type}
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(event)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleDelete(event.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{new Date(event.event_date).toLocaleDateString()}</span>
                  {event.event_time && (
                    <>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{event.event_time}</span>
                    </>
                  )}
                </div>
                
                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {event.description}
                  </p>
                )}
                
                {event.image_url && (
                  <div className="mt-3">
                    <img
                      src={event.image_url}
                      alt={event.title}
                      className="w-full h-32 object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.event_date) >= new Date() ? (
                      <Badge className="bg-green-100 text-green-800">Upcoming</Badge>
                    ) : (
                      <Badge variant="secondary">Past</Badge>
                    )}
                  </div>
                  {event.is_featured && (
                    <Badge className="spiritual-gradient border-0 text-xs">
                      Featured
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <Card className="divine-shadow">
            <CardContent className="text-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'No events match your search criteria' : 'Start by creating your first event'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowForm(true)} className="spiritual-gradient border-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="divine-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{events.length}</div>
              <div className="text-sm text-muted-foreground">Total Events</div>
            </CardContent>
          </Card>
          <Card className="divine-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {events.filter(e => new Date(e.event_date) >= new Date()).length}
              </div>
              <div className="text-sm text-muted-foreground">Upcoming Events</div>
            </CardContent>
          </Card>
          <Card className="divine-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">
                {events.filter(e => e.is_featured).length}
              </div>
              <div className="text-sm text-muted-foreground">Featured Events</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;
