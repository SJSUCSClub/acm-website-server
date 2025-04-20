import EventForm from '@/components/organisms/event-form';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/_layout/events/create')({
  component: RouteComponent
});

function RouteComponent() {
  return <EventForm />;
}
