/**
 * Discussion Routes
 * All API endpoints for discussion board module
 */

const express = require('express');
const discussionController = require('../controllers/discussion.controller');
const { authenticate, optionalAuth } = require("../middleware/auth.middleware");

const router = express.Router();

// Create a new discussion
router.post('/', authenticate, discussionController.createDiscussion);

// Get all discussions (with filters, search, sorting, pagination)
router.get('/', discussionController.getDiscussions);

// Search discussions
router.get('/search', discussionController.searchDiscussions);

// Get trending discussions
router.get('/trending', discussionController.getTrendingDiscussions);

// Get single discussion by ID
router.get('/:id', optionalAuth, discussionController.getDiscussionById);

// Update discussion
router.put('/:id', authenticate, discussionController.updateDiscussion);

// Delete discussion
router.delete('/:id', authenticate, discussionController.deleteDiscussion);

// Like/Unlike discussion
router.put('/:id/like', authenticate, discussionController.likeDiscussion);

// Add comment to discussion
router.post('/:id/comments', authenticate, discussionController.addComment);

// Like/Unlike comment
router.put('/:id/comments/:commentId/like', authenticate, discussionController.likeComment);

// Edit comment
router.put('/:id/comments/:commentId', authenticate, discussionController.editComment);

module.exports = router;
