import EventList, { EventListSearch, eventsFilterSchema } from '@/components/organisms/event-list';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_layout/events/')({
  component: RouteComponent,
  validateSearch: (search: EventListSearch) => eventsFilterSchema.parse(search)
})

function RouteComponent() {
  const searchParams = Route.useSearch();
  return <EventList searchParams={searchParams} fullPath={Route.fullPath} admin />;
}
