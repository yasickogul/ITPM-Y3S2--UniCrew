/**
 * AI Assistant Component
 * Shows AI-powered insights, recommendations, and suggestions
 */

import { useEffect, useState } from 'react';
import { aiAPI } from '@/services/aiAPI';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

type ApiResponse<T> = {
  success?: boolean;
  data: T;
  message?: string;
  error?: string;
};

interface AIQuality {
  score: number;
  quality: string;
  feedback: string[];
}

interface AIComplexity {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  wordCount: number;
  technicalTerms: number;
}

interface AIStats {
  views: number;
  likes: number;
  comments: number;
}

interface AIInsightsData {
  quality: AIQuality;
  complexity: AIComplexity;
  summary?: string;
  stats: AIStats;
}

interface AIImpactData {
  score: number;
  impact: 'Low' | 'Medium' | 'High';
}

interface SimilarDiscussion {
  _id: string;
  title: string;
  category: string;
  similarity?: number;
  recommendationScore?: number;
}

interface CategoryRecommendation {
  recommended: string;
  confidence: number;
}

interface ModerationIssue {
  type: string;
  severity: 'low' | 'medium' | 'high';
  message: string;
}

interface ModerationResult {
  isClean: boolean;
  issues: ModerationIssue[];
}

interface AIAssistantProps {
  discussionId?: string;
  content?: string;
  title?: string;
}

interface AIPreSubmissionHelperProps {
  onCategoryChange?: (category: string) => void;
  onTagsGenerated?: (tags: string[]) => void;
}

export const AIAssistant = ({ discussionId }: AIAssistantProps) => {
  const [insights, setInsights] = useState<AIInsightsData | null>(null);
  const [recommendations, setRecommendations] = useState<SimilarDiscussion[]>([]);
  const [impactScore, setImpactScore] = useState<AIImpactData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!discussionId) return;

    const loadInsights = async () => {
      setLoading(true);
      try {
        const [insightsRes, impactRes, recommendRes] = (await Promise.all([
          aiAPI.getInsights(discussionId),
          aiAPI.getImpactScore(discussionId),
          aiAPI.findSimilar(discussionId),
        ])) as [
          ApiResponse<AIInsightsData>,
          ApiResponse<AIImpactData>,
          ApiResponse<SimilarDiscussion[]>
        ];

        setInsights(insightsRes.data);
        setImpactScore(impactRes.data);
        setRecommendations(recommendRes.data || []);
      } catch (error) {
        console.error('Error loading insights:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadInsights();
  }, [discussionId]);

  return (
    <div className="w-full space-y-4">
      {insights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              AI Insights
              <Badge variant="secondary">{insights.quality.quality}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-semibold">Content Quality</h4>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${insights.quality.score}%` }}
                />
              </div>
              <p className="mt-1 text-sm text-gray-600">Score: {insights.quality.score}/100</p>
              {insights.quality.feedback.length > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                  {insights.quality.feedback.slice(0, 3).map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold">Complexity Level</h4>
              <Badge
                variant="outline"
                className={
                  insights.complexity.level === 'Beginner'
                    ? 'bg-green-100'
                    : insights.complexity.level === 'Intermediate'
                      ? 'bg-yellow-100'
                      : 'bg-red-100'
                }
              >
                {insights.complexity.level}
              </Badge>
              <p className="mt-2 text-sm text-gray-600">
                Word Count: {insights.complexity.wordCount} | Technical Terms: {insights.complexity.technicalTerms}
              </p>
            </div>

            {impactScore && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">Discussion Impact</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full ${
                          impactScore.score >= 70
                            ? 'bg-green-600'
                            : impactScore.score >= 40
                              ? 'bg-yellow-600'
                              : 'bg-red-600'
                        }`}
                        style={{ width: `${impactScore.score}%` }}
                      />
                    </div>
                  </div>
                  <Badge>{impactScore.impact}</Badge>
                </div>
              </div>
            )}

            <div>
              <h4 className="mb-2 text-sm font-semibold">Engagement</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center">
                  <p className="text-gray-600">Views</p>
                  <p className="font-bold">{insights.stats.views}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Likes</p>
                  <p className="font-bold">{insights.stats.likes}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Comments</p>
                  <p className="font-bold">{insights.stats.comments}</p>
                </div>
              </div>
            </div>

            {insights.summary && (
              <div>
                <h4 className="mb-2 text-sm font-semibold">AI Summary</h4>
                <p className="text-sm italic text-gray-700">{insights.summary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Similar Discussions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((rec) => {
                const similarityScore = Math.round(rec.similarity ?? rec.recommendationScore ?? 0);

                return (
                  <div
                    key={rec._id}
                    className="cursor-pointer rounded-lg bg-gray-50 p-3 transition hover:bg-gray-100"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="line-clamp-2 text-sm font-medium">{rec.title}</h5>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {similarityScore}%
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-600">{rec.category}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {loading && <div className="py-4 text-center text-sm text-gray-600">Loading AI insights...</div>}
    </div>
  );
};

/**
 * AI Pre-submission Assistant
 * Helps users improve their discussion before posting
 */
export const AIPreSubmissionHelper = ({
  onCategoryChange,
  onTagsGenerated,
}: AIPreSubmissionHelperProps) => {
  const [title] = useState('');
  const [content] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quality, setQuality] = useState<AIQuality | null>(null);
  const [categoryRec, setCategoryRec] = useState<CategoryRecommendation | null>(null);
  const [moderation, setModeration] = useState<ModerationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeContent = async () => {
    if (!title || !content) return;

    setLoading(true);
    try {
      const [qualRes, catRes, modRes] = (await Promise.all([
        aiAPI.analyzeQuality(title, content),
        aiAPI.recommendCategory(title, content),
        aiAPI.checkModeration(title, content),
      ])) as [
        ApiResponse<AIQuality>,
        ApiResponse<CategoryRecommendation>,
        ApiResponse<ModerationResult>
      ];

      setQuality(qualRes.data);
      setCategoryRec(catRes.data);
      setModeration(modRes.data);

      if (catRes.data.confidence > 60 && onCategoryChange) {
        setSelectedCategory(catRes.data.recommended);
        onCategoryChange(catRes.data.recommended);
      }
    } catch (error) {
      console.error('Error analyzing:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSmartTags = async () => {
    if (!title || !content || !selectedCategory) return;

    try {
      const tagsRes = (await aiAPI.generateTags(title, content, selectedCategory)) as ApiResponse<{ tags: string[] }>;
      if (onTagsGenerated) {
        onTagsGenerated(tagsRes.data.tags);
      }
    } catch (error) {
      console.error('Error generating tags:', error);
    }
  };

  return (
    <div className="w-full space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <h3 className="flex items-center gap-2 font-semibold">AI Writing Assistant</h3>

      <Button onClick={analyzeContent} disabled={!title || !content} size="sm">
        Analyze My Post
      </Button>

      {quality && (
        <Alert className={quality.score >= 70 ? 'bg-green-50' : 'bg-yellow-50'}>
          <AlertDescription>
            <p className="mb-2 font-semibold">Quality: {quality.quality}</p>
            <p className="text-sm">Score: {quality.score}/100</p>
            {quality.feedback.length > 0 && (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {quality.feedback.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            )}
          </AlertDescription>
        </Alert>
      )}

      {moderation && !moderation.isClean && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription>
            <p className="mb-2 text-sm font-semibold text-red-800">Content Moderation Flags</p>
            {moderation.issues.map((issue, i) => (
              <p key={i} className="text-sm text-red-700">
                {issue.message}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {categoryRec && (
        <div className="rounded border bg-white p-2 text-sm">
          <p className="font-semibold">Recommended Category</p>
          <Badge className="mt-1">
            {categoryRec.recommended} ({categoryRec.confidence}% confidence)
          </Badge>
        </div>
      )}

      {selectedCategory && (
        <Button onClick={generateSmartTags} variant="outline" size="sm">
          Generate Smart Tags
        </Button>
      )}

      {loading && <p className="text-sm italic text-gray-600">AI is analyzing...</p>}
    </div>
  );
};

export default AIAssistant;
