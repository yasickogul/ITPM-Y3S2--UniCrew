import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Plus, Edit, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { enhanceUniversityDescription } from '../../utils/geminiClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5050';

const DOMAIN_REGEX =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i;

function normalizeEmailDomain(raw: string) {
  let d = raw.trim().toLowerCase();
  if (d.startsWith('@')) d = d.slice(1);
  return d;
}

function getAuthToken() {
  return localStorage.getItem('unicrew.auth.token');
}

function authJsonHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getAuthToken() || ''}`,
  };
}

function validateUniversityForm(data: { name: string; emailDomain: string; description: string }) {
  const errors: Record<string, string> = {};
  const name = data.name.trim();
  if (!name) {
    errors.name = 'University name is required';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (name.length > 200) {
    errors.name = 'Name is too long';
  }

  const domain = normalizeEmailDomain(data.emailDomain);
  if (!domain) {
    errors.emailDomain = 'Email domain is required';
  } else if (domain.length > 253) {
    errors.emailDomain = 'Domain is too long';
  } else if (!DOMAIN_REGEX.test(domain)) {
    errors.emailDomain = 'Enter a valid domain (e.g. harvard.edu)';
  }

  if (data.description.length > 5000) {
    errors.description = 'Description must be at most 5000 characters';
  }

  return errors;
}

type University = {
  id: string;
  name: string;
  emailDomain: string;
  description: string;
  status: string;
  totalStudents: number;
  totalCommunities: number;
};

type AiTarget = 'create' | 'edit' | null;

export default function UniversityManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    emailDomain: '',
    description: '',
  });
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    emailDomain: '',
    description: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [apiError, setApiError] = useState('');

  const [aiTarget, setAiTarget] = useState<AiTarget>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

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
        description: university.description || '',
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
    setFormData({ name: '', emailDomain: '', description: '' });
    setFieldErrors({});
    setAiTarget(null);
    setAiPrompt('');
  };

  const handleCreateDialogOpenChange = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) {
      resetCreateForm();
    }
  };

  const openEdit = (u: University) => {
    setEditFormData({
      id: u.id,
      name: u.name,
      emailDomain: u.emailDomain,
      description: u.description || '',
    });
    setEditFieldErrors({});
    setAiTarget(null);
    setAiPrompt('');
    setIsEditOpen(true);
  };

  const handleEditDialogOpenChange = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      setEditFormData({ id: '', name: '', emailDomain: '', description: '' });
      setEditFieldErrors({});
      setAiTarget(null);
      setAiPrompt('');
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
        headers: authJsonHeaders(),
        body: JSON.stringify({
          name: formData.name.trim(),
          emailDomain: normalizeEmailDomain(formData.emailDomain),
          description: formData.description.trim(),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Failed to create university');
      }

      toast.success('University created');
      setIsCreateOpen(false);
      resetCreateForm();
      fetchUniversities();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Something went wrong');
      toast.error(error instanceof Error ? error.message : 'Create failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    const errors = validateUniversityForm(editFormData);
    if (Object.keys(errors).length > 0) {
      setEditFieldErrors(errors);
      return;
    }

    setIsEditSubmitting(true);
    setApiError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/universities/${editFormData.id}`, {
        method: 'PUT',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          name: editFormData.name.trim(),
          emailDomain: normalizeEmailDomain(editFormData.emailDomain),
          description: editFormData.description.trim(),
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || 'Failed to update university');
      }

      toast.success('University updated');
      setIsEditOpen(false);
      fetchUniversities();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Something went wrong');
      toast.error(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete university "${name}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    setApiError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/universities/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${getAuthToken() || ''}`,
        },
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message || 'Failed to delete university');
      }

      toast.success('University deleted');
      fetchUniversities();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Something went wrong');
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  const runAiEnhance = async () => {
    const prompt = aiPrompt.trim();
    if (!prompt) {
      toast.error('Enter a prompt for the AI');
      return;
    }

    const isCreate = aiTarget === 'create';
    const currentDescription = isCreate ? formData.description : editFormData.description;
    const universityName = isCreate ? formData.name.trim() : editFormData.name.trim();

    setIsAiLoading(true);
    try {
      const next = await enhanceUniversityDescription({
        currentDescription,
        userPrompt: prompt,
        universityName: universityName || undefined,
      });
      if (isCreate) {
        setFormData((prev) => ({ ...prev, description: next }));
        setFieldErrors((prev) => ({ ...prev, description: '' }));
      } else {
        setEditFormData((prev) => ({ ...prev, description: next }));
        setEditFieldErrors((prev) => ({ ...prev, description: '' }));
      }
      toast.success('Description updated from AI');
      setAiPrompt('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'AI enhance failed');
    } finally {
      setIsAiLoading(false);
    }
  };

  const descriptionField = (
    which: 'create' | 'edit',
    data: { name: string; emailDomain: string; description: string },
    setData: React.Dispatch<React.SetStateAction<typeof formData>>,
    errors: Record<string, string>,
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={which === 'create' ? 'uni-desc' : 'uni-desc-edit'}>Description</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => {
            setAiTarget(which);
            setAiPrompt('');
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          AI Enhance
        </Button>
      </div>
      <Textarea
        id={which === 'create' ? 'uni-desc' : 'uni-desc-edit'}
        placeholder="Short overview of the university (optional)"
        value={data.description}
        rows={4}
        className={`min-h-[100px] resize-y ${errors.description ? 'border-red-500' : ''}`}
        onChange={(e) => {
          const v = e.target.value;
          setData((prev) => ({ ...prev, description: v }));
          if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
        }}
      />
      {errors.description ? <p className="text-sm text-red-600">{errors.description}</p> : null}

      {aiTarget === which ? (
        <div className="rounded-md border bg-muted/40 p-3 space-y-2">
          <Label className="text-xs text-muted-foreground">Prompt for AI</Label>
          <Input
            placeholder="e.g. Make it more welcoming and mention STEM programs"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={runAiEnhance} disabled={isAiLoading}>
              {isAiLoading ? 'Generating…' : 'Generate'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setAiTarget(null)}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">University Management</h1>
          <p className="text-gray-600">Add and manage universities on the platform</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={handleCreateDialogOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Add University
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New University</DialogTitle>
              <DialogDescription>Register a new university to the platform</DialogDescription>
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
                {fieldErrors.name ? <p className="text-sm text-red-600">{fieldErrors.name}</p> : null}
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
              {descriptionField('create', formData, setFormData, fieldErrors, setFieldErrors)}
              <div className="flex gap-2 mt-6">
                <Button onClick={handleCreate} className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add University'}
                </Button>
                <Button variant="outline" type="button" onClick={() => handleCreateDialogOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditOpen} onOpenChange={handleEditDialogOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit University</DialogTitle>
            <DialogDescription>Update university name, email domain, and description</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="uni-name-edit">University Name *</Label>
              <Input
                id="uni-name-edit"
                value={editFormData.name}
                aria-invalid={!!editFieldErrors.name}
                className={editFieldErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, name: e.target.value });
                  if (editFieldErrors.name) setEditFieldErrors((prev) => ({ ...prev, name: '' }));
                }}
              />
              {editFieldErrors.name ? <p className="text-sm text-red-600">{editFieldErrors.name}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-domain-edit">Email Domain *</Label>
              <Input
                id="email-domain-edit"
                value={editFormData.emailDomain}
                aria-invalid={!!editFieldErrors.emailDomain}
                className={editFieldErrors.emailDomain ? 'border-red-500 focus-visible:ring-red-500' : ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, emailDomain: e.target.value });
                  if (editFieldErrors.emailDomain) setEditFieldErrors((prev) => ({ ...prev, emailDomain: '' }));
                }}
              />
              {editFieldErrors.emailDomain ? (
                <p className="text-sm text-red-600">{editFieldErrors.emailDomain}</p>
              ) : null}
            </div>
            {descriptionField('edit', editFormData, setEditFormData, editFieldErrors, setEditFieldErrors)}
            <div className="flex gap-2 mt-6">
              <Button onClick={handleUpdate} className="flex-1" disabled={isEditSubmitting}>
                {isEditSubmitting ? 'Saving...' : 'Save changes'}
              </Button>
              <Button variant="outline" type="button" onClick={() => handleEditDialogOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>All Universities</CardTitle>
          <CardDescription>Manage registered universities</CardDescription>
        </CardHeader>
        <CardContent>
          {apiError ? <p className="mb-4 text-sm text-red-600">{apiError}</p> : null}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>University Name</TableHead>
                <TableHead>Email Domain</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Communities</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    Loading universities...
                  </TableCell>
                </TableRow>
              ) : universities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
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
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">@{university.emailDomain}</code>
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {university.description || '—'}
                      </p>
                    </TableCell>
                    <TableCell>{university.totalStudents.toLocaleString()}</TableCell>
                    <TableCell>{university.totalCommunities}</TableCell>
                    <TableCell>
                      <Badge variant="default">{university.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" type="button" onClick={() => openEdit(university)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          disabled={deletingId === university.id}
                          onClick={() => handleDelete(university.id, university.name)}
                        >
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
