import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Plus, RotateCw } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[A-Za-z0-9 ]+$/;

function validateAdminForm(data: { name: string; email: string; university: string }) {
  const errors: Record<string, string> = {};
  const name = data.name.trim();
  if (!name) {
    errors.name = 'Full name is required';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (name.length > 120) {
    errors.name = 'Name is too long';
  } else if (!NAME_REGEX.test(name)) {
    errors.name = 'Name cannot contain special characters';
  }

  const email = data.email.trim().toLowerCase();
  if (!email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!data.university) {
    errors.university = 'Please select a university';
  }

  return errors;
}

type UniversityOption = {
  id: string;
  name: string;
};

type UniversityAdmin = {
  id: string;
  name: string;
  email: string;
  university: string;
  status: string;
};

export default function AdminManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [admins, setAdmins] = useState<UniversityAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const fetchPageData = async () => {
    setApiError('');
    setIsLoading(true);

    try {
      const [universitiesRes, adminsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/universities`),
        fetch(`${API_BASE_URL}/api/system-admin/university-admins`),
      ]);

      const universitiesPayload = await universitiesRes.json();
      const adminsPayload = await adminsRes.json();

      if (!universitiesRes.ok) {
        throw new Error(universitiesPayload.message || 'Failed to load universities');
      }

      if (!adminsRes.ok) {
        throw new Error(adminsPayload.message || 'Failed to load university admins');
      }

      const universityItems = (universitiesPayload.data || []).map((u: any) => ({
        id: u._id,
        name: u.name,
      }));

      const adminItems = (adminsPayload.data || []).map((admin: any) => ({
        id: admin._id,
        name: admin.fullName,
        email: admin.email,
        university: admin.university?.name || 'Unknown University',
        status: admin.status || 'Active',
      }));

      setUniversities(universityItems);
      setAdmins(adminItems);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const resetCreateForm = () => {
    setFormData({ name: '', email: '', university: '' });
    setFieldErrors({});
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      resetCreateForm();
    }
  };

  const handleCreate = async () => {
    const errors = validateAdminForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/system-admin/university-admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          assignedUniversity: formData.university,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Failed to create university admin');
      }

      setIsCreateOpen(false);
      resetCreateForm();
      fetchPageData();
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
          <h1 className="text-3xl font-bold">University Admin Management</h1>
          <p className="text-gray-600">Manage university administrators</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create University Admin</DialogTitle>
              <DialogDescription>
                Add a new administrator for a university
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="admin-name">Full Name *</Label>
                <Input
                  id="admin-name"
                  placeholder="Dr. John Doe"
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
                <Label htmlFor="admin-email">Email *</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@university.edu"
                  value={formData.email}
                  aria-invalid={!!fieldErrors.email}
                  className={fieldErrors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                  }}
                />
                {fieldErrors.email ? (
                  <p className="text-sm text-red-600">{fieldErrors.email}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label>Assigned University *</Label>
                <Select
                  value={formData.university}
                  onValueChange={(value) => {
                    setFormData({ ...formData, university: value });
                    if (fieldErrors.university) setFieldErrors((prev) => ({ ...prev, university: '' }));
                  }}
                >
                  <SelectTrigger className={fieldErrors.university ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((university) => (
                      <SelectItem key={university.id} value={university.id}>
                        {university.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.university ? (
                  <p className="text-sm text-red-600">{fieldErrors.university}</p>
                ) : null}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-gray-700">
                  A temporary password will be generated and sent to the admin's email address.
                </p>
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={handleCreate} className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Admin'}
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
          <CardTitle>All University Admins</CardTitle>
          <CardDescription>Manage administrator accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {apiError ? (
            <p className="mb-4 text-sm text-red-600">{apiError}</p>
          ) : null}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned University</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    Loading admins...
                  </TableCell>
                </TableRow>
              ) : admins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    No university admins yet
                  </TableCell>
                </TableRow>
              ) : (
                admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <p className="font-medium">{admin.name}</p>
                    </TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.university}</TableCell>
                    <TableCell>
                      <Badge variant="default">{admin.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" disabled>
                        <RotateCw className="w-4 h-4 mr-2" />
                        Reset Password
                      </Button>
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
