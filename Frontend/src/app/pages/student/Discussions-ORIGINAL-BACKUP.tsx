import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Plus, MessageSquare, Mail, Share2, MessageCircle, Send as SendIcon, Link as LinkIcon, Edit3, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { mockCommunities } from '../../data/mockData';
import { mockPosts } from '../../data/mockData';

type DiscussionPost = {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  communityId: string;
  communityName: string;
  category: string;
  status: string;
  timestamp: string;
  comments?: number;
  likes?: number;
};

const getCurrentUserId = () => localStorage.getItem('userId') || 'test-user';

const stripHtml = (input: string) => input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export default function Discussions() {
  const [searchParams] = useSearchParams();
  const communityFilter = searchParams.get('community');
  const [selectedCommunity, setSelectedCommunity] = useState(communityFilter || 'all');
  const [activeTab, setActiveTab] = useState('all');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  const currentUserId = useMemo(() => getCurrentUserId(), []);

  const posts: DiscussionPost[] = mockPosts.map((post) => ({
    ...post,
    communityName: mockCommunities.find(c => c.id === post.communityId)?.name || 'Unknown',
  }));

  const filteredPosts = posts.filter((post) => {
    const matchesCommunity = selectedCommunity === 'all' || post.communityId === selectedCommunity;
    const matchesTab = activeTab === 'all' || (activeTab === 'my-posts' && post.authorId === currentUserId);
    return matchesCommunity && matchesTab;
  });

  const toggleLike = (postId: string) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  const handleShare = (postTitle: string, platform: 'copy' | 'whatsapp' | 'telegram' | 'email') => {
    const url = window.location.href;
    const text = `Check out this discussion: ${postTitle}`;

    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success(`Link copied!`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(postTitle)}&body=${encodeURIComponent(text + '\n' + url)}`, '_blank');
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discussions</h1>
          <p className="text-gray-600">Engage with your community</p>
        </div>
        <Link to="/discussions/create">
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-200 transition-all border-none rounded-xl h-11 px-6">
            <Plus className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
          <SelectTrigger className="w-full sm:w-64 bg-white border-none shadow-sm rounded-xl h-11">
            <SelectValue placeholder="Select community" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none shadow-xl">
            <SelectItem value="all">All Communities</SelectItem>
            {mockCommunities.map((community) => (
              <SelectItem key={community.id} value={community.id}>
                {community.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="bg-gray-100/50 p-1 rounded-xl h-11">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
              All Posts
            </TabsTrigger>
            <TabsTrigger value="my-posts" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">
              My Posts
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6">
        {filteredPosts.map((post) => {
          const isLiked = likedPosts.has(post.id);
          const plainContent = stripHtml(post.content);

          return (
            <Card key={post.id} className="group border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 rounded-[1.5rem] overflow-hidden bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link to={`/discussions/${post.id}`}>
                      <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-indigo-600 transition-colors cursor-pointer leading-tight">
                        {post.title}
                      </CardTitle>
                    </Link>
                    <CardDescription className="mt-3 text-gray-600 line-clamp-2 text-sm leading-relaxed">
                      {plainContent || 'No content'}
                    </CardDescription>
                  </div>
                  <div className={`px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase shadow-sm ${
                    post.status === 'Open'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  }`}>
                    {post.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                    <span className="text-gray-900 font-bold">{post.author}</span>
                    <span>|</span>
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-bold border border-indigo-100 shadow-sm">
                      {post.category}
                    </span>
                    <span>|</span>
                    <span>{post.communityName}</span>
                    <span>|</span>
                    <span>{post.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2 border-t border-gray-50 pt-3 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleLike(post.id)}
                      className={`flex-1 sm:flex-none h-10 gap-2 rounded-xl transition-all ${
                        isLiked
                          ? 'text-rose-500 bg-rose-50 hover:bg-rose-100 hover:text-rose-600'
                          : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                      </svg>
                      {isLiked ? 'Liked' : 'Like'} ({post.likes || 0})
                    </Button>
                    <Link to={`/discussions/${post.id}`} className="flex-1 sm:flex-none">
                      <Button variant="ghost" size="sm" className="w-full h-10 gap-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">
                        <MessageSquare className="w-4 h-4" />
                        Comment ({post.comments || 0})
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-10 gap-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all">
                          <Share2 className="w-4 h-4" />
                          Share
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl border-none shadow-xl p-1">
                        <DropdownMenuItem onClick={() => handleShare(post.title, 'copy')} className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg hover:bg-indigo-50">
                          <LinkIcon className="w-4 h-4 text-indigo-500" />
                          <span>Copy Link</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(post.title, 'whatsapp')} className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg hover:bg-green-50">
                          <MessageCircle className="w-4 h-4 text-green-500" />
                          <span>WhatsApp</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(post.title, 'telegram')} className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg hover:bg-blue-50">
                          <SendIcon className="w-4 h-4 text-blue-500" />
                          <span>Telegram</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(post.title, 'email')} className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg hover:bg-gray-100">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span>Email</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

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
    </div>
  );
}
