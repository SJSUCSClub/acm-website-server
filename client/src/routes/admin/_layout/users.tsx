import Users from '@/pages/admin/Users';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/users')({
  component: Users
});
