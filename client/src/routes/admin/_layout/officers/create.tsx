import OfficerForm from '@/components/organisms/officer-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/officers/create')({
  component: RouteComponent
});

function RouteComponent() {
  return <OfficerForm />;
}
