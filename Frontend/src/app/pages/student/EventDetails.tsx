import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Calendar, Clock, MapPin, ExternalLink, Edit, Trash2, ArrowLeft } from 'lucide-react';
import { mockEvents } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    return <div>Event not found</div>;
  }

  const isOrganizer = user?.id === event.organizerId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Badge className="mb-3">{event.communityName}</Badge>
              <CardTitle className="text-3xl mb-4">{event.title}</CardTitle>
              <CardDescription className="text-base">
                Organized by {event.organizer}
              </CardDescription>
            </div>
            {isOrganizer && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                  Cancel Event
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-gray-600">{event.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Time</p>
                  <p className="text-gray-600">{event.time}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-gray-600">{event.location}</p>
                </div>
              </div>
            </div>

            {/* Registration */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg">Register for Event</CardTitle>
                <CardDescription>
                  Secure your spot by filling out the registration form
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a href={event.googleFormUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Registration Form
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">About this Event</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Additional Info */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Event Details</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Community</p>
                <p className="font-medium">{event.communityName}</p>
              </div>
              <div>
                <p className="text-gray-600">Organizer</p>
                <p className="font-medium">{event.organizer}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
