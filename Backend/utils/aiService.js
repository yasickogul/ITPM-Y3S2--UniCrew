/**
 * AI Service
 * Provides AI-powered features for discussions
 * Includes: content analysis, recommendations, moderation, summarization, etc.
 */

// Content quality analyzer
const analyzeContentQuality = (title, content) => {
  let score = 0;
  const feedback = [];

  // Title analysis
  if (title.length >= 10 && title.length <= 100) score += 20;
  else feedback.push('Title should be 10-100 characters for better visibility');

  if (title.match(/[A-Z]/)) score += 10;
  else feedback.push('Use capital letters in your title for professionalism');

  // Content analysis
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 30 && wordCount <= 500) score += 25;
  else if (wordCount < 30) feedback.push('Your content is quite brief. Add more details for better engagement');

  // Engagement indicators
  if (content.match(/\?/g)) score += 10;
  else feedback.push('Consider adding questions to encourage discussion');

  if (content.match(/[!.]/g)?.length >= 2) score += 10;
  else feedback.push('Add more punctuation variety to improve readability');

  // Professional tone
  const professionalWords = (content.match(/\b(analyze|implement|discuss|research|develop|improve|optimize)\b/gi) || []).length;
  if (professionalWords >= 2) score += 15;
  else feedback.push('Use more professional/technical terms for academic discussions');

  // Hashtag/Topic analysis
  if (content.match(/#\w+/g)) score += 10;
  else feedback.push('Consider adding hashtags to improve discoverability');

  return {
    score: Math.min(score, 100),
    quality: score >= 70 ? 'Excellent' : score >= 50 ? 'Good' : score >= 30 ? 'Fair' : 'Needs Improvement',
    feedback,
  };
};

// Smart category recommendation
const recommendCategory = (title, content, tags = []) => {
  const text = `${title} ${content} ${tags.join(' ')}`.toLowerCase();

  const categoryKeywords = {
    'Study Group': ['study', 'group', 'learn', 'tutorial', 'course', 'class', 'subject', 'exam', 'notes'],
    Project: ['project', 'build', 'develop', 'code', 'github', 'repository', 'implementation', 'deploy'],
    Question: ['how', 'why', 'what', 'problem', 'error', 'bug', 'help', 'support', 'issue', 'question'],
    Announcement: ['announce', 'update', 'news', 'important', 'notice', 'event', 'deadline', 'reminder'],
    Resource: ['resource', 'link', 'tool', 'framework', 'library', 'documentation', 'guide', 'article'],
    General: ['general', 'discussion', 'thought', 'opinion', 'share', 'community'],
  };

  const scores = {};

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const matches = keywords.filter((keyword) => text.includes(keyword)).length;
    scores[category] = matches;
  }

  const recommendedCategory = Object.keys(scores).reduce((a, b) => (scores[a] > scores[b] ? a : b));
  const confidence = Math.min((scores[recommendedCategory] / 3) * 100, 100);

  return {
    recommended: recommendedCategory,
    confidence: Math.round(confidence),
    allScores: scores,
  };
};

// Content moderation (detect potentially inappropriate content)
const moderateContent = (content, title = '') => {
  const flaggedWords = ['spam', 'inappropriate', 'hate', 'abuse'];
  const issues = [];

  const fullText = `${title} ${content}`.toLowerCase();

  // Check for spam patterns
  if ((content.match(/\b\w+\b/g) || []).some((word) => word.length > 50)) {
    issues.push({
      type: 'spam',
      severity: 'medium',
      message: 'Unusually long words detected - possible spam',
    });
  }

  // Check for excessive capitalization
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (capsRatio > 0.3) {
    issues.push({
      type: 'tone',
      severity: 'low',
      message: 'Excessive capitalization detected - try to tone it down',
    });
  }

  // Check for excessive punctuation
  const punctRatio = (content.match(/[!?\-\*]/g) || []).length / content.length;
  if (punctRatio > 0.1) {
    issues.push({
      type: 'tone',
      severity: 'low',
      message: 'Excessive punctuation - consider editing for clarity',
    });
  }

  // Check for links (potential spam)
  const linkCount = (content.match(/https?:\/\/\S+/g) || []).length;
  if (linkCount > 3) {
    issues.push({
      type: 'spam',
      severity: 'high',
      message: 'Multiple links detected - please limit promotional content',
    });
  }

  return {
    isClean: issues.length === 0,
    severity: issues.length > 0 ? Math.max(...issues.map((i) => (i.severity === 'high' ? 3 : i.severity === 'medium' ? 2 : 1))) : 0,
    issues,
  };
};

// AI Summarization
const summarizeContent = (content) => {
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
  if (sentences.length <= 2) return content;

  // Extract key sentences (usually 1st, middle, and last)
  const importantSentences = [];
  importantSentences.push(sentences[0]); // First sentence

  if (sentences.length > 2) {
    const middleIndex = Math.floor(sentences.length / 2);
    importantSentences.push(sentences[middleIndex]);
  }

  if (sentences.length > 1) {
    importantSentences.push(sentences[sentences.length - 1]); // Last sentence
  }

  return importantSentences.map((s) => s.trim()).join(' ');
};

// Generate smart discussion tags
const generateSmartTags = (title, content, category) => {
  const words = `${title} ${content}`.toLowerCase().split(/\s+/);

  // Filter meaningful words (length > 3, not common stop words)
  const stopWords = [
    'the',
    'and',
    'or',
    'but',
    'for',
    'with',
    'from',
    'that',
    'this',
    'what',
    'when',
    'where',
    'why',
    'how',
    'about',
    'would',
    'could',
    'should',
    'have',
    'having',
  ];

  const meaningfulWords = words
    .filter((word) => word.length > 3 && !stopWords.includes(word))
    .filter((word, index, self) => self.indexOf(word) === index) // Remove duplicates
    .slice(0, 8);

  const categoryTag = category.toLowerCase().replace(/\s+/g, '-');

  return [...new Set([categoryTag, ...meaningfulWords])].slice(0, 10);
};

// Discussion complexity scoring
const calculateComplexity = (content, commentsCount = 0) => {
  const wordCount = content.split(/\s+/).length;
  const sentenceCount = (content.match(/[.!?]+/g) || []).length || 1;
  const technicalTerms = (content.match(/\b(algorithm|architecture|optimization|framework|protocol|paradigm|interface|abstract|inheritance|polymorphism)\b/gi) || []).length;

  // Calculate complexity score
  let score = 0;

  if (wordCount > 200) score += 15;
  if (wordCount > 500) score += 15;

  if (technicalTerms > 2) score += 20;
  if (technicalTerms > 5) score += 10;

  if (commentsCount > 3) score += 10;
  if (commentsCount > 10) score += 10;

  const avgWordsPerSentence = wordCount / sentenceCount;
  if (avgWordsPerSentence > 15) score += 15;

  return {
    score: Math.min(score, 100),
    level: score >= 70 ? 'Advanced' : score >= 50 ? 'Intermediate' : 'Beginner',
    wordCount,
    technicalTerms,
  };
};

// Find similar discussions (AI-powered)
const findSimilarityScore = (doc1, doc2) => {
  const words1 = new Set(doc1.toLowerCase().split(/\s+/));
  const words2 = new Set(doc2.toLowerCase().split(/\s+/));

  const intersection = new Set([...words1].filter((x) => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  return (intersection.size / union.size) * 100;
};

// Personalized recommendation based on user activity
const getRecommendations = (userProfile, allDiscussions) => {
  const recommendations = [];

  for (const discussion of allDiscussions) {
    let score = 0;

    // Match by category preference
    if (userProfile.favoriteCategories?.includes(discussion.category)) {
      score += 30;
    }

    // Match by community
    if (userProfile.communities?.includes(discussion.communityId)) {
      score += 25;
    }

    // Match by tags
    const tagMatches = (userProfile.interests || []).filter((tag) => discussion.tags?.includes(tag)).length;
    score += tagMatches * 10;

    // Boost trending discussions
    if (discussion.likes > 5 || discussion.views > 20) {
      score += 15;
    }

    if (score > 0) {
      recommendations.push({
        ...discussion,
        recommendationScore: Math.min(score, 100),
      });
    }
  }

  return recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 5);
};

// Discussion impact score
const calculateImpactScore = (discussion) => {
  let score = 0;

  // Engagement metrics
  score += Math.min(discussion.likes * 5, 30);
  score += Math.min(discussion.views / 2, 25);
  score += Math.min(discussion.comments?.length * 8, 25);

  // Time decay (newer discussions score higher)
  const daysOld = (Date.now() - new Date(discussion.createdAt)) / (1000 * 60 * 60 * 24);
  const timeScore = Math.max(20 - daysOld * 0.5, 0);
  score += timeScore;

  return {
    score: Math.round(Math.min(score, 100)),
    impact: score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low',
    breakdown: {
      engagement: Math.min(discussion.likes * 5 + discussion.comments?.length * 8, 55),
      reach: Math.min(discussion.views / 2, 25),
      relevance: timeScore,
    },
  };
};

module.exports = {
  analyzeContentQuality,
  recommendCategory,
  moderateContent,
  summarizeContent,
  generateSmartTags,
  calculateComplexity,
  findSimilarityScore,
  getRecommendations,
  calculateImpactScore,
};
