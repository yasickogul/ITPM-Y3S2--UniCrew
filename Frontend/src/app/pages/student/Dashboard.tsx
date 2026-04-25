import { Link } from 'react-router';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, Calendar, MessageSquare, Plus } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { authService } from '../../services/api';

export default function Dashboard() {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState<any>({
    joinedCommunities: [],
    upcomingEvents: [],
    recentPosts: [],
    metrics: { joinedCommunities: 0, upcomingEvents: 0, myPosts: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await authService.getDashboard();
        setDashboardData(data);
      } catch {
        setDashboardData({
          joinedCommunities: [],
          upcomingEvents: [],
          recentPosts: [],
          metrics: { joinedCommunities: 0, upcomingEvents: 0, myPosts: 0 },
        });
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const joinedCommunities = dashboardData.joinedCommunities || [];
  const upcomingEvents = dashboardData.upcomingEvents || [];
  const recentPosts = dashboardData.recentPosts || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600">Here's what's happening in your communities</p>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Joined Communities</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : dashboardData.metrics.joinedCommunities}</div>
            <p className="text-xs text-gray-600">Active in your network</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : dashboardData.metrics.upcomingEvents}</div>
            <p className="text-xs text-gray-600">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Posts</CardTitle>
            <MessageSquare className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : dashboardData.metrics.myPosts}</div>
            <p className="text-xs text-gray-600">Total contributions</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link to="/discussions/create">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </Link>
        <Link to="/events/create">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Communities */}
        <Card>
          <CardHeader>
            <CardTitle>My Communities</CardTitle>
            <CardDescription>Communities you're part of</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {joinedCommunities.map((community: any) => (
              <div key={community._id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{community.name}</p>
                  <p className="text-sm text-gray-600">{community.members?.length || 0} members</p>
                </div>
                <Link to={`/communities/${community._id}`}>
                  <Button size="sm" variant="outline">View</Button>
                </Link>
              </div>
            ))}
            <Link to="/communities">
              <Button variant="link" className="w-full">View all communities →</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Don't miss out on these events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event: any) => (
              <div key={event._id} className="border-l-4 border-l-blue-600 pl-4">
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()} at {event.time}</p>
                <p className="text-xs text-gray-500">{event.communityName}</p>
              </div>
            ))}
            <Link to="/events">
              <Button variant="link" className="w-full">View all events →</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Discussions</CardTitle>
          <CardDescription>Latest posts from your communities</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentPosts.map((post: any) => (
            <Link key={post._id} to={`/discussions/${post._id}`}>
              <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium">{post.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{post.content}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    post.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {post.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{post.author}</span>
                  <span>•</span>
                  <span>{post.communityName}</span>
                  <span>•</span>
                  <span>{new Date(post.createdAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>{post.comments?.length || 0} comments</span>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
