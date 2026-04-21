import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Input } from '../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Flag, MessageSquare, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { discussionAPI } from '../../../services/discussionAPI';

type PostComment = {
  id: string;
  author?: string;
  authorId?: string;
  content?: string;
  timestamp?: string;
};

type DiscussionPost = {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  communityName: string;
  category: string;
  status: string;
  timestamp: string;
  images?: string[];
  comments?: PostComment[];
};

const postCategoryOptions = ['Kuppi', 'Programming', 'Projects', 'Events', 'Career', 'General', 'Research'];

const toRelativeTime = (dateString?: string) => {
  if (!dateString) return 'Just now';

  const createdAt = new Date(dateString);
  if (Number.isNaN(createdAt.getTime())) return 'Just now';

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

const htmlToEditorText = (html?: string) => {
  if (!html) return '';
  if (typeof window === 'undefined') return html;

  const parser = new DOMParser();
  const documentNode = parser.parseFromString(html, 'text/html');
  return (documentNode.body.innerText || documentNode.body.textContent || '').trim();
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const textToSafeHtml = (value: string) => escapeHtml(value).replace(/\n/g, '<br />');

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState<DiscussionPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [isSavingPost, setIsSavingPost] = useState(false);
  const [isDeletingPost, setIsDeletingPost] = useState(false);
  const [editPostTitle, setEditPostTitle] = useState('');
  const [editPostCategory, setEditPostCategory] = useState('General');
  const [editPostContent, setEditPostContent] = useState('');

  const fetchDiscussion = async () => {
    if (!id) {
      setPost(null);
      setComments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await discussionAPI.getDiscussionById(id);
      const data = response?.data;

      if (!data) {
        setPost(null);
        setComments([]);
        return;
      }

      const mappedPost: DiscussionPost = {
        id: data._id || data.id,
        title: data.title || '',
        content: data.content || '',
        author: data.author || 'Anonymous',
        authorId: data.authorId || '',
        communityName: data.communityName || 'Unknown Community',
        category: data.category || 'General',
        status: data.status || 'Open',
        timestamp: toRelativeTime(data.createdAt || data.timestamp),
        images: Array.isArray(data.images) ? data.images : [],
        comments: Array.isArray(data.comments)
          ? data.comments.map((comment: any) => ({
              id: comment._id || comment.id,
              author: comment.author,
              authorId: comment.authorId,
              content: comment.content,
              timestamp: toRelativeTime(comment.timestamp),
            }))
          : [],
      };

      setPost(mappedPost);
      setComments(mappedPost.comments || []);
    } catch (error: any) {
      setPost(null);
      setComments([]);
      toast.error(error?.message || 'Failed to load post details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const currentUserId = localStorage.getItem('userId') || user?.id || '';
  const isAuthor = post ? currentUserId === post.authorId : false;

  const handleStartPostEdit = () => {
    if (!post || !isAuthor) return;

    setEditPostTitle(post.title);
    setEditPostCategory(post.category || 'General');
    setEditPostContent(htmlToEditorText(post.content));
    setIsEditingPost(true);
  };

  const handleCancelPostEdit = () => {
    setIsEditingPost(false);
    setEditPostTitle('');
    setEditPostCategory('General');
    setEditPostContent('');
  };

  const handleSavePostEdit = async () => {
    if (!post) return;

    const trimmedTitle = editPostTitle.trim();
    const trimmedContent = editPostContent.trim();

    if (trimmedTitle.length < 5) {
      toast.error('Title must be at least 5 characters.');
      return;
    }

    if (trimmedContent.length < 10) {
      toast.error('Content must be at least 10 characters.');
      return;
    }

    if (!postCategoryOptions.includes(editPostCategory)) {
      toast.error('Please select a valid category.');
      return;
    }

    setIsSavingPost(true);
    try {
      const safeHtmlContent = textToSafeHtml(trimmedContent);
      const response = await discussionAPI.updateDiscussion(post.id, {
        title: trimmedTitle,
        content: safeHtmlContent,
        category: editPostCategory,
      });

      const updated = response?.data;
      setPost((prev) =>
        prev
          ? {
              ...prev,
              title: updated?.title || trimmedTitle,
              content: updated?.content || safeHtmlContent,
              category: updated?.category || editPostCategory,
            }
          : prev
      );

      setIsEditingPost(false);
      toast.success('Post updated successfully.');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update post.');
    } finally {
      setIsSavingPost(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post || !isAuthor || isDeletingPost) return;

    const confirmed = window.confirm('Delete this post permanently? This action cannot be undone.');
    if (!confirmed) return;

    setIsDeletingPost(true);
    try {
      await discussionAPI.deleteDiscussion(post.id);
      toast.success('Post deleted successfully.');
      navigate('/discussions');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete post.');
    } finally {
      setIsDeletingPost(false);
    }
  };

  const handleAddComment = async () => {
    if (!post || !newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const response = await discussionAPI.addComment(post.id, newComment.trim());
      const added = response?.data;

      const normalizedComment: PostComment = {
        id: added?._id || added?.id || Date.now().toString(),
        author: added?.author || user?.studentId || user?.name || 'You',
        authorId: added?.authorId || currentUserId,
        content: added?.content || newComment.trim(),
        timestamp: 'Just now',
      };

      setComments((prev) => [...prev, normalizedComment]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to add comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleStartEdit = (comment: PostComment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content || '');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!post || !editContent.trim()) {
      toast.error('Comment cannot be empty.');
      return;
    }

    try {
      await discussionAPI.editComment(post.id, commentId, editContent.trim());
      setComments((prev) =>
        prev.map((comment) => (comment.id === commentId ? { ...comment, content: editContent.trim() } : comment))
      );
      setEditingCommentId(null);
      setEditContent('');
      toast.success('Comment updated!');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update comment.');
    }
  };

  const handleDeleteComment = () => {
    toast.error('Comment delete is not available yet.');
  };

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-600">Loading post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800">Post not found</h2>
        <Button onClick={() => navigate('/discussions')} className="mt-4">
          Back to Discussions
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={post.status === 'Open' ? 'default' : 'secondary'}>{post.status}</Badge>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{post.category}</span>
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
                    {post.communityName} | {post.timestamp}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {isAuthor && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                    onClick={handleStartPostEdit}
                    disabled={isDeletingPost || isSavingPost}
                  >
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={handleDeletePost}
                    disabled={isDeletingPost || isSavingPost}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {isDeletingPost ? 'Deleting...' : 'Delete'}
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={() => toast.success('Post has been flagged for moderation review.')}>
                <Flag className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditingPost ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={editPostTitle}
                  onChange={(e) => setEditPostTitle(e.target.value)}
                  placeholder="Enter post title"
                  className="mt-2"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={editPostCategory}
                  onChange={(e) => setEditPostCategory(e.target.value)}
                  className="mt-2 w-full h-10 rounded-md border border-gray-200 px-3 text-sm"
                >
                  {postCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Content</label>
                <Textarea
                  value={editPostContent}
                  onChange={(e) => setEditPostContent(e.target.value)}
                  placeholder="Update your post content"
                  rows={10}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancelPostEdit} disabled={isSavingPost}>
                  Cancel
                </Button>
                <Button onClick={handleSavePostEdit} disabled={isSavingPost}>
                  {isSavingPost ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-gray-700 leading-relaxed text-[15px] rich-content" dangerouslySetInnerHTML={{ __html: post.content }} />

              {post.images && post.images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {post.images.map((img: string, idx: number) => (
                    <div key={idx} className="relative group rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                      <img
                        src={img}
                        alt={`Attachment ${idx + 1}`}
                        className="w-full h-auto object-cover max-h-[400px] hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                        onClick={() => window.open(img, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {comments.map((comment) => {
            const commentAuthorId = comment.authorId || '';
            const isCommentAuthor = commentAuthorId === currentUserId;

            return (
              <div key={comment.id} className="flex gap-3 relative group">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author || 'A'}`} />
                  <AvatarFallback>{(comment.author || 'A').charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-4 relative">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium">{comment.author || 'Anonymous'}</p>

                      {isCommentAuthor && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {editingCommentId === comment.id ? (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => setEditingCommentId(null)} className="h-6 text-xs text-gray-500">
                                Cancel
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleSaveEdit(comment.id)} className="h-6 text-xs text-green-600">
                                Save
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => handleStartEdit(comment)} className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100">
                                <Edit className="w-3 h-3 mr-1" /> Edit
                              </Button>
                              <Button size="sm" variant="ghost" onClick={handleDeleteComment} className="h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-100">
                                <Trash2 className="w-3 h-3 mr-1" /> Delete
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {editingCommentId === comment.id ? (
                      <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="mt-2 min-h-[60px]" autoFocus />
                    ) : (
                      <p className="text-gray-700">{comment.content}</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{comment.timestamp}</p>
                </div>
              </div>
            );
          })}

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
                  disabled={!newComment.trim() || isSubmittingComment}
                >
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
