import { createFileRoute } from '@tanstack/react-router';
import Profile from '@/pages/Profile';
import { ProtectedRoute } from '@/lib/ProtectedRoute';

export const Route = createFileRoute('/account/_layout/profile')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  );
}
