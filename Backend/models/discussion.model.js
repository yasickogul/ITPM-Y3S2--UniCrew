/**
 * Discussion Schema and Model
 * Handles all database operations for discussions and comments
 */

const mongoose = require('mongoose');

// Comment sub-schema
const commentSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 5000,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [String],
});

// Discussion Schema
const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 200,
    trim: true,
  },
  content: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 50000,
    trim: true,
  },
  images: [String],
  author: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  communityId: {
    type: String,
    required: true,
  },
  communityName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['Kuppi', 'Programming', 'Projects', 'Events', 'Career', 'General', 'Research', 'Study Group', 'Project', 'Question', 'Announcement', 'Resource'],
    default: 'General',
  },
  tags: [
    {
      type: String,
      maxlength: 30,
    },
  ],
  status: {
    type: String,
    enum: ['Open', 'Resolved', 'Closed', 'Flagged'],
    default: 'Open',
  },
  comments: [commentSchema],
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [String],
  views: {
    type: Number,
    default: 0,
  },
  viewedBy: [String],
  isPinned: {
    type: Boolean,
    default: false,
  },
  aiAnalysis: {
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    flagReasons: [String],
    generatedTags: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for better query performance
discussionSchema.index({ createdAt: -1 });
discussionSchema.index({ likes: -1 });
discussionSchema.index({ category: 1 });
discussionSchema.index({ tags: 1 });
discussionSchema.index({ communityId: 1 });

// Update timestamp on save
discussionSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Discussion', discussionSchema);
