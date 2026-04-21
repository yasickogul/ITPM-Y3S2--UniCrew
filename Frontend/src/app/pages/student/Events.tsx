import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Calendar, Clock, MapPin, Plus, ExternalLink } from 'lucide-react';
import { eventService } from '../../services/api';
import { toast } from 'sonner';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  communityId: string;
  communityName: string;
  organizer: string;
  organizerId: string;
  googleFormUrl?: string;
  status: string;
  approvalStatus: "pending" | "approved" | "declined";
  declineReason?: string;
}

export default function Events() {
  const [searchParams] = useSearchParams();
  const communityFilter = searchParams.get('community');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await eventService.getAll();
      setEvents(Array.isArray(response) ? response : []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load events';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error loading events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = communityFilter
    ? events.filter((event) => event.communityId === communityFilter)
    : events;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-gray-600">Discover upcoming workshops, hackathons, and meetups</p>
        </div>
        <Link to="/events/create">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <Button onClick={fetchEvents} size="sm" className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {/* View Toggle */}
      {!isLoading && (
        <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'calendar')}>
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4 mt-6">
            {filteredEvents.map((event) => (
              <Card key={event._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        <Badge variant={event.approvalStatus === 'pending' ? 'outline' : event.approvalStatus === 'approved' ? 'default' : 'destructive'}>
                          {event.approvalStatus === 'pending' ? 'Pending' : event.approvalStatus === 'approved' ? 'Approved' : 'Declined'}
                        </Badge>
                      </div>
                      <CardDescription className="mt-2">
                        {event.description}
                      </CardDescription>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Link to={`/events/${event._id}`}>
                        <Button size="sm" variant="outline">View Details</Button>
                      </Link>
                      {event.approvalStatus === 'approved' && event.googleFormUrl && (
                        <a href={event.googleFormUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 w-full">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Register
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline">{event.communityName}</Badge>
                    <span className="text-gray-600">Organized by {event.organizer}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Events Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {/* Calendar Header */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center font-medium text-sm text-gray-600 p-2">
                      {day}
                    </div>
                  ))}

                  {/* Calendar Days */}
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 2;
                    const isValid = day >= 1 && day <= 31;

                    return (
                      <div
                        key={i}
                        className={`
                          min-h-20 p-2 border rounded
                          ${isValid ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'}
                        `}
                      >
                        {isValid && <div className="font-medium text-sm">{day}</div>}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {!isLoading && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No upcoming events</p>
        </div>
      )}
    </div>
  );
}
