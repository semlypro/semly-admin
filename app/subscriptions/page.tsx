'use client';

import { useState, useEffect } from 'react';
import { AdminGuard } from '@/components/AdminGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Badge } from '@/components/ui/badge';
import { Pencil, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  user_id: string;
  organization_id: string | null;
  plan_key: string | null;
  plan_name: string;
  subscription_status: string;
  is_active: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  amount_cents: number | null;
  currency: string;
  created_at: string;
  users?: { email: string; first_name: string | null; last_name: string | null };
  organizations?: { name: string; slug: string } | null;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [editForm, setEditForm] = useState({
    plan_key: '',
    plan_name: '',
    subscription_status: '',
    is_active: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, [page, statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
      });
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/subscriptions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        toast.error('Failed to fetch subscriptions');
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setEditForm({
      plan_key: subscription.plan_key || '',
      plan_name: subscription.plan_name || '',
      subscription_status: subscription.subscription_status || '',
      is_active: subscription.is_active || false,
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedSubscription) return;

    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedSubscription.id,
          ...editForm,
        }),
      });

      if (response.ok) {
        toast.success('Subscription updated successfully');
        setEditDialogOpen(false);
        fetchSubscriptions();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update subscription');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (!isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>;
      case 'past_due':
        return <Badge variant="outline">Past Due</Badge>;
      case 'trialing':
        return <Badge variant="outline">Trialing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AdminGuard>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Subscriptions Management</h1>
          <p className="text-muted-foreground mt-2">Manage user subscriptions</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Subscriptions</CardTitle>
                <CardDescription>View and edit subscription details</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                    <SelectItem value="trialing">Trialing</SelectItem>
                    <SelectItem value="incomplete">Incomplete</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Period End</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No subscriptions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      subscriptions.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{sub.plan_name}</div>
                              {sub.plan_key && (
                                <div className="text-xs text-muted-foreground">{sub.plan_key}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {sub.users?.email || sub.user_id.substring(0, 20) + '...'}
                          </TableCell>
                          <TableCell>
                            {sub.organizations?.name || '-'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(sub.subscription_status, sub.is_active)}
                          </TableCell>
                          <TableCell>
                            {sub.amount_cents
                              ? `${(sub.amount_cents / 100).toFixed(2)} ${sub.currency}`
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {sub.current_period_end
                              ? new Date(sub.current_period_end).toLocaleDateString()
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {new Date(sub.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(sub)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
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

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subscription</DialogTitle>
              <DialogDescription>Update subscription details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="plan_key">Plan Key</Label>
                <Input
                  id="plan_key"
                  value={editForm.plan_key}
                  onChange={(e) => setEditForm({ ...editForm, plan_key: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plan_name">Plan Name</Label>
                <Input
                  id="plan_name"
                  value={editForm.plan_name}
                  onChange={(e) => setEditForm({ ...editForm, plan_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subscription_status">Status</Label>
                <Select
                  value={editForm.subscription_status}
                  onValueChange={(value) => setEditForm({ ...editForm, subscription_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="past_due">Past Due</SelectItem>
                    <SelectItem value="trialing">Trialing</SelectItem>
                    <SelectItem value="incomplete">Incomplete</SelectItem>
                    <SelectItem value="incomplete_expired">Incomplete Expired</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  );
}







