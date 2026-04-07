import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Plus, RotateCw } from 'lucide-react';
import { mockUniversityAdmins, mockUniversities } from '../../data/mockData';

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

export default function AdminManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  const handleCreate = () => {
    const errors = validateAdminForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    // In real app, would create admin
    setIsCreateOpen(false);
    resetCreateForm();
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
                    {mockUniversities.map((university) => (
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
                <Button onClick={handleCreate} className="flex-1">Create Admin</Button>
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
              {mockUniversityAdmins.map((admin) => (
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
                    <Button variant="outline" size="sm">
                      <RotateCw className="w-4 h-4 mr-2" />
                      Reset Password
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
