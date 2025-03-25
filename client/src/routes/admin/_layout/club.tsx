import Club from '@/pages/admin/Club';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/club')({
  component: Club
});
