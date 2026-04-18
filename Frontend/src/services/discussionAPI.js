/**
 * Discussion API Service
 * Handles all API calls to the discussion backend endpoints
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050/api';

// Helper function to get auth headers from localStorage
const getAuthHeaders = () => {
  const userId = localStorage.getItem('userId') || 'test-user';
  const userName = localStorage.getItem('userName') || 'Test User';
  const userUniversity = localStorage.getItem('userUniversity') || 'default-university';
  const userRole = localStorage.getItem('userRole') || 'student';

  return {
    'Content-Type': 'application/json',
    'x-user-id': userId,
    'x-user-name': userName,
    'x-user-university': userUniversity,
    'x-user-role': userRole,
  };
};

export const discussionAPI = {
  // CREATE OPERATIONS
  createDiscussion: async (discussionData) => {
    try {
      const response = await fetch(`${API_BASE}/discussions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(discussionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create discussion');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  addComment: async (discussionId, content) => {
    try {
      const response = await fetch(`${API_BASE}/discussions/${discussionId}/comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add comment');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // READ OPERATIONS
  getDiscussions: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.communityId) params.append('communityId', filters.communityId);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await fetch(`${API_BASE}/discussions?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch discussions');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  getDiscussionById: async (discussionId) => {
    try {
      const response = await fetch(`${API_BASE}/discussions/${discussionId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch discussion');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  searchDiscussions: async (query, communityId = null, limit = 20) => {
    try {
      const params = new URLSearchParams({
        q: query,
        limit,
      });
      if (communityId) params.append('communityId', communityId);

      const response = await fetch(`${API_BASE}/discussions/search?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to search discussions');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  getTrendingDiscussions: async (communityId = null, limit = 5) => {
    try {
      const params = new URLSearchParams({ limit });
      if (communityId) params.append('communityId', communityId);

      const response = await fetch(`${API_BASE}/discussions/trending?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch trending discussions');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // UPDATE OPERATIONS
  updateDiscussion: async (discussionId, updateData) => {
    try {
      const response = await fetch(`${API_BASE}/discussions/${discussionId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update discussion');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  editComment: async (discussionId, commentId, content) => {
    try {
      const response = await fetch(`${API_BASE}/discussions/${discussionId}/comments/${commentId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to edit comment');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  deleteComment: async (discussionId, commentId) => {
    try {
      const response = await fetch(`${API_BASE}/discussions/${discussionId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete comment');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // DELETE OPERATIONS
  deleteDiscussion: async (discussionId) => {
    try {
      const response = await fetch(`${API_BASE}/discussions/${discussionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete discussion');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // LIKE OPERATIONS
  likeDiscussion: async (discussionId) => {
    try {
      const response = await fetch(`${API_BASE}/discussions/${discussionId}/like`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to like discussion');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  likeComment: async (discussionId, commentId) => {
    try {
      const response = await fetch(`${API_BASE}/discussions/${discussionId}/comments/${commentId}/like`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to like comment');
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // VALIDATION HELPERS
  validateDiscussionInput: (data) => {
    const errors = {};

    if (!data.title || data.title.length < 5) {
      errors.title = 'Title must be at least 5 characters';
    } else if (data.title.length > 200) {
      errors.title = 'Title must not exceed 200 characters';
    }

    if (!data.content || data.content.length < 10) {
      errors.content = 'Content must be at least 10 characters';
    } else if (data.content.length > 50000) {
      errors.content = 'Content must not exceed 50000 characters';
    }

    const validCategories = ['Kuppi', 'Programming', 'Projects', 'Events', 'Career', 'General', 'Research'];
    if (!data.category || !validCategories.includes(data.category)) {
      errors.category = 'Invalid category selected';
    }

    if (!data.communityId) {
      errors.community = 'Community is required';
    }

    return Object.keys(errors).length > 0 ? errors : null;
  },

  validateCommentInput: (content) => {
    if (!content || content.trim().length < 1) {
      return 'Comment cannot be empty';
    }
    if (content.length > 5000) {
      return 'Comment must not exceed 5000 characters';
    }
    return null;
  },
};

export default discussionAPI;

