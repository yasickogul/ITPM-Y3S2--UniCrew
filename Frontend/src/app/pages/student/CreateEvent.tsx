import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { eventService, communityService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';

interface Community {
  _id: string;
  name: string;
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    community: '',
    date: '',
    time: '',
    location: '',
    googleFormUrl: '',
    description: '',
  });

  useEffect(() => {
    fetchCommunities();
  }, []);

  const fetchCommunities = async () => {
    try {
      setIsLoadingCommunities(true);
      const data = await communityService.getAll();
      setCommunities(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load communities');
      console.error('Error loading communities:', error);
    } finally {
      setIsLoadingCommunities(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to create an event');
      navigate('/login');
      return;
    }

    const selectedCommunity = communities.find(c => c._id === formData.community);
    if (!selectedCommunity) {
      toast.error('Please select a valid community');
      return;
    }

    setIsLoading(true);
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        time: formData.time,
        location: formData.location,
        communityId: formData.community,
        communityName: selectedCommunity.name,
        organizer: user.name,
        organizerId: user._id,
        googleFormUrl: formData.googleFormUrl,
      };

      await eventService.create(eventData);
      toast.success('Event created successfully!');
      navigate('/events');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create event';
      toast.error(errorMessage);
      console.error('Error creating event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Event</h1>
          <p className="text-gray-600">Organize a workshop, meetup, or social event</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Detailssss</CardTitle>
          <CardDescription>Fill in the information for your event</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Events require university admin approval before they become visible to other students.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Hackathon 2026, ML Workshop"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>Community *</Label>
              <Select value={formData.community} onValueChange={(value) => setFormData({ ...formData, community: value })} disabled={isLoadingCommunities || isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCommunities ? "Loading communities..." : "Select community"} />
                </SelectTrigger>
                <SelectContent>
                  {communities.map((community) => (
                    <SelectItem key={community._id} value={community._id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Engineering Building, Room 101"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleForm">Google Form Registration URL</Label>
              <Input
                id="googleForm"
                type="url"
                placeholder="https://forms.google.com/..."
                value={formData.googleFormUrl}
                onChange={(e) => setFormData({ ...formData, googleFormUrl: e.target.value })}
                disabled={isLoading}
              />
              <p className="text-sm text-gray-600">
                Optional: Add a Google Form link for event registration
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your event, what to expect, who should attend..."
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600" disabled={isLoading || isLoadingCommunities}>
                {isLoading ? "Creating..." : "Create Event"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
