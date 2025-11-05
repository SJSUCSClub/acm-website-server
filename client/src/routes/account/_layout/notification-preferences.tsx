import { createFileRoute } from '@tanstack/react-router';
import { NotificationPreferences } from '@/pages/NotificationPreferences';
import { ProtectedRoute } from '@/lib/ProtectedRoute';

export const Route = createFileRoute('/account/_layout/notification-preferences')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <NotificationPreferences />
    </ProtectedRoute>
  );
}
