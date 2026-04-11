import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Calendar, Clock, MapPin, ExternalLink, Edit, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
import { eventService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
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

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await eventService.getById(id);
      setEvent(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load event';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error loading event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !event) return;
    
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      setIsDeleting(true);
      await eventService.delete(id);
      toast.success('Event deleted successfully');
      navigate('/events');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete event';
      toast.error(errorMessage);
      console.error('Error deleting event:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error || 'Event not found'}</p>
        <Button onClick={() => navigate('/events')} size="sm" className="mt-2">
          Back to Events
        </Button>
      </div>
    );
  }

  const isOrganizer = user?._id === event.organizerId;
  const canEdit = isOrganizer && event.approvalStatus === "pending";
  const canDelete = isOrganizer && event.approvalStatus === "pending";

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
              <div className="flex items-center gap-2 mb-3">
                <Badge className="mb-3">{event.communityName}</Badge>
                <Badge className={getApprovalStatusColor(event.approvalStatus)}>
                  {event.approvalStatus === 'pending' ? 'Pending Approval' : event.approvalStatus === 'approved' ? 'Approved' : 'Declined'}
                </Badge>
              </div>
              <CardTitle className="text-3xl mb-4">{event.title}</CardTitle>
              <CardDescription className="text-base">
                Organized by {event.organizer}
              </CardDescription>
            </div>
            {isOrganizer && (
              <div className="flex gap-2">
                {canEdit && (
                  <Button variant="outline" size="sm" onClick={() => navigate(`/events/${id}/edit`)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                {canDelete && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Declined Status Alert */}
          {event.approvalStatus === 'declined' && event.declineReason && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800 mb-1">Event Declined</p>
                <p className="text-red-700 text-sm">{event.declineReason}</p>
              </div>
            </div>
          )}

          {/* Pending Status Alert */}
          {event.approvalStatus === 'pending' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                This event is awaiting university admin approval and is not yet visible to other students.
              </p>
            </div>
          )}

          {/* Event Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-gray-600">{new Date(event.date).toLocaleDateString()}</p>
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

            {/* Registration - Only show if event is approved */}
            {event.approvalStatus === 'approved' && event.googleFormUrl && (
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
            )}
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
              <div>
                <p className="text-gray-600">Status</p>
                <Badge variant="outline" className="mt-1">{event.status}</Badge>
              </div>
              <div>
                <p className="text-gray-600">Approval Status</p>
                <Badge variant="outline" className={`mt-1 ${getApprovalStatusColor(event.approvalStatus)}`}>
                  {event.approvalStatus === 'pending' ? 'Pending' : event.approvalStatus === 'approved' ? 'Approved' : 'Declined'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
