import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Phone, Mail, ArrowRight, Heart, ImageIcon } from "lucide-react";
import LiveKatha from "@/components/LiveKatha";
import EventCard from "@/components/EventCard";
import { supabase } from "@/integrations/supabase/client";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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

interface HomePagePhoto {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  category: string | null;
}
const Home = () => {
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [homePagePhotos, setHomePagePhotos] = useState<HomePagePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [photosLoading, setPhotosLoading] = useState(true);
  
  useEffect(() => {
    fetchUpcomingEvents();
    fetchHomePagePhotos();
  }, []);
  
  const fetchUpcomingEvents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const {
        data,
        error
      } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', today) // Only events today or in the future
        .order('event_date', {
          ascending: true
        })
        .limit(6); // Show up to 6 upcoming events
        
      if (error) {
        console.error('Error fetching events:', error);
        return;
      }
      setUpcomingEvents(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchHomePagePhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('id, title, description, image_url, category')
        .eq('show_on_home_page', true)
        .order('display_order', { ascending: true })
        .limit(8); // Show up to 8 photos on home page
        
      if (error) {
        console.error('Error fetching home page photos:', error);
        return;
      }
      setHomePagePhotos(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setPhotosLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="absolute inset-0 spiritual-gradient opacity-10" />
        <div className="relative max-w-4xl mx-auto">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 devanagari spiritual-gradient bg-clip-text text-transparent mx-0 py-[11px]">
              श्री महर्षि मंगल गिरि आश्रम
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Shree Maharshi Mangal Giri Ashram
            </p>
            <p className="text-lg devanagari text-muted-foreground mb-8 max-w-2xl mx-auto">
              आध्यात्मिक ज्ञान और शांति का केंद्र, जहाँ भक्तों को दिव्य आशीर्वाद प्राप्त होता है
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="spiritual-gradient border-0">
                <Link to="/events">
                  <Calendar className="mr-2 h-5 w-5" />
                  आगामी कार्यक्रम
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/gallery">
                  आश्रम गैलरी
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Katha Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <LiveKatha />
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 devanagari">
              आगामी कार्यक्रम
            </h2>
            <p className="text-lg text-muted-foreground">
              Upcoming Events
            </p>
          </div>
          
          {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                  </CardContent>
                </Card>)}
            </div> : upcomingEvents.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {upcomingEvents.map((event, index) => <div key={event.id} className="animate-fade-in-up" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                  <EventCard event={event} />
                </div>)}
            </div> : <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground devanagari mb-2">
                  वर्तमान में कोई आगामी कार्यक्रम नहीं है
                </p>
                <p className="text-sm text-muted-foreground">
                  No upcoming events at the moment
                </p>
              </CardContent>
            </Card>}
          
          <div className="text-center">
            <Button variant="outline" size="lg" asChild>
              <Link to="/events">
                सभी कार्यक्रम देखें
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Home Page Gallery Section */}
      {homePagePhotos.length > 0 && (
        <section className="py-12 px-4 bg-card">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 devanagari">
                आश्रम गैलरी
              </h2>
              <p className="text-lg text-muted-foreground">
                Ashram Gallery
              </p>
              <p className="text-muted-foreground devanagari max-w-2xl mx-auto">
                आश्रम की पवित्र गतिविधियों की झलक
              </p>
            </div>
            
            {photosLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-lg" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {homePagePhotos.map((photo, index) => (
                  <Dialog key={photo.id}>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer group animate-scale-in overflow-hidden" style={{
                        animationDelay: `${index * 0.05}s`
                      }}>
                        <CardContent className="p-0 relative">
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={photo.image_url}
                              alt={photo.title || "Gallery Image"}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                            />
                          </div>
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end">
                            <div className="p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                              {photo.title && (
                                <h3 className="font-semibold devanagari text-sm mb-1">
                                  {photo.title}
                                </h3>
                              )}
                              {photo.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {photo.category}
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
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
            
            <div className="text-center">
              <Button variant="outline" size="lg" asChild>
                <Link to="/gallery">
                  पूरी गैलरी देखें
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 devanagari">
            श्री महर्षि मंगल गिरि सेवा समिति
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <Card className="divine-shadow">
              <CardHeader>
                <CardTitle className="devanagari">हमारा उद्देश्य</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground devanagari">
                  आध्यात्मिक जागृति और सामाजिक कल्याण के लिए समर्पित यह आश्रम भक्तों को 
                  शांति और ज्ञान का मार्ग दिखाता है।
                </p>
              </CardContent>
            </Card>
            <Card className="divine-shadow">
              <CardHeader>
                <CardTitle className="devanagari">सेवाएं</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground devanagari">
                  <li>• नियमित कथा और भजन</li>
                  <li>• यज्ञ और हवन</li>
                  <li>• आध्यात्मिक परामर्श</li>
                  <li>• सामुदायिक सेवा</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="divine-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl devanagari">संपर्क करें</CardTitle>
              <p className="text-muted-foreground">Contact Us</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium devanagari">पता</p>
                      <p className="text-sm text-muted-foreground">महर्षि मंगल गिरि आश्रम, अहिरोरी हरदोई 241121</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium devanagari">फोन</p>
                      <p className="text-sm text-muted-foreground">+91 9580094376</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium devanagari">ईमेल</p>
                      <p className="text-sm text-muted-foreground">mmgahirori@gmail.com</p>
                    </div>
                  </div>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-sm text-muted-foreground devanagari mb-4">
                    आध्यात्मिक मार्गदर्शन के लिए आश्रम में आपका स्वागत है
                  </p>
                  <Button className="spiritual-gradient border-0">
                    मार्गदर्शन प्राप्त करें
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />
    </div>;
};
export default Home;