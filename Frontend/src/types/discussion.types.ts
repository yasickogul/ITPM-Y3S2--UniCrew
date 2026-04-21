/**
 * Discussion Board Module - TypeScript Types
 * Author: Lochana
 * Component: Discussion Board
 * 
 * Complete type definitions for all discussion-related interfaces
 */

/**
 * User/Author information
 */
export interface IAuthor {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

/**
 * Comment on a discussion
 */
export interface IComment {
  id: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: string;
  likes?: number;
  likedBy?: string[];
}

/**
 * Reply to a comment
 */
export interface IReply {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
  likes?: number;
}

/**
 * Main Discussion/Post interface
 */
export interface IDiscussion {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId: string;
  communityId: string;
  communityName: string;
  category: DiscussionCategory;
  timestamp: string;
  status: 'Open' | 'Resolved' | 'Closed';
  commentCount: number;
  viewCount?: number;
  likes?: number;
  likedBy?: string[];
  tags?: string[];
  isPinned?: boolean;
  comments: IComment[];
}

/**
 * Community interface (for reference)
 */
export interface ICommunity {
  id: string;
  name: string;
  description: string;
  faculty: string;
  year: string;
  memberCount: number;
  banner?: string;
  members: string[];
}

/**
 * Create discussion request payload
 */
export interface ICreateDiscussionRequest {
  title: string;
  content: string;
  communityId: string;
  category: DiscussionCategory;
  tags?: string[];
}

/**
 * Update discussion request payload
 */
export interface IUpdateDiscussionRequest {
  title?: string;
  content?: string;
  category?: DiscussionCategory;
  tags?: string[];
  status?: 'Open' | 'Resolved' | 'Closed';
}

/**
 * Add comment request payload
 */
export interface IAddCommentRequest {
  content: string;
  postId: string;
}

/**
 * Discussion filter/query options
 */
export interface IDiscussionFilter {
  communityId?: string;
  category?: DiscussionCategory;
  status?: 'Open' | 'Resolved' | 'Closed';
  search?: string;
  tags?: string[];
  sortBy?: 'newest' | 'oldest' | 'mostCommented' | 'mostViewed' | 'mostLiked';
  page?: number;
  limit?: number;
}

/**
 * Discussion category type
 */
export type DiscussionCategory =
  | 'Study Group'
  | 'Project'
  | 'Question'
  | 'Announcement'
  | 'Resource'
  | 'General';

/**
 * API Response wrapper
 */
export interface IApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/**
 * Paginated response
 */
export interface IPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
}

/**
 * User context from AuthContext
 */
export interface IUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: 'student' | 'admin' | 'teacher';
}

/**
 * Validation error response
 */
export interface IValidationError {
  field: string;
  message: string;
}

/**
 * Create discussion form state
 */
export interface ICreateDiscussionFormState {
  title: string;
  content: string;
  communityId: string;
  category: DiscussionCategory;
  tags: string[];
  isLoading: boolean;
  errors?: IValidationError[];
}

/**
 * Discussion list component state
 */
export interface IDiscussionListState {
  discussions: IDiscussion[];
  filteredDiscussions: IDiscussion[];
  isLoading: boolean;
  error?: string;
  selectedCommunity: string;
  activeTab: 'all' | 'my-posts';
  sortBy: 'newest' | 'oldest' | 'mostCommented';
}

/**
 * Discussion detail component state
 */
export interface IDiscussionDetailState {
  discussion: IDiscussion | null;
  isLoading: boolean;
  newComment: string;
  isSubmittingComment: boolean;
  error?: string;
  isAuthor: boolean;
}
