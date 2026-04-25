import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminService } from '../../services/api';
import { toast } from 'sonner';

export default function ReportedPosts() {
  const [reports, setReports] = useState<any[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReportedPosts = async () => {
    try {
      const data = await adminService.getReportedPosts();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch reported posts');
      setReports([]);
    }
  };

  useEffect(() => {
    fetchReportedPosts();
  }, []);

  const removePost = async (id: string) => {
    try {
      setProcessingId(id);
      await adminService.rejectPost(id);
      toast.success('Post removed');
      setReports((prev) => prev.filter((report) => report._id !== id));
    } catch (error) {
      toast.error('Failed to remove post');
    } finally {
      setProcessingId(null);
    }
  };

  const dismissReport = async (id: string) => {
    try {
      setProcessingId(id);
      await adminService.dismissPostReport(id);
      toast.success('Report dismissed');
      setReports((prev) => prev.filter((report) => report._id !== id));
    } catch (error) {
      toast.error('Failed to dismiss report');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reported Posts</h1>
        <p className="text-gray-600">Review content flagged by students</p>
      </div>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Active Reports
          </CardTitle>
          <CardDescription>
            Posts flagged by community members with AI severity analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Post Title</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>AI Severity</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report._id}>
                  <TableCell>
                    <p className="font-medium">{report.title || 'Untitled post'}</p>
                  </TableCell>
                  <TableCell>{report.author || 'Unknown'}</TableCell>
                  <TableCell>{(report.aiAnalysis?.flagReasons || []).join(', ') || 'Flagged by moderation'}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="destructive"
                    >
                      High
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{new Date(report.createdAt).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={processingId === report._id}
                        onClick={() => removePost(report._id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Post
                      </Button>
                      <Button variant="outline" size="sm" disabled>
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Warn User
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={processingId === report._id}
                        onClick={() => dismissReport(report._id)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No reported posts found
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* AI Analysis Note */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">AI-Powered Content Moderation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">
            Reports are automatically analyzed using AI to determine severity levels. High-severity 
            reports require immediate attention, while medium-severity reports should be reviewed 
            within 24 hours. The system uses n8n workflows to trigger notifications for critical content.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
