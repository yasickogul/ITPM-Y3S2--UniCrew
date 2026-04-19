import { useEffect, useMemo, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Plus, MessageSquare, Mail, Share2, MessageCircle, Send as SendIcon, Link as LinkIcon } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { mockCommunities, mockPosts } from '../../data/mockData';
import { discussionAPI } from '../../../services/discussionAPI';
import { Input } from '../../components/ui/input';

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
  comments: Array<{
    id: string;
    author?: string;
    authorId?: string;
    content?: string;
    timestamp?: string;
  }>;
  likes: number;
  likedBy: string[];
};

type ApiDiscussion = {
  _id?: string;
  id?: string;
  title?: string;
  content?: string;
  author?: string;
  authorId?: string;
  communityId?: string;
  communityName?: string;
  category?: string;
  status?: string;
  createdAt?: string;
  timestamp?: string;
  comments?: Array<any>;
  likes?: number;
  likedBy?: string[];
};

type SortMode = 'latest' | 'oldest' | 'most-liked' | 'most-commented';
type FeedSource = 'api' | 'fallback' | 'mixed';

const getCurrentUserId = () => localStorage.getItem('userId') || 'test-user';
const isMongoObjectId = (value: string) => /^[0-9a-fA-F]{24}$/.test(value);

const stripHtml = (input: string) => input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const toRelativeTime = (dateString?: string) => {
  if (!dateString) return 'Just now';

  const createdAt = new Date(dateString);
  if (Number.isNaN(createdAt.getTime())) return dateString;

  const diffMs = Date.now() - createdAt.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return createdAt.toLocaleDateString();
};

const mapApiDiscussionToPost = (entry: ApiDiscussion): DiscussionPost => ({
  id: entry._id || entry.id || '',
  title: entry.title || '',
  content: entry.content || '',
  author: entry.author || 'Anonymous',
  authorId: entry.authorId || '',
  communityId: entry.communityId || '',
  communityName: entry.communityName || 'Unknown Community',
  category: entry.category || 'General',
  status: entry.status || 'Open',
  timestamp: toRelativeTime(entry.createdAt || entry.timestamp),
  comments: Array.isArray(entry.comments)
    ? entry.comments.map((comment: any) => ({
        id: comment?._id || comment?.id || '',
        author: comment?.author,
        authorId: comment?.authorId,
        content: comment?.content,
        timestamp: toRelativeTime(comment?.timestamp),
      }))
    : [],
  likes: Number(entry.likes || 0),
  likedBy: Array.isArray(entry.likedBy) ? entry.likedBy : [],
});

const mapLocalDiscussionToPost = (entry: any): DiscussionPost => ({
  id: entry.id || '',
  title: entry.title || '',
  content: entry.content || '',
  author: entry.author || 'Anonymous',
  authorId: entry.authorId || '',
  communityId: entry.communityId || '',
  communityName: entry.communityName || 'Unknown Community',
  category: entry.category || 'General',
  status: entry.status || 'Open',
  timestamp: entry.timestamp || toRelativeTime(entry.createdAt),
  comments: Array.isArray(entry.comments)
    ? entry.comments.map((comment: any) => ({
        id: comment.id || comment._id || '',
        author: comment.author,
        authorId: comment.authorId,
        content: comment.content,
        timestamp: comment.timestamp || toRelativeTime(comment.createdAt),
      }))
    : [],
  likes: Number(entry.likes || 0),
  likedBy: Array.isArray(entry.likedBy) ? entry.likedBy : [],
});

const getFallbackPosts = (currentUserId: string): DiscussionPost[] => {
  const localPosts = JSON.parse(localStorage.getItem('newPosts') || '[]');
  const localLiked = JSON.parse(localStorage.getItem('likedPosts') || '{}');
  const basePosts = [...localPosts, ...mockPosts];

  const seen = new Set<string>();
  const merged = basePosts
    .map((entry) => {
      const mapped = mapLocalDiscussionToPost(entry);
      const likedEntry = localLiked[mapped.id];

      if (likedEntry?.isLiked && !mapped.likedBy.includes(currentUserId)) {
        mapped.likedBy = [...mapped.likedBy, currentUserId];
      }
      if (typeof likedEntry?.count === 'number') {
        mapped.likes = likedEntry.count;
      }

      return mapped;
    })
    .filter((post) => {
      if (!post.id || seen.has(post.id)) return false;
      seen.add(post.id);
      return true;
    });

  return merged;
};

export default function Discussions() {
  const [searchParams] = useSearchParams();
  const communityFilter = searchParams.get('community');
  const [selectedCommunity, setSelectedCommunity] = useState(communityFilter || 'all');
  const [activeTab, setActiveTab] = useState('all');
  const [allPosts, setAllPosts] = useState<DiscussionPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('latest');
  const [feedSource, setFeedSource] = useState<FeedSource>('fallback');
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const currentUserId = useMemo(() => getCurrentUserId(), []);

  const lastRefreshedText = useMemo(() => {
    if (!lastRefreshedAt) return 'Not refreshed yet';
    return `${lastRefreshedAt.toLocaleTimeString()}`;
  }, [lastRefreshedAt]);

  const sourceLabel = useMemo(() => {
    if (feedSource === 'api') return 'API';
    if (feedSource === 'mixed') return 'API + Local';
    return 'Local/Mock';
  }, [feedSource]);

  const fetchDiscussions = useCallback(
    async (showSpinner = true) => {
      try {
        if (showSpinner) {
          setIsLoading(true);
        } else {
          setIsReloading(true);
        }

        const filters = selectedCommunity !== 'all' ? { communityId: selectedCommunity, limit: 100 } : { limit: 100 };
        const response = await discussionAPI.getDiscussions(filters);
        const discussions = Array.isArray(response?.data) ? response.data : [];
        const apiPosts = discussions.map(mapApiDiscussionToPost);

        // Keep locally-created/mock posts visible even when backend has partial data.
        const fallbackPosts = getFallbackPosts(currentUserId);
        const merged = [...apiPosts];
        const seen = new Set(apiPosts.map((post) => post.id));

        fallbackPosts.forEach((post) => {
          if (!seen.has(post.id)) {
            merged.push(post);
          }
        });

        setAllPosts(merged);
        setFeedSource(merged.length > apiPosts.length ? 'mixed' : 'api');
        setLastRefreshedAt(new Date());

        if (!showSpinner) {
          toast.success('Discussions refreshed.');
        }
      } catch (error: any) {
        setAllPosts(getFallbackPosts(currentUserId));
        setFeedSource('fallback');
        setLastRefreshedAt(new Date());
        if (!showSpinner) {
          toast.success('Refresh complete (local/mock data).');
        }
      } finally {
        setIsLoading(false);
        setIsReloading(false);
      }
    },
    [selectedCommunity, currentUserId]
  );

  useEffect(() => {
    fetchDiscussions(true);
  }, [fetchDiscussions]);

  const toggleLike = async (postId: string) => {
    const selectedPost = allPosts.find((post) => post.id === postId);
    if (!selectedPost) return;

    const applyLocalLikeToggle = () => {
      const isCurrentlyLiked = selectedPost.likedBy.includes(currentUserId);
      const nextLiked = !isCurrentlyLiked;
      const nextLikes = nextLiked ? selectedPost.likes + 1 : Math.max(0, selectedPost.likes - 1);

      setAllPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: nextLikes,
                likedBy: nextLiked
                  ? Array.from(new Set([...(post.likedBy || []), currentUserId]))
                  : (post.likedBy || []).filter((id) => id !== currentUserId),
              }
            : post
        )
      );

      const likedPostsStorage = JSON.parse(localStorage.getItem('likedPosts') || '{}');
      likedPostsStorage[postId] = { count: nextLikes, isLiked: nextLiked };
      localStorage.setItem('likedPosts', JSON.stringify(likedPostsStorage));
    };

    // Mock/local posts don't exist in backend, so keep likes local.
    if (!isMongoObjectId(postId)) {
      applyLocalLikeToggle();
      return;
    }

    try {
      const response = await discussionAPI.likeDiscussion(postId);
      const data = response?.data || {};
      const likes = Number(data.likes || 0);
      const liked = Boolean(data.liked);

      setAllPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;

          const nextLikedBy = liked
            ? Array.from(new Set([...(post.likedBy || []), currentUserId]))
            : (post.likedBy || []).filter((id) => id !== currentUserId);

          return {
            ...post,
            likes,
            likedBy: nextLikedBy,
          };
        })
      );

      if (liked) {
        toast.success('Post liked!');
      }
    } catch (error: any) {
      applyLocalLikeToggle();
    }
  };

  const handleShare = (postTitle: string, platform: 'copy' | 'whatsapp' | 'telegram' | 'email') => {
    const url = window.location.href;
    const text = `Check out this discussion: ${postTitle}`;

    switch (platform) {
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success(`Link for "${postTitle}" copied to clipboard!`);
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

  const filteredPosts = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLowerCase();

    const filtered = allPosts.filter((post) => {
        const matchesCommunity = selectedCommunity === 'all' || post.communityId === selectedCommunity;
        const matchesTab = activeTab === 'all' || (activeTab === 'my-posts' && post.authorId === currentUserId);
        if (!matchesCommunity || !matchesTab) return false;

        if (!normalizedSearch) return true;

        const searchable = `${post.title} ${stripHtml(post.content)} ${post.author} ${post.category} ${post.communityName}`.toLowerCase();
        return searchable.includes(normalizedSearch);
      });

    const sorted = [...filtered];
    if (sortMode === 'most-liked') {
      sorted.sort((a, b) => b.likes - a.likes);
    } else if (sortMode === 'most-commented') {
      sorted.sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
    } else if (sortMode === 'oldest') {
      sorted.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return (Number.isNaN(dateA) ? 0 : dateA) - (Number.isNaN(dateB) ? 0 : dateB);
      });
    } else {
      sorted.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return (Number.isNaN(dateB) ? 0 : dateB) - (Number.isNaN(dateA) ? 0 : dateA);
      });
    }

    return sorted;
  }, [allPosts, selectedCommunity, activeTab, currentUserId, searchQuery, sortMode]);

  const communityOptions = useMemo(() => {
    const map = new Map<string, string>();

    mockCommunities.forEach((community) => map.set(community.id, community.name));
    allPosts.forEach((post) => {
      if (post.communityId) {
        map.set(post.communityId, post.communityName || 'Unknown Community');
      }
    });

    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [allPosts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discussions</h1>
          <p className="text-gray-600">Engage with your community</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchDiscussions(false)}
            disabled={isLoading || isReloading}
            className="rounded-xl"
          >
            {isReloading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Link to="/discussions/create">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-indigo-200 transition-all border-none rounded-xl h-11 px-6">
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search posts, authors, categories..."
          className="w-full sm:w-72 bg-white rounded-xl h-11"
          data-testid="discussions-search-input"
        />
        <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
          <SelectTrigger className="w-full sm:w-64 bg-white border-none shadow-sm rounded-xl h-11">
            <SelectValue placeholder="Select community" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none shadow-xl">
            <SelectItem value="all">All Communities</SelectItem>
            {communityOptions.map((community) => (
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
        <Select value={sortMode} onValueChange={(value: SortMode) => setSortMode(value)}>
          <SelectTrigger className="w-full sm:w-52 bg-white border-none shadow-sm rounded-xl h-11">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-none shadow-xl">
            <SelectItem value="latest">Latest</SelectItem>
            <SelectItem value="oldest">Oldest</SelectItem>
            <SelectItem value="most-liked">Most Liked</SelectItem>
            <SelectItem value="most-commented">Most Commented</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading discussions...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredPosts.map((post) => {
            const isLiked = post.likedBy.includes(currentUserId);
            const plainContent = stripHtml(post.content);

            return (
              <Card
                key={post.id}
                className="group border-none shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 rounded-[1.5rem] overflow-hidden bg-white"
                data-testid={`post-card-${post.id}`}
              >
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
                    <div
                      className={`px-3 py-1 rounded-xl text-[10px] font-bold tracking-wider uppercase shadow-sm ${
                        post.status === 'Open'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                      }`}
                    >
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
                        data-testid={`post-like-toggle-${post.id}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill={isLiked ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                        </svg>
                        {isLiked ? `Liked (${post.likes})` : `Like (${post.likes})`}
                      </Button>
                      <Link to={`/discussions/${post.id}`} className="flex-1 sm:flex-none">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-10 gap-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Comment ({post.comments?.length || 0})
                        </Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 sm:flex-none h-10 gap-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
                          >
                            <Share2 className="w-4 h-4" />
                            Share
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl border-none shadow-xl p-1">
                          <DropdownMenuItem
                            onClick={() => handleShare(post.title, 'copy')}
                            className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg hover:bg-indigo-50"
                          >
                            <LinkIcon className="w-4 h-4 text-indigo-500" />
                            <span>Copy Link</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleShare(post.title, 'whatsapp')}
                            className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg hover:bg-green-50"
                          >
                            <MessageCircle className="w-4 h-4 text-green-500" />
                            <span>WhatsApp</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleShare(post.title, 'telegram')}
                            className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg hover:bg-blue-50"
                          >
                            <SendIcon className="w-4 h-4 text-blue-500" />
                            <span>Telegram</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleShare(post.title, 'email')}
                            className="flex items-center gap-2 p-2.5 cursor-pointer rounded-lg hover:bg-gray-100"
                          >
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
      )}
    </div>
  );
}
