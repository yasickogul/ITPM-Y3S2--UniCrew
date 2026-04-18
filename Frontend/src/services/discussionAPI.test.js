import { describe, expect, it } from 'vitest';
import { discussionAPI } from './discussionAPI';

describe('discussionAPI.validateDiscussionInput', () => {
  it('returns title error when title is too short', () => {
    const errors = discussionAPI.validateDiscussionInput({
      title: 'abc',
      content: 'This content is long enough for validation.',
      category: 'General',
      communityId: '1',
    });

    expect(errors).toBeTruthy();
    expect(errors.title).toBe('Title must be at least 5 characters');
  });

  it('returns category error when category is invalid', () => {
    const errors = discussionAPI.validateDiscussionInput({
      title: 'Valid title',
      content: 'This content is long enough for validation.',
      category: 'Invalid',
      communityId: '1',
    });

    expect(errors).toBeTruthy();
    expect(errors.category).toBe('Invalid category selected');
  });

  it('returns null when payload is valid', () => {
    const errors = discussionAPI.validateDiscussionInput({
      title: 'Valid discussion title',
      content: 'This content is long enough for discussion validation.',
      category: 'General',
      communityId: 'community-1',
    });

    expect(errors).toBeNull();
  });
});

describe('discussionAPI.validateCommentInput', () => {
  it('rejects empty comments', () => {
    const result = discussionAPI.validateCommentInput('');
    expect(result).toBe('Comment cannot be empty');
  });

  it('accepts a valid comment', () => {
    const result = discussionAPI.validateCommentInput('Useful response');
    expect(result).toBeNull();
  });
});
