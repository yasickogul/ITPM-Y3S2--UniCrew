import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Flag, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { mockPosts } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const post = mockPosts.find((p) => p.id === id);
  
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(post?.comments || []);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  if (!post) {
    return <div>Post not found</div>;
  }

  const isAuthor = user?.id === post.authorId;

  const handleAddComment = () => {
    if (newComment.trim()) {
      const addedComment = {
        id: Date.now().toString(),
        authorId: user?.id || 'current-user',
        author: user?.studentId || 'IT245671234',
        content: newComment,
        timestamp: 'Just now',
      };
      setComments([...comments, addedComment]);
      setNewComment('');
      toast.success("Comment added!");
    }
  };

  const handleStartEdit = (comment: any) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = (commentId: string) => {
    setComments(comments.map(c => c.id === commentId ? { ...c, content: editContent } : c));
    setEditingCommentId(null);
    setEditContent('');
    toast.success("Comment updated!");
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter(c => c.id !== commentId));
    toast.success("Comment deleted!");
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
                  <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={() => toast.success("Post has been flagged for moderation review.")}>
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
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Existing Comments */}
          {comments.map((comment: any) => {
            const isCommentAuthor = comment.authorId === user?.id || comment.author === 'IT245671234';
            
            return (
              <div key={comment.id} className="flex gap-3 relative group">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author}`} />
                  <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-4 relative">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium">{comment.author}</p>
                      
                      {isCommentAuthor && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {editingCommentId === comment.id ? (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => setEditingCommentId(null)} className="h-6 text-xs text-gray-500">Cancel</Button>
                              <Button size="sm" variant="ghost" onClick={() => handleSaveEdit(comment.id)} className="h-6 text-xs text-green-600">Save</Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => handleStartEdit(comment)} className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100">
                                <Edit className="w-3 h-3 mr-1" /> Edit
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteComment(comment.id)} className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-100">
                                <Trash2 className="w-3 h-3 mr-1" /> Delete
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {editingCommentId === comment.id ? (
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="mt-2 min-h-[60px]"
                        autoFocus
                      />
                    ) : (
                      <p className="text-gray-700">{comment.content}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{comment.timestamp}</p>
                </div>
              </div>
            );
          })}

          {/* Add Comment */}
          <div className="border-t pt-4">
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={user?.avatar} />
                <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  onClick={handleAddComment}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 w-full sm:w-auto"
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
