/**
 * AI Routes
 * Endpoints for AI-powered features
 */

const express = require('express');
const router = express.Router();
const {
  analyzeContentQuality,
  recommendCategory,
  moderateContent,
  summarizeContent,
  generateSmartTags,
  calculateComplexity,
  findSimilarityScore,
  getRecommendations,
  calculateImpactScore,
} = require('../utils/aiService');

const Discussion = require('../models/discussion.model');

// Analyze discussion content quality
router.post('/analyze-quality', (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required',
      });
    }

    const analysis = analyzeContentQuality(title, content);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Error analyzing quality:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze content quality',
    });
  }
});

// Recommend category
router.post('/recommend-category', (req, res) => {
  try {
    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required',
      });
    }

    const recommendation = recommendCategory(title, content, tags);

    res.json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    console.error('Error recommending category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to recommend category',
    });
  }
});

// Moderate discussion content
router.post('/moderate', (req, res) => {
  try {
    const { title, content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    const moderation = moderateContent(content, title);

    res.json({
      success: true,
      data: moderation,
    });
  } catch (error) {
    console.error('Error moderating content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to moderate content',
    });
  }
});

// Summarize discussion
router.post('/summarize', (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    const summary = summarizeContent(content);

    res.json({
      success: true,
      data: { summary },
    });
  } catch (error) {
    console.error('Error summarizing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to summarize content',
    });
  }
});

// Generate smart tags
router.post('/generate-tags', (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, content, and category are required',
      });
    }

    const tags = generateSmartTags(title, content, category);

    res.json({
      success: true,
      data: { tags },
    });
  } catch (error) {
    console.error('Error generating tags:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate tags',
    });
  }
});

// Calculate discussion complexity
router.post('/analyze-complexity', (req, res) => {
  try {
    const { content, commentsCount } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
      });
    }

    const complexity = calculateComplexity(content, commentsCount || 0);

    res.json({
      success: true,
      data: complexity,
    });
  } catch (error) {
    console.error('Error analyzing complexity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze complexity',
    });
  }
});

// Find similar discussions
router.get('/similar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found',
      });
    }

    const allDiscussions = await Discussion.find({ _id: { $ne: id }, communityId: discussion.communityId });

    const similar = allDiscussions
      .map((doc) => {
        const similarity = findSimilarityScore(`${discussion.title} ${discussion.content}`, `${doc.title} ${doc.content}`);

        return {
          ...doc.toObject(),
          similarity,
        };
      })
      .filter((doc) => doc.similarity > 20)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: similar,
    });
  } catch (error) {
    console.error('Error finding similar discussions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find similar discussions',
    });
  }
});

// Get AI recommendations for user
router.get('/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { communityId, limit = 5 } = req.query;

    // Mock user profile (in real app, fetch from user database)
    const userProfile = {
      userId,
      favoriteCategories: ['Question', 'Study Group', 'Resource'],
      communities: communityId ? [communityId] : [],
      interests: ['javascript', 'react', 'nodejs', 'database'],
    };

    const allDiscussions = communityId ? await Discussion.find({ communityId }).limit(100) : await Discussion.find().limit(100);

    const recommendations = getRecommendations(userProfile, allDiscussions).slice(0, parseInt(limit));

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get recommendations',
    });
  }
});

// Calculate discussion impact score
router.get('/impact/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found',
      });
    }

    const impact = calculateImpactScore(discussion);

    res.json({
      success: true,
      data: impact,
    });
  } catch (error) {
    console.error('Error calculating impact:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate impact score',
    });
  }
});

// Get discussion insights (comprehensive AI analysis)
router.get('/insights/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({
        success: false,
        error: 'Discussion not found',
      });
    }

    // Comprehensive insights
    const quality = analyzeContentQuality(discussion.title, discussion.content);
    const complexity = calculateComplexity(discussion.content, discussion.comments?.length || 0);
    const impact = calculateImpactScore(discussion);
    const summary = summarizeContent(discussion.content);

    res.json({
      success: true,
      data: {
        title: discussion.title,
        quality,
        complexity,
        impact,
        summary,
        stats: {
          views: discussion.views,
          likes: discussion.likes,
          comments: discussion.comments?.length || 0,
          engagement: ((discussion.likes + discussion.comments?.length) / (discussion.views || 1)) * 100,
        },
      },
    });
  } catch (error) {
    console.error('Error getting insights:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get insights',
    });
  }
});

module.exports = router;
