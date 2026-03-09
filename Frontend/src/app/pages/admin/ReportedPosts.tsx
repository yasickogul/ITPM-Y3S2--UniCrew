import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { mockReportedPosts } from '../../data/mockData';

export default function ReportedPosts() {
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
              {mockReportedPosts.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <p className="font-medium">{report.postTitle}</p>
                  </TableCell>
                  <TableCell>{report.reportedBy}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={report.aiSeverity === 'High' ? 'destructive' : 'default'}
                      className={report.aiSeverity === 'Medium' ? 'bg-orange-500' : ''}
                    >
                      {report.aiSeverity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">{report.timestamp}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove Post
                      </Button>
                      <Button variant="outline" size="sm">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Warn User
                      </Button>
                      <Button variant="ghost" size="sm">
                        <X className="w-4 h-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
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
