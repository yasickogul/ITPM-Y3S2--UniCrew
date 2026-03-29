import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { mockCommunities } from '../../data/mockData';

export default function CommunityManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    faculty: '',
    year: 'All Years',
  });
  const [errors, setErrors] = useState({
    name: '',
    description: '',
    faculty: '',
  });
  const [communities, setCommunities] = useState(() =>
    mockCommunities.map((c) => ({ ...c }))
  );
  const [editId, setEditId] = useState(null);

  const validate = () => {
    const newErrors = { name: '', description: '', faculty: '' };
    if (!formData.name.trim()) {
      newErrors.name = 'Community name is required.';
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Community name must not contain numbers or special characters.';
    }
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (!formData.faculty) newErrors.faculty = 'Faculty is required.';
    setErrors(newErrors);
    return !newErrors.name && !newErrors.description && !newErrors.faculty;
  };

  // CREATE
  const handleCreate = () => {
    if (!validate()) return;
    const newCommunity = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      faculty: formData.faculty,
      year: formData.year,
      memberCount: 0,
    };
    setCommunities([newCommunity, ...communities]);
    setIsCreateOpen(false);
    setFormData({ name: '', description: '', faculty: '', year: 'All Years' });
    setErrors({ name: '', description: '', faculty: '' });
  };

  // UPDATE
  const openEdit = (community) => {
    setEditId(community.id);
    setFormData({
      name: community.name,
      description: community.description,
      faculty: community.faculty,
      year: community.year || 'All Years',
    });
    setIsEditOpen(true);
    setErrors({ name: '', description: '', faculty: '' });
  };

  const handleEdit = () => {
    if (!validate()) return;
    setCommunities(
      communities.map((c) =>
        c.id === editId
          ? { ...c, name: formData.name, description: formData.description, faculty: formData.faculty, year: formData.year }
          : c
      )
    );
    setIsEditOpen(false);
    setEditId(null);
    setFormData({ name: '', description: '', faculty: '', year: 'All Years' });
    setErrors({ name: '', description: '', faculty: '' });
  };

  // DELETE
  const handleDelete = (id) => {
    setCommunities(communities.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community Management</h1>
          <p className="text-gray-600">Create and manage student communities</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Community
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Community</DialogTitle>
              <DialogDescription>
                Add a new community for students to join
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Community Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Computer Science Society"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the community's purpose..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Faculty *</Label>
                  <Select value={formData.faculty} onValueChange={(value) => setFormData({ ...formData, faculty: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Science">Science</SelectItem>
                      <SelectItem value="Arts">Arts</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.faculty && <p className="text-red-500 text-xs mt-1">{errors.faculty}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Year Level</Label>
                  <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Years">All Years</SelectItem>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={handleCreate} className="flex-1">Create Community</Button>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Communities</CardTitle>
          <CardDescription>Manage existing communities</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Faculty</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {communities.map((community) => (
                <TableRow key={community.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{community.name}</p>
                      <p className="text-sm text-gray-600">{community.description.slice(0, 50)}...</p>
                    </div>
                  </TableCell>
                  <TableCell>{community.faculty}</TableCell>
                  <TableCell>{community.memberCount}</TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(community)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(community.id)}>
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) setEditId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Community</DialogTitle>
            <DialogDescription>Update the community details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Community Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Computer Science Society"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe the community's purpose..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Faculty *</Label>
                <Select value={formData.faculty} onValueChange={(value) => setFormData({ ...formData, faculty: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                  </SelectContent>
                </Select>
                {errors.faculty && <p className="text-red-500 text-xs mt-1">{errors.faculty}</p>}
              </div>
              <div className="space-y-2">
                <Label>Year Level</Label>
                <Select value={formData.year} onValueChange={(value) => setFormData({ ...formData, year: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Years">All Years</SelectItem>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={handleEdit} className="flex-1">Save Changes</Button>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
