import { useEffect, useState } from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { useQuery } from '@/hooks/useFetch';
import EventCard from '@/components/molecules/event-card';
import SearchBar from '@/components/molecules/search-bar-filter';
import BtnDateFilter from '@/components/molecules/btn-date-filter';
import BtnTagFilter from '@/components/molecules/btn-tag-filter';
import BtnEventTypeFilter from '@/components/molecules/btn-event-type-filter';
import BtnTargetAudienceFilter from '@/components/molecules/btn-target-audience-filter';
import BtnMemberOnlyFilter from '@/components/molecules/btn-member-only-filter';
import { paths } from '@/types/schema.v1';
import { Route } from '@/routes/admin/_layout/events';

type Events =
  paths['/v1/events']['get']['responses']['200']['content']['application/json']['foundEvents'];

const EventsPage = () => {
  const searchParams = useSearch({
    from: '/admin/_layout/events'
  });
  const navigate = useNavigate({ from: Route.fullPath });

  const { name, timeframe, tags, eventTypes, targetAudience, memberOnly } = searchParams;

  const [events, setEvents] = useState<Events>([]);

  const { data: eventData } = useQuery('get', '/v1/events', {
    params: {
      query: {
        name,
        tags: tags.join(',') || '',
        timeframe: timeframe || 'all',
        eventTypes: eventTypes.join(',') || '',
        targetAudience: targetAudience === 'All' ? '' : targetAudience,
        memberOnly: memberOnly ? 'true' : 'false'
      }
    }
  });

  useEffect(() => {
    if (eventData) {
      setEvents(eventData.foundEvents);
    }
  }, [timeframe, tags, eventData]);

  const updateSearchFilters = (field: keyof typeof searchParams, value: unknown) => {
    navigate({ search: (prev) => ({ ...prev, [field]: value }), replace: true });
  };

  const setNameFilter = (newName: string) => updateSearchFilters('name', newName);

  const setDateFilter = (newDate: 'today' | 'past' | 'upcoming' | 'all') =>
    updateSearchFilters('timeframe', newDate);

  const setTagFilter = (newTags: string[]) => updateSearchFilters('tags', newTags);

  const setEventTypesFilter = (newEventTypes: string[]) =>
    updateSearchFilters('eventTypes', newEventTypes);

  const setMemberOnlyFilter = (membOnly: boolean) => updateSearchFilters('memberOnly', membOnly);

  const setTargetAudienceFilter = (newTargetAudience: string) =>
    updateSearchFilters('targetAudience', newTargetAudience);

  return (
    <div className="container mx-auto px-4 py-8">
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

          <SearchBar name={name} fcn={setNameFilter} label="Search By Name" />
          <BtnDateFilter fcn={setDateFilter} />
          <BtnTagFilter selectedTags={tags} fcn={setTagFilter} />
          <BtnEventTypeFilter selectedEventTypes={eventTypes} fcn={setEventTypesFilter} />
          <BtnMemberOnlyFilter fcn={setMemberOnlyFilter} memberOnly={memberOnly} />
          <BtnTargetAudienceFilter fcn={setTargetAudienceFilter} targetAudience={targetAudience} />
        </div>

        {events.length === 0 ? (
          <div className="text-text text-center my-10">No events found</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
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
