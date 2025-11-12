import { AdminPageWrapper } from '@/components/AdminPageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, FolderKanban, MessageSquare, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <AdminPageWrapper>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here's what's happening with your platform today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+0%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+0%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Active projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Generated this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link href="/users">
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Users</CardTitle>
                      <CardDescription className="text-xs">View all users</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/subscriptions">
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <CreditCard className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Subscriptions</CardTitle>
                      <CardDescription className="text-xs">Manage subscriptions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/projects">
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <FolderKanban className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Projects</CardTitle>
                      <CardDescription className="text-xs">View all projects</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/prompts">
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Prompts</CardTitle>
                      <CardDescription className="text-xs">View all prompts</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Activity (Placeholder) */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates from your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Growth Metrics
              </CardTitle>
              <CardDescription>Platform growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Analytics coming soon</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPageWrapper>
  );
}
