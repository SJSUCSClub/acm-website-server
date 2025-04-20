import EventsDetails from '@/components/organisms/event-details';
import Page from '@/components/templates/Page';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/events/$eventId')({
  component: RouteComponent
});

function RouteComponent() {
  const { eventId } = Route.useParams();
  return (
    <Page>
      <EventsDetails eventId={eventId} />
    </Page>
  );
}
