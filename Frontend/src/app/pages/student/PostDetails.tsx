import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Flag, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { mockPosts } from '../../data/mockData';
import { useAuthStore } from '../../stores/authStore';

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const post = mockPosts.find((p) => p.id === id);
  const [newComment, setNewComment] = useState('');

  if (!post) {
    return <div>Post not found</div>;
  }

  const isAuthor = user?.id === post.authorId;

  const handleAddComment = () => {
    if (newComment.trim()) {
      // In a real app, this would add the comment
      setNewComment('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Post Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={post.status === 'Open' ? 'default' : 'secondary'}>
                  {post.status}
                </Badge>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  {post.category}
                </span>
              </div>
              <CardTitle className="text-2xl">{post.title}</CardTitle>
              <div className="flex items-center gap-3 mt-4">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author}`} />
                  <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{post.author}</p>
                  <p className="text-sm text-gray-600">
                    {post.communityName} • {post.timestamp}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {isAuthor && (
                <>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm">
                <Flag className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comments ({post.comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Comments */}
          {post.comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar>
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author}`} />
                <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium mb-1">{comment.author}</p>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
                <p className="text-xs text-gray-500 mt-1">{comment.timestamp}</p>
              </div>
            </div>
          ))}

          {/* Add Comment */}
          <div className="border-t pt-4">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={handleAddComment}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  disabled={!newComment.trim()}
                >
                  Post Comment
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
