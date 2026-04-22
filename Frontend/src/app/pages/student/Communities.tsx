import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Users, Search } from 'lucide-react';
import { communityService } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';

interface Community {
  _id: string;
  name: string;
  description: string;
  faculty: string;
  year: string;
  banner?: string;
  members: string[];
  universityName: string;
}

export default function Communities() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.universityId) {
      fetchCommunities();
    }
  }, [user?.universityId]);

  const fetchCommunities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await communityService.getAll({ universityId: user?.universityId });
      setCommunities(Array.isArray(response) ? response : []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load communities';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error loading communities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCommunities = communities.filter((community) => {
    const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         community.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFaculty = filterFaculty === 'all' || community.faculty === filterFaculty;
    const matchesYear = filterYear === 'all' || community.year === filterYear;
    return matchesSearch && matchesFaculty && matchesYear;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Communities</h1>
        <p className="text-gray-600">Discover and join communities that match your interests</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterFaculty} onValueChange={setFilterFaculty}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by faculty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Faculties</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
            <SelectItem value="Business">Business</SelectItem>
            <SelectItem value="Science">Science</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterYear} onValueChange={setFilterYear}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            <SelectItem value="1">1st Year</SelectItem>
            <SelectItem value="2">2nd Year</SelectItem>
            <SelectItem value="3">3rd Year</SelectItem>
            <SelectItem value="4">4th Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading communities...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <Button onClick={fetchCommunities} size="sm" className="mt-2">
            Retry
          </Button>
        </div>
      )}

      {/* Community Cards */}
      {!isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map((community) => (
            <Card key={community._id} className="overflow-hidden">
              <div
                className="h-32 bg-cover bg-center bg-gradient-to-r from-blue-500 to-indigo-600"
                style={{ backgroundImage: community.banner ? `url(${community.banner})` : undefined }}
              />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  {community.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {community.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {community.faculty}
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                    {community.year === 'All Years' ? 'All Years' : `Year ${community.year}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{community.members.length} members</span>
                  <Link to={`/communities/${community._id}`}>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredCommunities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No communities found matching your criteria</p>
        </div>
      )}
    </div>
  );
}
