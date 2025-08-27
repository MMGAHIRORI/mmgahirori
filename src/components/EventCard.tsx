import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";

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

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const eventDate = new Date(event.event_date);
  const isUpcoming = eventDate > new Date();
  
  const getEventTypeColor = (type: string | null) => {
    switch (type) {
      case 'katha':
        return 'bg-blue-100 text-blue-800';
      case 'bhagwat':
        return 'bg-orange-100 text-orange-800';
      case 'yagya':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeLabel = (type: string | null) => {
    switch (type) {
      case 'katha':
        return 'कथा';
      case 'bhagwat':
        return 'भागवत';
      case 'yagya':
        return 'यज्ञ';
      default:
        return 'कार्यक्रम';
    }
  };

  return (
    <Card className="gallery-item divine-shadow hover:glow-effect">
      {event.image_url && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg devanagari line-clamp-2">
            {event.title}
          </CardTitle>
          {event.is_featured && (
            <Badge variant="secondary" className="ml-2 spiritual-gradient text-white">
              विशेष
            </Badge>
          )}
        </div>
        {event.event_type && (
          <Badge className={getEventTypeColor(event.event_type)} variant="outline">
            {getEventTypeLabel(event.event_type)}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{format(eventDate, 'dd MMMM yyyy')}</span>
          </div>
          {event.event_time && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              <span>{event.event_time}</span>
            </div>
          )}
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="devanagari">महर्षि मंगल गिरि आश्रम</span>
          </div>
        </div>
        {event.description && (
          <p className="text-sm text-muted-foreground devanagari line-clamp-3">
            {event.description}
          </p>
        )}
        {isUpcoming && (
          <Badge variant="outline" className="mt-3 text-green-600 border-green-600">
            आगामी कार्यक्रम
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;