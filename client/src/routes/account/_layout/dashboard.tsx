import { createFileRoute } from '@tanstack/react-router';
import Dashboard from '@/pages/dashboard/Dashboard';
import { ProtectedRoute } from '@/lib/ProtectedRoute';

export const Route = createFileRoute('/account/_layout/dashboard')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
