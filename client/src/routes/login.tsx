import { createFileRoute } from '@tanstack/react-router';
import SignIn from '../pages/LogIn';
import { ProtectedRoute } from '@/lib/ProtectedRoute';

export const Route = createFileRoute('/login')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <ProtectedRoute requireNoAuth>
      <SignIn />
    </ProtectedRoute>
  );
}
