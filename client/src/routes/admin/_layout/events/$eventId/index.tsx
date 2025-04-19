import EventsDetails from '@/components/organisms/event-details';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_layout/events/$eventId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { eventId } = Route.useParams()
  return <EventsDetails eventId={eventId} admin />
}
