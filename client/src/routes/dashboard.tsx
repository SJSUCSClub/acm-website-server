import { ProtectedRoute } from '@/lib/ProtectedRoute';
import Dashboard from '@/pages/dashboard/Dashboard';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
