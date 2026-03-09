import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { MessageSquare, Plus } from 'lucide-react';
import { mockPosts, mockCommunities } from '../../data/mockData';

export default function Discussions() {
  const [searchParams] = useSearchParams();
  const communityFilter = searchParams.get('community');
  const [selectedCommunity, setSelectedCommunity] = useState(communityFilter || 'all');
  const [activeTab, setActiveTab] = useState('all');

  const filteredPosts = mockPosts.filter((post) => {
    const matchesCommunity = selectedCommunity === 'all' || post.communityId === selectedCommunity;
    const matchesTab = activeTab === 'all' || (activeTab === 'my-posts' && post.authorId === '1');
    return matchesCommunity && matchesTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discussions</h1>
          <p className="text-gray-600">Engage with your community</p>
        </div>
        <Link to="/discussions/create">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Select community" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Communities</SelectItem>
            {mockCommunities.map((community) => (
              <SelectItem key={community.id} value={community.id}>
                {community.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList>
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="my-posts">My Posts</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Link to={`/discussions/${post.id}`}>
                    <CardTitle className="hover:text-blue-600 cursor-pointer">
                      {post.title}
                    </CardTitle>
                  </Link>
                  <CardDescription className="mt-2">
                    {post.content}
                  </CardDescription>
                </div>
                <Badge variant={post.status === 'Open' ? 'default' : 'secondary'}>
                  {post.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="font-medium">{post.author}</span>
                <span>•</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  {post.category}
                </span>
                <span>•</span>
                <span>{post.communityName}</span>
                <span>•</span>
                <span>{post.timestamp}</span>
                <span className="ml-auto flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {post.commentCount}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No discussions found</p>
          <Link to="/discussions/create">
            <Button variant="link">Create the first post</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
