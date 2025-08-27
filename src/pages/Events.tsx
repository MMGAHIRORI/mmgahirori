import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import EventCard from "@/components/EventCard";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  image_url: string | null;
  event_type: string | null;
  is_featured: boolean;
}

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showUpcoming, setShowUpcoming] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, selectedType, showUpcoming]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        return;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (showUpcoming) {
      // Only show events that are today or in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
      filtered = filtered.filter(event => new Date(event.event_date) >= today);
    }

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(event => event.event_type === selectedType);
    }

    setFilteredEvents(filtered);
  };

  const eventTypes = [
    { value: 'katha', label: 'कथा', labelEn: 'Katha' },
    { value: 'bhagwat', label: 'भागवत', labelEn: 'Bhagwat' },
    { value: 'yagya', label: 'यज्ञ', labelEn: 'Yagya' },
    { value: 'other', label: 'अन्य', labelEn: 'Other' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 devanagari">
              आश्रम कार्यक्रम
            </h1>
            <p className="text-lg text-muted-foreground">Ashram Events</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg" />
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </CardContent>
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
            आश्रम कार्यक्रम
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Ashram Events - Sacred Gatherings and Spiritual Programs
          </p>
          <p className="text-muted-foreground devanagari max-w-2xl mx-auto">
            आध्यात्मिक कार्यक्रमों, कथाओं और यज्ञों की जानकारी प्राप्त करें
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="कार्यक्रम खोजें... (Search events)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedType(null);
                setShowUpcoming(true);
              }}
            >
              Clear Filters
            </Button>
          </div>

          {/* Filter Options */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={showUpcoming ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUpcoming(true)}
              className="devanagari"
            >
              <Calendar className="mr-2 h-4 w-4" />
              आगामी
            </Button>
            <Button
              variant={!showUpcoming ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUpcoming(false)}
              className="devanagari"
            >
              सभी
            </Button>
          </div>

          {/* Event Type Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedType === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(null)}
              className="devanagari"
            >
              सभी प्रकार
            </Button>
            {eventTypes.map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type.value)}
                className="devanagari"
              >
                {type.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event, index) => (
              <div key={event.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground devanagari mb-2">
                {showUpcoming ? "कोई आगामी कार्यक्रम नहीं है" : "कोई कार्यक्रम नहीं मिला"}
              </p>
              <p className="text-sm text-muted-foreground">
                {showUpcoming ? "No upcoming events found" : "No events found matching your criteria"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Event Count */}
        {filteredEvents.length > 0 && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              {filteredEvents.length} {showUpcoming ? "upcoming " : ""}event{filteredEvents.length !== 1 ? "s" : ""} found
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="divine-shadow max-w-md mx-auto">
            <CardContent className="p-6">
              <h3 className="font-semibold devanagari mb-2">कार्यक्रम की जानकारी</h3>
              <p className="text-sm text-muted-foreground devanagari mb-4">
                अधिक जानकारी के लिए आश्रम से संपर्क करें
              </p>
              <Button className="spiritual-gradient border-0">
                संपर्क करें
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Events;