import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { mockUniversities } from '../../data/mockData';

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

export default function UniversityManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    emailDomain: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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

  const handleCreate = () => {
    const errors = validateUniversityForm(formData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    // In real app, would create university (use normalizeEmailDomain(formData.emailDomain) for API)
    setIsCreateOpen(false);
    resetCreateForm();
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
                <Button onClick={handleCreate} className="flex-1">Add University</Button>
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
              {mockUniversities.map((university) => (
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
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
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
