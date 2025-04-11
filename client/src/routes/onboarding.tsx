import { createFileRoute } from '@tanstack/react-router';
import Onboarding from '../pages/Onboarding';
import { ProtectedRoute } from '@/lib/ProtectedRoute';

export const Route = createFileRoute('/onboarding')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <Onboarding />
    </ProtectedRoute>
  );
}
