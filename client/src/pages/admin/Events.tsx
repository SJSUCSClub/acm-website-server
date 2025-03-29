import { useEffect, useState } from 'react';
import EventCard from '../../components/molecules/event-card';
import BtnDateFilter from '../../components/molecules/btn-date-filter';
import BtnTagFilter from '../../components/molecules/btn-tag-filter';
import BtnEventTypeFilter from '@/components/molecules/btn-event-type-filter';
import { useQuery } from '@/hooks/useFetch';
import { paths } from '@/types/schema.v1';

type Events =
  paths['/v1/events']['get']['responses']['200']['content']['application/json']['foundEvents'];

const EventsPage = () => {
  const [events, setEvents] = useState<Events>([]);
  const [dateFilter, setDateFilter] = useState<'upcoming' | 'today' | 'past' | 'all'>('all');
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState<string[]>([]);

  const { data: eventData } = useQuery('get', '/v1/events', {
    params: {
      query: {
        tags: tagFilter.join(',') || '',
        timeframe: dateFilter || 'all',
        eventTypes: eventTypeFilter.join(',') || ''
      }
    }
  });

  useEffect(() => {
    if (eventData) {
      setEvents(eventData.foundEvents);
    }
  }, [dateFilter, tagFilter, eventData]);

  return (
    <div className="container mx-auto px-4 py-8 h-[800px]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="intro space-y-4">
          <h1 className="text-4xl font-bold">Events</h1>
          <p className="text-lg">
            Our student group organizes a variety of events during each academic semester, including
            workshops, informational sessions, community engagement activities, and much more!
          </p>
          <p>
            These events are accessible to all those who are interested, irrespective of their major
            or prior experience.
          </p>
          <BtnDateFilter fcn={setDateFilter} />
          <BtnTagFilter selectedTags={tagFilter} fcn={setTagFilter} />
          <BtnEventTypeFilter selectedEventTypes={eventTypeFilter} fcn={setEventTypeFilter} />
        </div>

        {events.length === 0 ? (
          <div className="text-text text-center my-10">No events found</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8 max-h-[400px] overflow-y-scroll">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
