import { useParams } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { Github, Linkedin, Mail, MessageSquare } from 'lucide-react';
import { mockStudents, mockCommunities } from '../../data/mockData';

export default function StudentProfile() {
  const { id } = useParams();
  const student = mockStudents.find((s) => s.id === id);

  if (!student) {
    return <div>Student not found</div>;
  }

  const sharedCommunities = mockCommunities.slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-32 h-32">
              <AvatarImage src={student.avatar} />
              <AvatarFallback className="text-3xl">{student.name.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <p className="text-gray-600">{student.degree} • Year {student.year}</p>
                <p className="text-sm text-gray-500">{student.studentId}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                {student.email}
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      {student.about && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{student.about}</p>
          </CardContent>
        </Card>
      )}

      {/* Skills */}
      {student.skills && student.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skills & Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {student.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Social Profiles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {student.linkedin && (
            <a
              href={student.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn Profile
            </a>
          )}
          {student.github && (
            <a
              href={student.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:underline"
            >
              <Github className="w-4 h-4" />
              GitHub Profile
            </a>
          )}
          {!student.linkedin && !student.github && (
            <p className="text-gray-600">No social profiles available</p>
          )}
        </CardContent>
      </Card>

      {/* Shared Communities */}
      <Card>
        <CardHeader>
          <CardTitle>Shared Communities</CardTitle>
          <CardDescription>Communities you both are part of</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sharedCommunities.map((community) => (
            <div key={community.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{community.name}</p>
                <p className="text-sm text-gray-600">{community.memberCount} members</p>
              </div>
              <Badge variant="outline">{community.faculty}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
