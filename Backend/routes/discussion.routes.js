/**
 * Discussion Routes
 * All API endpoints for discussion board module
 */

const express = require('express');
const discussionController = require('../controllers/discussion.controller');

const router = express.Router();

// Create a new discussion
router.post('/', discussionController.createDiscussion);

// Get all discussions (with filters, search, sorting, pagination)
router.get('/', discussionController.getDiscussions);

// Search discussions
router.get('/search', discussionController.searchDiscussions);

// Get trending discussions
router.get('/trending', discussionController.getTrendingDiscussions);

// Get single discussion by ID
router.get('/:id', discussionController.getDiscussionById);

// Update discussion
router.put('/:id', discussionController.updateDiscussion);

// Delete discussion
router.delete('/:id', discussionController.deleteDiscussion);

// Like/Unlike discussion
router.put('/:id/like', discussionController.likeDiscussion);

// Add comment to discussion
router.post('/:id/comments', discussionController.addComment);

// Like/Unlike comment
router.put('/:id/comments/:commentId/like', discussionController.likeComment);

// Edit comment
router.put('/:id/comments/:commentId', discussionController.editComment);

module.exports = router;
