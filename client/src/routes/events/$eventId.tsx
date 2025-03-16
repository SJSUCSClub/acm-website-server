import EventsDetails from '@/pages/events/EventsDetails'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/events/$eventId')({
  component: EventsDetails
})
