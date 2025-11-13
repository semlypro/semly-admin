'use client';

import { AdminGuard } from './AdminGuard';
import { AdminLayout } from './AdminLayout';
import { ErrorBoundary } from './ErrorBoundary';

interface AdminPageWrapperProps {
  children: React.ReactNode;
}

export function AdminPageWrapper({ children }: AdminPageWrapperProps) {
  return (
    <ErrorBoundary>
      <AdminGuard>
        <AdminLayout>{children}</AdminLayout>
      </AdminGuard>
    </ErrorBoundary>
  );
}
