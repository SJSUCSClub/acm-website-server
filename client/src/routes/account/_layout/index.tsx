import Home from '@/pages/admin/Home';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/account/_layout/')({
  component: Home,
  beforeLoad: () => {
    throw redirect({
      to: '/account/dashboard',
      replace: true,
    })
  },
});
