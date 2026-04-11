import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Users, FileCheck, Flag, MessageSquare, Calendar } from 'lucide-react';
import { eventService } from '../../services/api';
import { mockPendingPosts, mockReportedPosts, mockCommunities } from '../../data/mockData';
import { toast } from 'sonner';

export default function UniversityDashboard() {
  const [pendingEventsCount, setPendingEventsCount] = useState(0);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  useEffect(() => {
    fetchPendingEventsCount();
  }, []);

  const fetchPendingEventsCount = async () => {
    try {
      setIsLoadingEvents(true);
      const events = await eventService.getPending();
      setPendingEventsCount(Array.isArray(events) ? events.length : 0);
    } catch (error) {
      console.error('Error fetching pending events:', error);
      setPendingEventsCount(0);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">University Admin Dashboard</h1>
        <p className="text-gray-600">Manage your university's collaboration platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Events</CardTitle>
            <Calendar className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingEventsCount}</div>
            <p className="text-xs text-gray-600">Awaiting approval</p>
            <Link to="/university-admin/events/approval" className="mt-2">
              <Button size="sm" variant="outline" className="w-full">Review Events</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Posts</CardTitle>
            <FileCheck className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPendingPosts.length}</div>
            <p className="text-xs text-gray-600">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reported Posts</CardTitle>
            <Flag className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockReportedPosts.length}</div>
            <p className="text-xs text-gray-600">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Communities</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCommunities.length}</div>
            <p className="text-xs text-gray-600">Active communities</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Post Approvals</CardTitle>
            <CardDescription>Posts waiting for review</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockPendingPosts.slice(0, 3).map((post) => (
              <div key={post.id} className="p-4 border rounded-lg">
                <p className="font-medium">{post.title}</p>
                <p className="text-sm text-gray-600 mt-1">
                  by {post.author} in {post.community}
                </p>
                <p className="text-xs text-gray-500 mt-1">{post.timestamp}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Content flagged by students</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockReportedPosts.map((report) => (
              <div key={report.id} className="p-4 border rounded-lg border-l-4 border-l-red-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{report.postTitle}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Reported by {report.reportedBy}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Reason: {report.reason}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    report.aiSeverity === 'High' 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {report.aiSeverity}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Community Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Active Communities</CardTitle>
          <CardDescription>Overview of your university's communities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockCommunities.map((community) => (
              <div key={community.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{community.name}</p>
                  <p className="text-sm text-gray-600">{community.faculty}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{community.memberCount}</p>
                  <p className="text-xs text-gray-600">members</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
