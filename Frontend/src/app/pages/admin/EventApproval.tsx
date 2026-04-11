import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
  createdAt: string;
}

export default function EventApproval() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showDeclineReason, setShowDeclineReason] = useState<string | null>(null);
  const [declineReasons, setDeclineReasons] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchPendingEvents();
  }, []);

  const fetchPendingEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await eventService.getPending();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load pending events';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error loading pending events:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (eventId: string) => {
    setProcessingId(eventId);
    try {
      await eventService.approve(eventId);
      toast.success('Event approved successfully');
      setEvents(events.filter(e => e._id !== eventId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to approve event';
      toast.error(errorMessage);
      console.error('Error approving event:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (eventId: string) => {
    const reason = declineReasons[eventId] || '';
    if (!reason.trim()) {
      toast.error('Please provide a reason for declining the event');
      return;
    }

    setProcessingId(eventId);
    try {
      await eventService.decline(eventId, reason);
      toast.success('Event declined successfully');
      setEvents(events.filter(e => e._id !== eventId));
      setShowDeclineReason(null);
      setDeclineReasons({ ...declineReasons, [eventId]: '' });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to decline event';
      toast.error(errorMessage);
      console.error('Error declining event:', err);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pending events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Event Approvals</h1>
        <p className="text-gray-600">Review and approve/decline student-created events</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <Button onClick={fetchPendingEvents} size="sm" className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {events.length === 0 && !error && (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">No pending events to review</p>
        </div>
      )}

      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event._id} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Pending
                    </Badge>
                  </div>
                  <CardDescription className="text-base">
                    by {event.organizer} in {event.communityName}
                  </CardDescription>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(event.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Event Description */}
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{event.description}</p>
              </div>

              {/* Event Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Time</p>
                      <p className="font-medium">{event.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Community</p>
                    <p className="font-medium">{event.communityName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Organizer</p>
                    <p className="font-medium">{event.organizer}</p>
                  </div>
                  {event.googleFormUrl && (
                    <div>
                      <p className="text-sm text-gray-600">Registration Form</p>
                      <a 
                        href={event.googleFormUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm truncate"
                      >
                        View Form
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Approval Actions */}
              <div className="border-t pt-4">
                {showDeclineReason === event._id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Decline Reason</label>
                      <Textarea
                        placeholder="Explain why this event is being declined..."
                        value={declineReasons[event._id] || ''}
                        onChange={(e) => setDeclineReasons({
                          ...declineReasons,
                          [event._id]: e.target.value
                        })}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDecline(event._id)}
                        disabled={processingId === event._id}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Confirm Decline
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setShowDeclineReason(null)}
                        disabled={processingId === event._id}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(event._id)}
                      disabled={processingId === event._id}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {processingId === event._id ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setShowDeclineReason(event._id)}
                      disabled={processingId === event._id}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
