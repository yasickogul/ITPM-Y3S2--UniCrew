const discussionController = require('../controllers/discussion.controller');
const Discussion = require('../models/discussion.model');

jest.mock('../models/discussion.model', () => {
  const MockDiscussion = jest.fn(function MockDiscussion(data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue(data),
    };
  });

  MockDiscussion.findById = jest.fn();
  MockDiscussion.countDocuments = jest.fn();
  MockDiscussion.find = jest.fn();
  MockDiscussion.findByIdAndDelete = jest.fn();

  return MockDiscussion;
});

jest.mock('../utils/aiService', () => ({
  generateSmartTags: jest.fn(() => ['study', 'discussion']),
  analyzeContentQuality: jest.fn(() => ({ score: 82 })),
  moderateContent: jest.fn(() => ({ severity: 0, issues: [] })),
}));

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('discussion.controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createDiscussion returns 400 when title is too short', async () => {
    const req = {
      body: {
        title: 'abc',
        content: 'Valid content body here',
        communityId: 'community-1',
        communityName: 'Community Name',
        category: 'General',
      },
      headers: {
        'x-user-id': 'user-1',
        'x-user-name': 'User One',
      },
    };
    const res = createMockRes();

    await discussionController.createDiscussion(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('createDiscussion returns 201 for valid payload', async () => {
    const req = {
      body: {
        title: 'Valid title for discussion',
        content: 'Valid content body here for test coverage',
        communityId: 'community-1',
        communityName: 'Community Name',
        category: 'General',
      },
      headers: {
        'x-user-id': 'user-1',
        'x-user-name': 'User One',
      },
    };
    const res = createMockRes();

    await discussionController.createDiscussion(req, res);

    expect(Discussion).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('getDiscussionById returns 400 for invalid id format', async () => {
    const req = {
      params: { id: 'invalid-id' },
      headers: {},
    };
    const res = createMockRes();

    await discussionController.getDiscussionById(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('addComment returns 400 when content is empty', async () => {
    const req = {
      params: { id: '507f1f77bcf86cd799439011' },
      body: { content: '' },
      headers: {
        'x-user-id': 'user-1',
        'x-user-name': 'User One',
      },
    };
    const res = createMockRes();

    await discussionController.addComment(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });
});
