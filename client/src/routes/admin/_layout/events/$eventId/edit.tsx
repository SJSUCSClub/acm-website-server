import EventForm from '@/components/organisms/event-form';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_layout/events/$eventId/edit')({
  component: RouteComponent,
})

function RouteComponent() {
  const { eventId } = Route.useParams()
  return <EventForm eventId={eventId} />
}
