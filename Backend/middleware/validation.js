/**
 * Discussion Input Validation Utilities
 * Validates all input for discussion-related operations
 */

const validateDiscussionInput = (req, res, next) => {
  const { title, content, category, communityId } = req.body;

  const errors = {};

  // Validate title
  if (!title) {
    errors.title = 'Title is required';
  } else if (title.length < 5) {
    errors.title = 'Title must be at least 5 characters';
  } else if (title.length > 200) {
    errors.title = 'Title must not exceed 200 characters';
  }

  // Validate content
  if (!content) {
    errors.content = 'Content is required';
  } else if (content.length < 10) {
    errors.content = 'Content must be at least 10 characters';
  } else if (content.length > 5000) {
    errors.content = 'Content must not exceed 5000 characters';
  }

  // Validate category
  const validCategories = ['Study Group', 'Project', 'Question', 'Announcement', 'Resource', 'General'];
  if (!category) {
    errors.category = 'Category is required';
  } else if (!validCategories.includes(category)) {
    errors.category = 'Invalid category selected';
  }

  // Validate community
  if (!communityId) {
    errors.community = 'Community is required';
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors,
    });
  }

  next();
};

const validateCommentInput = (req, res, next) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      error: 'Comment content is required',
    });
  }

  if (content.trim().length < 1) {
    return res.status(400).json({
      success: false,
      error: 'Comment cannot be empty',
    });
  }

  if (content.length > 5000) {
    return res.status(400).json({
      success: false,
      error: 'Comment must not exceed 5000 characters',
    });
  }

  next();
};

const validatePagination = (req, res, next) => {
  let { page, limit } = req.query;

  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;

  if (page < 1) {
    return res.status(400).json({
      success: false,
      error: 'Page number must be greater than 0',
    });
  }

  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      error: 'Limit must be between 1 and 100',
    });
  }

  req.query.page = page;
  req.query.limit = limit;

  next();
};

module.exports = {
  validateDiscussionInput,
  validateCommentInput,
  validatePagination,
};
