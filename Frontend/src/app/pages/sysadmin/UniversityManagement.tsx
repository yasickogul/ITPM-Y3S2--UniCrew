import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050';

/** Accepts e.g. harvard.edu or @harvard.edu */
const DOMAIN_REGEX =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;
const UNIVERSITY_NAME_REGEX = /^[A-Za-z0-9 ]+$/;

function normalizeEmailDomain(raw: string) {
  let d = raw.trim().toLowerCase();
  if (d.startsWith('@')) d = d.slice(1);
  return d;
}

function validateUniversityForm(data: { name: string; emailDomain: string }) {
  const errors: Record<string, string> = {};
  const name = data.name.trim();
  if (!name) {
    errors.name = 'University name is required';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (name.length > 200) {
    errors.name = 'Name is too long';
  } else if (!UNIVERSITY_NAME_REGEX.test(name)) {
    errors.name = 'University name cannot contain special characters';
  }

  const domain = normalizeEmailDomain(data.emailDomain);
  if (!domain) {
    errors.emailDomain = 'Email domain is required';
  } else if (domain.length > 253) {
    errors.emailDomain = 'Domain is too long';
  } else if (!DOMAIN_REGEX.test(domain)) {
    errors.emailDomain = 'Enter a valid domain (e.g. harvard.edu)';
  }

  return errors;
}

type University = {
  id: string;
  name: string;
  emailDomain: string;
  status: string;
  totalStudents: number;
  totalCommunities: number;
};

export default function UniversityManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    emailDomain: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const fetchUniversities = async () => {
    setApiError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/universities`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Failed to load universities');
      }

      const items = (payload.data || []).map((university: any) => ({
        id: university._id,
        name: university.name,
        emailDomain: university.domain,
        status: 'Active',
        totalStudents: 0,
        totalCommunities: 0,
      }));

      setUniversities(items);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUniversities();
  }, []);

  const resetCreateForm = () => {
    setFormData({ name: '', emailDomain: '' });
    setFieldErrors({});
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      resetCreateForm();
    }
  };

  const handleCreate = async () => {
    const errors = validateUniversityForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/universities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          emailDomain: normalizeEmailDomain(formData.emailDomain),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Failed to create university');
      }

      setIsCreateOpen(false);
      resetCreateForm();
      fetchUniversities();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">University Management</h1>
          <p className="text-gray-600">Add and manage universities on the platform</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Add University
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New University</DialogTitle>
              <DialogDescription>
                Register a new university to the platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="uni-name">University Name *</Label>
                <Input
                  id="uni-name"
                  placeholder="e.g., Harvard University"
                  value={formData.name}
                  aria-invalid={!!fieldErrors.name}
                  className={fieldErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: '' }));
                  }}
                />
                {fieldErrors.name ? (
                  <p className="text-sm text-red-600">{fieldErrors.name}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-domain">Email Domain *</Label>
                <Input
                  id="email-domain"
                  placeholder="e.g., harvard.edu"
                  value={formData.emailDomain}
                  aria-invalid={!!fieldErrors.emailDomain}
                  className={fieldErrors.emailDomain ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  onChange={(e) => {
                    setFormData({ ...formData, emailDomain: e.target.value });
                    if (fieldErrors.emailDomain) setFieldErrors((prev) => ({ ...prev, emailDomain: '' }));
                  }}
                />
                <p className="text-sm text-gray-600">
                  Students will register using emails ending with this domain
                </p>
                {fieldErrors.emailDomain ? (
                  <p className="text-sm text-red-600">{fieldErrors.emailDomain}</p>
                ) : null}
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={handleCreate} className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add University'}
                </Button>
                <Button variant="outline" type="button" onClick={() => handleDialogOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Universities</CardTitle>
          <CardDescription>Manage registered universities</CardDescription>
        </CardHeader>
        <CardContent>
          {apiError ? (
            <p className="mb-4 text-sm text-red-600">{apiError}</p>
          ) : null}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>University Name</TableHead>
                <TableHead>Email Domain</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Communities</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    Loading universities...
                  </TableCell>
                </TableRow>
              ) : universities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    No universities yet
                  </TableCell>
                </TableRow>
              ) : (
                universities.map((university) => (
                  <TableRow key={university.id}>
                    <TableCell>
                      <p className="font-medium">{university.name}</p>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        @{university.emailDomain}
                      </code>
                    </TableCell>
                    <TableCell>{university.totalStudents.toLocaleString()}</TableCell>
                    <TableCell>{university.totalCommunities}</TableCell>
                    <TableCell>
                      <Badge variant="default">{university.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" disabled>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" disabled>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
