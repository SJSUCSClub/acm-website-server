import OfficerForm from '@/components/organisms/officer-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/officers/$officerId/edit')({
  component: RouteComponent
});

function RouteComponent() {
  const { officerId } = Route.useParams();
  return <OfficerForm officerId={officerId} />;
}
