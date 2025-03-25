import Companies from '@/pages/admin/Companies';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/companies')({
  component: Companies
});
