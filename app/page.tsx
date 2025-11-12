import { AdminGuard } from '@/components/AdminGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, FolderKanban, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage users, subscriptions, projects, and prompts</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Users</CardTitle>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-muted-foreground">Click to view all users</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/subscriptions">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Subscriptions</CardTitle>
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Manage subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-muted-foreground">Click to view all subscriptions</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/projects">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Projects</CardTitle>
                  <FolderKanban className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Manage user projects</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-muted-foreground">Click to view all projects</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/prompts">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Prompts</CardTitle>
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>Manage prompts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">-</p>
                <p className="text-xs text-muted-foreground">Click to view all prompts</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AdminGuard>
  );
}







