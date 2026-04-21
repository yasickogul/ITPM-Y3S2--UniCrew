/**
 * AI Service - Frontend
 * Handles all AI-powered features on the frontend
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const aiAPI = {
  // Analyze discussion quality before posting
  analyzeQuality: async (title, content) => {
    try {
      const response = await fetch(`${API_BASE}/ai/analyze-quality`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error analyzing quality:', error);
      throw error;
    }
  },

  // Get category recommendation
  recommendCategory: async (title, content, tags = []) => {
    try {
      const response = await fetch(`${API_BASE}/ai/recommend-category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, tags }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error getting category recommendation:', error);
      throw error;
    }
  },

  // Moderate content before posting
  checkModeration: async (title, content) => {
    try {
      const response = await fetch(`${API_BASE}/ai/moderate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error checking moderation:', error);
      throw error;
    }
  },

  // Get discussion summary
  summarize: async (content) => {
    try {
      const response = await fetch(`${API_BASE}/ai/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error summarizing:', error);
      throw error;
    }
  },

  // Generate smart tags
  generateTags: async (title, content, category) => {
    try {
      const response = await fetch(`${API_BASE}/ai/generate-tags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error generating tags:', error);
      throw error;
    }
  },

  // Analyze content complexity
  analyzeComplexity: async (content, commentsCount = 0) => {
    try {
      const response = await fetch(`${API_BASE}/ai/analyze-complexity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, commentsCount }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error analyzing complexity:', error);
      throw error;
    }
  },

  // Find similar discussions
  findSimilar: async (discussionId, limit = 5) => {
    try {
      const response = await fetch(`${API_BASE}/ai/similar/${discussionId}?limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Error finding similar discussions:', error);
      throw error;
    }
  },

  // Get personalized recommendations
  getRecommendations: async (userId, communityId = null, limit = 5) => {
    try {
      const url = new URL(`${API_BASE}/ai/recommendations/${userId}`);
      if (communityId) url.searchParams.append('communityId', communityId);
      url.searchParams.append('limit', limit);

      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  },

  // Get discussion impact score
  getImpactScore: async (discussionId) => {
    try {
      const response = await fetch(`${API_BASE}/ai/impact/${discussionId}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting impact score:', error);
      throw error;
    }
  },

  // Get comprehensive insights
  getInsights: async (discussionId) => {
    try {
      const response = await fetch(`${API_BASE}/ai/insights/${discussionId}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting insights:', error);
      throw error;
    }
  },
};

export default aiAPI;

