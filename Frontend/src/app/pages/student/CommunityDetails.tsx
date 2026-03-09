import { useParams, Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Users, MessageSquare, Calendar, UserPlus } from 'lucide-react';
import { mockCommunities, mockStudents } from '../../data/mockData';
import { useState } from 'react';

export default function CommunityDetails() {
  const { id } = useParams();
  const community = mockCommunities.find((c) => c.id === id);
  const [isJoined, setIsJoined] = useState(true);

  if (!community) {
    return <div>Community not found</div>;
  }

  const members = mockStudents.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div 
        className="h-48 rounded-xl bg-cover bg-center relative"
        style={{ backgroundImage: `url(${community.banner})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h1 className="text-3xl font-bold">{community.name}</h1>
          <p className="text-sm opacity-90">{community.memberCount} members</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <Button
          onClick={() => setIsJoined(!isJoined)}
          className={isJoined ? '' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}
          variant={isJoined ? 'outline' : 'default'}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {isJoined ? 'Leave Community' : 'Join Community'}
        </Button>
        <Link to={`/discussions?community=${id}`}>
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Discussions
          </Button>
        </Link>
        <Link to={`/chat/${id}`}>
          <Button variant="outline">
            <MessageSquare className="w-4 h-4 mr-2" />
            Open Chat
          </Button>
        </Link>
        <Link to={`/events?community=${id}`}>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            View Events
          </Button>
        </Link>
      </div>

      {/* Description and Members */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Description */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{community.description}</p>
            <div className="mt-6 flex gap-4">
              <div>
                <p className="text-sm text-gray-600">Faculty</p>
                <p className="font-medium">{community.faculty}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Year Level</p>
                <p className="font-medium">{community.year === 'All Years' ? 'All Years' : `Year ${community.year}`}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Members
            </CardTitle>
            <CardDescription>{community.memberCount} total members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((member) => (
              <Link key={member.id} to={`/students/${member.id}`}>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                  <Avatar>
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.name}</p>
                    <p className="text-xs text-gray-600 truncate">{member.degree}</p>
                  </div>
                </div>
              </Link>
            ))}
            <Button variant="link" className="w-full">
              View all members →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest discussions and events in this community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <p className="font-medium">New discussion: Algorithm study group forming</p>
              <p className="text-sm text-gray-600 mt-1">Posted by John Doe • 2 hours ago</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="font-medium">Event: Hackathon 2026 registration open</p>
              <p className="text-sm text-gray-600 mt-1">Scheduled for March 15, 2026</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
