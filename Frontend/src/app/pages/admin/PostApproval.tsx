import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Check, X, Eye } from 'lucide-react';
import { mockPendingPosts } from '../../data/mockData';
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';

export default function PostApproval() {
  const [selectedPost, setSelectedPost] = useState<typeof mockPendingPosts[0] | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Post Approval</h1>
        <p className="text-gray-600">Review and approve pending posts</p>
      </div>

      <div className="space-y-4">
        {mockPendingPosts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription className="mt-2">
                    by {post.author} in {post.community}
                  </CardDescription>
                  <p className="text-sm text-gray-500 mt-1">{post.timestamp}</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{post.content}</p>
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
                >
                  <Check className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  variant="destructive"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockPendingPosts.length === 0 && (
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
                <p>{selectedPost.author}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Community</p>
                <p>{selectedPost.community}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Posted</p>
                <p>{selectedPost.timestamp}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Content</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedPost.content}</p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Check className="w-4 h-4 mr-2" />
                  Approve Post
                </Button>
                <Button variant="destructive" className="flex-1">
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
