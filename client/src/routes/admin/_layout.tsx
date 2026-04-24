import AdminSidebar from '@/components/templates/AdminSidebar';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { ProtectedRoute } from '@/lib/ProtectedRoute';

export const Route = createFileRoute('/admin/_layout')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminSidebar>
        <Outlet />
      </AdminSidebar>
    </ProtectedRoute>
  );
}
