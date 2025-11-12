'use client';

import { useState, useEffect } from 'react';
import { AdminPageWrapper } from '@/components/AdminPageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Pencil, Search, ChevronLeft, ChevronRight, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Prompt {
  id: string;
  prompt_type: 'project' | 'recommended';
  prompt_text: string;
  project_id?: string;
  is_recommended?: boolean;
  tag?: string | null;
  category?: string | null;
  sub_category?: string | null;
  country?: string | null;
  created_at: string;
  projects?: { id: string; name: string; website_url: string } | null;
}

export default function AdminPromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [deletePromptId, setDeletePromptId] = useState<string | null>(null);
  const [deletePromptType, setDeletePromptType] = useState<'project' | 'recommended'>('project');
  const [editForm, setEditForm] = useState({
    prompt_type: 'project' as 'project' | 'recommended',
    prompt_text: '',
    project_id: '',
    is_recommended: false,
    tag: '',
    category: '',
    sub_category: '',
    country: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, [page, search, typeFilter]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        type: typeFilter,
      });
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/admin/prompts?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setPrompts(data.prompts || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        toast.error('Failed to fetch prompts');
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast.error('Failed to fetch prompts');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setEditForm({
      prompt_type: prompt.prompt_type,
      prompt_text: prompt.prompt_text || '',
      project_id: prompt.project_id || '',
      is_recommended: prompt.is_recommended || false,
      tag: prompt.tag || '',
      category: prompt.category || '',
      sub_category: prompt.sub_category || '',
      country: prompt.country || '',
    });
    setEditDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedPrompt(null);
    setEditForm({
      prompt_type: 'project',
      prompt_text: '',
      project_id: '',
      is_recommended: false,
      tag: '',
      category: '',
      sub_category: '',
      country: '',
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const body: any = {
        prompt_type: editForm.prompt_type,
        prompt_text: editForm.prompt_text,
      };

      if (selectedPrompt) {
        body.id = selectedPrompt.id;
      }

      if (editForm.prompt_type === 'project') {
        body.project_id = editForm.project_id;
        body.is_recommended = editForm.is_recommended;
        body.tag = editForm.tag || null;
      } else {
        body.category = editForm.category || null;
        body.sub_category = editForm.sub_category || null;
        body.country = editForm.country || null;
      }

      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success(`Prompt ${selectedPrompt ? 'updated' : 'created'} successfully`);
        setEditDialogOpen(false);
        fetchPrompts();
      } else {
        const data = await response.json();
        toast.error(data.error || `Failed to ${selectedPrompt ? 'update' : 'create'} prompt`);
      }
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error(`Failed to ${selectedPrompt ? 'update' : 'create'} prompt`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setDeletePromptId(prompt.id);
    setDeletePromptType(prompt.prompt_type);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletePromptId) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/prompts?id=${deletePromptId}&type=${deletePromptType}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Prompt deleted successfully');
        setDeleteDialogOpen(false);
        setDeletePromptId(null);
        fetchPrompts();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete prompt');
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error('Failed to delete prompt');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <AdminPageWrapper>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Prompts Management</h1>
            <p className="text-muted-foreground mt-2">Manage project and recommended prompts</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Prompt
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Prompts</CardTitle>
                <CardDescription>View and edit prompts</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search prompts..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={typeFilter} onValueChange={setTypeFilter} className="w-full">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="project">Project Prompts</TabsTrigger>
                <TabsTrigger value="recommended">Recommended Prompts</TabsTrigger>
              </TabsList>
            </Tabs>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <>
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Prompt Text</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prompts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No prompts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      prompts.map((prompt) => (
                        <TableRow key={`${prompt.prompt_type}-${prompt.id}`}>
                          <TableCell>
                            <Badge variant={prompt.prompt_type === 'project' ? 'default' : 'secondary'}>
                              {prompt.prompt_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="truncate" title={prompt.prompt_text}>
                              {prompt.prompt_text}
                            </div>
                          </TableCell>
                          <TableCell>
                            {prompt.projects?.name || '-'}
                          </TableCell>
                          <TableCell>
                            {prompt.category && (
                              <div>
                                <div className="font-medium">{prompt.category}</div>
                                {prompt.sub_category && (
                                  <div className="text-xs text-muted-foreground">{prompt.sub_category}</div>
                                )}
                              </div>
                            )}
                            {!prompt.category && '-'}
                          </TableCell>
                          <TableCell>
                            {new Date(prompt.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(prompt)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(prompt)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Edit/Create Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedPrompt ? 'Edit Prompt' : 'Create Prompt'}</DialogTitle>
              <DialogDescription>
                {selectedPrompt ? 'Update prompt details' : 'Create a new prompt'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="prompt_type">Prompt Type</Label>
                <Select
                  value={editForm.prompt_type}
                  onValueChange={(value) => setEditForm({ ...editForm, prompt_type: value as 'project' | 'recommended' })}
                  disabled={!!selectedPrompt}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="project">Project Prompt</SelectItem>
                    <SelectItem value="recommended">Recommended Prompt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editForm.prompt_type === 'project' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="project_id">Project ID</Label>
                    <Input
                      id="project_id"
                      value={editForm.project_id}
                      onChange={(e) => setEditForm({ ...editForm, project_id: e.target.value })}
                      placeholder="Enter project UUID"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_recommended"
                      checked={editForm.is_recommended}
                      onChange={(e) => setEditForm({ ...editForm, is_recommended: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="is_recommended">Recommended</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tag">Tag</Label>
                    <Input
                      id="tag"
                      value={editForm.tag}
                      onChange={(e) => setEditForm({ ...editForm, tag: e.target.value })}
                      placeholder="Optional tag"
                    />
                  </div>
                </>
              )}

              {editForm.prompt_type === 'recommended' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={editForm.category}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      placeholder="Business category"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub_category">Sub Category</Label>
                    <Input
                      id="sub_category"
                      value={editForm.sub_category}
                      onChange={(e) => setEditForm({ ...editForm, sub_category: e.target.value })}
                      placeholder="Sub category"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={editForm.country}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      placeholder="Country code (e.g., US)"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="prompt_text">Prompt Text</Label>
                <Textarea
                  id="prompt_text"
                  value={editForm.prompt_text}
                  onChange={(e) => setEditForm({ ...editForm, prompt_text: e.target.value })}
                  placeholder="Enter prompt text..."
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : selectedPrompt ? 'Update Prompt' : 'Create Prompt'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Prompt</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this prompt? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminPageWrapper>
  );
}







