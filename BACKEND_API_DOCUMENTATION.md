# Discussion Board API Documentation

**Component Owner**: Lochana  
**Status**: ✅ Backend APIs Complete  
**API Base URL**: `http://localhost:5000/api/discussions`

---

## 📊 What Was Created

### **Backend Files Created**

1. **`Backend/models/discussion.model.js`**
   - MongoDB schema for discussions
   - Comment sub-schema
   - Database indexes for performance
   - Validation rules in schema

2. **`Backend/controllers/discussion.controller.js`**
   - 12+ API endpoint handlers
   - Input validation logic
   - Error handling
   - Business logic for all operations

3. **`Backend/routes/discussion.routes.js`**
   - All RESTful route definitions
   - Links controllers to HTTP methods

4. **`Backend/middleware/errorHandler.js`**
   - Centralized error handling
   - Custom error classes
   - Error response formatting

5. **`Backend/middleware/validation.js`**
   - Input validation middlewares
   - Pagination validation
   - Reusable validators

6. **`Frontend/src/services/discussionAPI.js`**
   - API client service
   - All endpoints wrapped in methods
   - Auth header handling
   - Client-side validation helpers

---

## 🔌 API Endpoints

### **1. Create Discussion**
```
POST /api/discussions

Headers:
  x-user-id: userId
  x-user-name: userName

Body:
{
  "title": "Study Group for Algorithms",
  "content": "Looking for study partners...",
  "communityId": "1",
  "communityName": "Computer Science",
  "category": "Study Group",
  "tags": ["algorithm", "study"]
}

Response: 201 Created
{
  "success": true,
  "data": { discussion object }
}
```

### **2. Get All Discussions**
```
GET /api/discussions?communityId=1&sortBy=newest&page=1&limit=10

Query Parameters:
  - communityId: Filter by community
  - category: Filter by category
  - search: Search in title/content
  - status: Open|Resolved|Closed
  - sortBy: newest|oldest|mostCommented|mostViewed|mostLiked
  - page: Page number (default: 1)
  - limit: Items per page (default: 10)

Response: 200 OK
{
  "success": true,
  "data": [ discussion array ],
  "pagination": {
    "total": 42,
    "page": 1,
    "pages": 5,
    "limit": 10
  }
}
```

### **3. Get Single Discussion**
```
GET /api/discussions/:id

Response: 200 OK
{
  "success": true,
  "data": { discussion object with all comments }
}
```

### **4. Update Discussion**
```
PUT /api/discussions/:id

Headers:
  x-user-id: userId (must be author)

Body:
{
  "title": "Updated title",
  "content": "Updated content",
  "category": "Question",
  "status": "Resolved"
}

Response: 200 OK
```

### **5. Delete Discussion**
```
DELETE /api/discussions/:id

Auth: x-user-id must be author

Response: 200 OK
```

### **6. Add Comment**
```
POST /api/discussions/:id/comments

Headers:
  x-user-id: userId
  x-user-name: userName

Body:
{
  "content": "Great question! I found the answer..."
}

Response: 201 Created
```

### **7. Edit Comment**
```
PUT /api/discussions/:id/comments/:commentId

Headers:
  x-user-id: userId (must be author)

Body:
{
  "content": "Updated comment content"
}

Response: 200 OK
```

### **8. Like/Unlike Discussion**
```
PUT /api/discussions/:id/like

Headers:
  x-user-id: userId

Response: 200 OK
{
  "success": true,
  "data": {
    "likes": 5,
    "liked": true
  }
}
```

### **9. Like/Unlike Comment**
```
PUT /api/discussions/:id/comments/:commentId/like

Headers:
  x-user-id: userId

Response: 200 OK
```

### **10. Search Discussions**
```
GET /api/discussions/search?q=react&communityId=1&limit=20

Query Parameters:
  - q: Search query (required)
  - communityId: Restrict to community (optional)
  - limit: Max results (default: 20)

Response: 200 OK
{
  "success": true,
  "data": [ matching discussions ],
  "count": 3
}
```

### **11. Get Trending Discussions**
```
GET /api/discussions/trending?communityId=1&limit=5

Query Parameters:
  - communityId: Restrict to community
  - limit: Max results (default: 5)

Response: 200 OK
{
  "success": true,
  "data": [ trending discussions ]
}
```

---

## ✅ Features Implemented

### **1. Full CRUD Operations**
- ✅ Create discussions with validation
- ✅ Read discussions (single, all, filtered)
- ✅ Update discussions (author only)
- ✅ Delete discussions (author only)

### **2. Comment System**
- ✅ Add comments
- ✅ Edit comments (author only)
- ✅ View all comments
- ✅ Like/unlike comments

### **3. Search & Filtering**
- ✅ Search by keyword in title, content, tags
- ✅ Filter by community
- ✅ Filter by category
- ✅ Filter by status
- ✅ Multiple sort options

### **4. Pagination**
- ✅ Page-based pagination
- ✅ Configurable page size
- ✅ Total count included
- ✅ Validation for page/limit

### **5. Likes System**
- ✅ Like/unlike discussions
- ✅ Like/unlike comments
- ✅ Like count tracking
- ✅ User tracking (who liked)

### **6. View Tracking**
- ✅ View count per discussion
- ✅ Track unique viewers
- ✅ Increment on fetch

### **7. Input Validation**
- ✅ Title validation (5-200 chars)
- ✅ Content validation (10-5000 chars)
- ✅ Category validation (enum check)
- ✅ Comment validation (1-5000 chars)
- ✅ Community required validation
- ✅ Detailed error responses

### **8. Authorization**
- ✅ Author-only edit
- ✅ Author-only delete
- ✅ Author-only comment edit
- ✅ User identification via headers

### **9. Sorting Options**
- ✅ Newest first
- ✅ Oldest first
- ✅ Most commented
- ✅ Most viewed
- ✅ Most liked

### **10. Trending**
- ✅ Sort by likes, views, creation date
- ✅ Limit results
- ✅ Community-specific trending

---

## 📝 Validation Rules

### **Discussion Title**
```
- Required
- Minimum: 5 characters
- Maximum: 200 characters
- Error: "Title must be between 5 and 200 characters"
```

### **Discussion Content**
```
- Required  
- Minimum: 10 characters
- Maximum: 5000 characters
- Error: "Content must be between 10 and 5000 characters"
```

### **Category**
```
- Required
- Allowed: Study Group, Project, Question, Announcement, Resource, General
- Error: "Invalid category selected"
```

### **Comment Content**
```
- Required
- Minimum: 1 character
- Maximum: 5000 characters
- Error: "Comment cannot be empty or exceed 5000 characters"
```

### **Pagination**
```
- Page: ≥ 1, default 1
- Limit: 1-100, default 10
- Error: "Page must be ≥ 1, Limit must be 1-100"
```

---

## 🔐 Authentication

All endpoints require these headers:
```
x-user-id: userId (required)
x-user-name: userName (required)
x-user-university: university (optional)
x-user-role: student|admin|teacher (optional)
```

**Frontend Service** handles this automatically via `getAuthHeaders()`

---

## 🛠️ Error Handling

### **Error Response Format**
```json
{
  "success": false,
  "error": "Error message"
}
```

### **Common Error Codes**

| Code | Scenario |
|------|----------|
| 400 | Validation failed, bad request |
| 403 | Not authorized (not author) |
| 404 | Discussion/comment not found |
| 500 | Server error |

---

## 📲 Frontend Integration

### **Usage Example**
```javascript
import { discussionAPI } from '@/services/discussionAPI';

// Create discussion
const result = await discussionAPI.createDiscussion({
  title: 'My Discussion',
  content: 'Discussion content...',
  communityId: '1',
  communityName: 'CS',
  category: 'Question',
  tags: ['react', 'javascript']
});

// Get discussions
const discussions = await discussionAPI.getDiscussions({
  communityId: '1',
  sortBy: 'newest',
  page: 1,
  limit: 10
});

// Add comment
const comment = await discussionAPI.addComment(discussionId, 'My comment');

// Like discussion
await discussionAPI.likeDiscussion(discussionId);

// Search
const results = await discussionAPI.searchDiscussions('react');
```

---

## 🗄️ Database Schema

### **Discussion Fields**
```
- title: String (required, 5-200 chars)
- content: String (required, 10-5000 chars)
- author: String (required)
- authorId: String (required)
- communityId: String (required)
- communityName: String (required)
- category: enum of 6 options
- tags: String[] (optional)
- status: enum (Open, Resolved, Closed)
- comments: Comment[] (sub-documents)
- likes: Number
- likedBy: String[] (user IDs)
- views: Number
- viewedBy: String[] (user IDs)
- isPinned: Boolean
- createdAt: Date
- updatedAt: Date
```

### **Comment Fields**
```
- author: String
- authorId: String
- content: String (1-5000 chars)
- timestamp: Date
- likes: Number
- likedBy: String[]
```

---

## 🔍 Database Indexes

Optimized for performance:
```
- createdAt: -1 (newest first)
- likes: -1 (most liked)
- category: 1 (filtering)
- tags: 1 (tag search)
- communityId: 1 (community filter)
```

---

## 🧪 Testing API

### **Using cURL**
```bash
# Create discussion
curl -X POST http://localhost:5000/api/discussions \
  -H "Content-Type: application/json" \
  -H "x-user-id: user1" \
  -H "x-user-name: John Doe" \
  -d '{
    "title": "Test Discussion",
    "content": "This is test content for my discussion",
    "communityId": "1",
    "communityName": "CS",
    "category": "Question",
    "tags": ["test"]
  }'

# Get discussions
curl http://localhost:5000/api/discussions \
  -H "x-user-id: user1"

# Add comment
curl -X POST http://localhost:5000/api/discussions/DISCUSSION_ID/comments \
  -H "Content-Type: application/json" \
  -H "x-user-id: user1" \
  -H "x-user-name: John Doe" \
  -d '{"content": "This is a comment"}'
```

---

## 📊 Performance Optimizations

1. **Database Indexes**: Faster queries
2. **Pagination**: Limit data retrieval
3. **Partial Comments**: List view shows only first 3 comments
4. **Query Selection**: Only fetch needed fields
5. **Query Caching**: Reuse API results in frontend

---

## 🚀 Future Enhancements

- [ ] Real-time updates (WebSockets)
- [ ] Email notifications
- [ ] User reputation system
- [ ] Discussion moderation
- [ ] File attachments
- [ ] Markdown support
- [ ] Threading for comments
- [ ] Discussion analytics

---

## 📚 Files Summary

| File | Purpose | Lines |
|------|---------|-------|
| discussion.model.js | Schema + indexes | ~150 |
| discussion.controller.js | API logic | ~400 |
| discussion.routes.js | API routes | ~30 |
| errorHandler.js | Error handling | ~50 |
| validation.js | Input validation | ~80 |
| discussionAPI.js | Frontend service | ~270 |

**Total**: ~980 lines of new code

---

## ✨ Status

✅ **All Backend APIs Created**  
✅ **All Frontend Service Methods**  
✅ **Complete Validation**  
✅ **Error Handling**  
✅ **Database Optimization**  
✅ **Ready for Integration**

---

**Created**: April 7, 2026  
**Component**: Discussion Board Module  
**Owner**: Lochana  
**Status**: ✅ PRODUCTION READY
