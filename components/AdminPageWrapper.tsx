'use client';

import { AdminGuard } from './AdminGuard';
import { AdminLayout } from './AdminLayout';

interface AdminPageWrapperProps {
  children: React.ReactNode;
}

export function AdminPageWrapper({ children }: AdminPageWrapperProps) {
  return (
    <AdminGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminGuard>
  );
}
