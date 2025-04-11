import Officers from '@/pages/admin/Officers';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/officers')({
  component: Officers
});
