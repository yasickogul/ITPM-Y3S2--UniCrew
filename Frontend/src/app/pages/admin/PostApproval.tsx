import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Check, X, Eye } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { adminService } from '../../services/api';
import { toast } from 'sonner';

export default function PostApproval() {
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingPosts = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getPendingPosts();
      setPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch pending posts');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const handleApprove = async (postId: string) => {
    try {
      setProcessingId(postId);
      await adminService.approvePost(postId);
      toast.success('Post approved');
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      if (selectedPost?._id === postId) {
        setSelectedPost(null);
      }
    } catch (error) {
      toast.error('Failed to approve post');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (postId: string) => {
    try {
      setProcessingId(postId);
      await adminService.rejectPost(postId);
      toast.success('Post rejected');
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      if (selectedPost?._id === postId) {
        setSelectedPost(null);
      }
    } catch (error) {
      toast.error('Failed to reject post');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Post Approval</h1>
        <p className="text-gray-600">Review and approve pending posts</p>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Card key={post._id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{post.title || 'Untitled post'}</CardTitle>
                  <CardDescription className="mt-2">
                    by {post.author || 'Unknown'} in {post.communityName || 'Unknown community'}
                  </CardDescription>
                  <p className="text-sm text-gray-500 mt-1">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{post.content || 'No content provided.'}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setSelectedPost(post)}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  size="sm"
                  disabled={processingId === post._id}
                  onClick={() => handleApprove(post._id)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  variant="destructive"
                  size="sm"
                  disabled={processingId === post._id}
                  onClick={() => handleReject(post._id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && posts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">No pending posts to review</p>
          </CardContent>
        </Card>
      )}

      {/* Post Details Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
            <DialogDescription>
              Review post details before approving or rejecting
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Author</p>
                <p>{selectedPost.author || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Community</p>
                <p>{selectedPost.communityName || 'Unknown community'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Posted</p>
                <p>{new Date(selectedPost.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Content</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedPost.content}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={processingId === selectedPost._id}
                  onClick={() => handleApprove(selectedPost._id)}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve Post
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={processingId === selectedPost._id}
                  onClick={() => handleReject(selectedPost._id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject Post
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
