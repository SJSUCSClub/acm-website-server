import SpotlightForm from '@/components/organisms/spotlight-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/club/spotlights/$spotlightId/edit')({
  component: RouteComponent
});

function RouteComponent() {
  const { spotlightId } = Route.useParams();
  return <SpotlightForm spotlightId={spotlightId} />;
}
