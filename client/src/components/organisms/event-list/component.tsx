import { useEffect, useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { X } from 'lucide-react';
import { useQuery } from '@/hooks/useFetch';
import EventCard from '@/components/molecules/event-card';
import SearchBar from '@/components/molecules/search-bar-filter';
import BtnDateFilter from '@/components/molecules/btn-date-filter';
import BtnTagFilter from '@/components/molecules/btn-tag-filter';
import BtnEventTypeFilter from '@/components/molecules/btn-event-type-filter';
import BtnTargetAudienceFilter from '@/components/molecules/btn-target-audience-filter';
import BtnMemberOnlyFilter from '@/components/molecules/btn-member-only-filter';
import Spinner from '@/components/atoms/spinner';
import { paths } from '@/types/schema.v1';
import { Button } from '@/components/ui/button';
import { DEFAULT_EVENT_FILTERS } from '@/utils/constants';
import { capitalizeFirstLetter as cfl } from '@/utils/helpers';
import { z } from 'zod';
import { FileRouteTypes } from '@/routeTree.gen';
import Btn from '@/components/atoms/btn';

type Events =
  paths['/v1/events']['get']['responses']['200']['content']['application/json']['foundEvents'];

export const eventsFilterSchema = z.object({
  name: z.string().default(''),
  timeframe: z.enum(['upcoming', 'past', 'today', 'all']).default('all'),
  tags: z
    .array(
      z.enum([
        'Web Development',
        'Machine Learning',
        'Cloud Computing',
        'Artificial Intelligence',
        'Networking',
        'Cybersecurity',
        'Mobile Development',
        'Game Development',
        'Data Science'
      ])
    )
    .default([]),
  eventTypes: z.array(
    z.enum(['Workshop', 'Seminar', 'Hackathon', 'Conference', 'Meetup', 'Tech Talk', 'Other'])
  ),
  targetAudience: z.string().default('All'),
  memberOnly: z.boolean().default(false)
});
export type EventListSearch = z.infer<typeof eventsFilterSchema>;

export interface IEventListProps {
  searchParams: EventListSearch;
  fullPath: FileRouteTypes['fullPaths'];
  admin?: boolean;
}

const EventList: React.FC<IEventListProps> = ({ searchParams, fullPath, admin = false }) => {
  const navigate = useNavigate({ from: fullPath });

  const { name, timeframe, tags, eventTypes, targetAudience, memberOnly } = searchParams;

  const [events, setEvents] = useState<Events>([]);

  const {
    data: eventData,
    isLoading,
    error
  } = useQuery('get', '/v1/events', {
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
  }, [eventData]);

  const updateSearchFilters = (field: keyof EventListSearch, value: unknown) => {
    navigate({ search: (prev) => ({ ...prev, [field]: value }), replace: true });
  };

  const setNameFilter = (newName: EventListSearch['name']) => updateSearchFilters('name', newName);

  const setDateFilter = (newDate: EventListSearch['timeframe']) =>
    updateSearchFilters('timeframe', newDate);

  const setTagFilter = (newTags: EventListSearch['tags']) => updateSearchFilters('tags', newTags);

  const setEventTypesFilter = (newEventTypes: EventListSearch['eventTypes']) =>
    updateSearchFilters('eventTypes', newEventTypes);

  const setMemberOnlyFilter = (membOnly: EventListSearch['memberOnly']) =>
    updateSearchFilters('memberOnly', membOnly);

  const setTargetAudienceFilter = (newTargetAudience: string) =>
    updateSearchFilters('targetAudience', newTargetAudience);

  const renderChip = (
    key: keyof EventListSearch,
    value: string,
    label: string,
    getUpdatedValue?: () => unknown
  ) => {
    return (
      <div
        key={`${key}-${value}`}
        className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-900"
      >
        <span>
          {label}: {value}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="ml-2 -mr-1 rounded-full p-1 hover:bg-gray-200"
          onClick={() =>
            updateSearchFilters(
              key,
              getUpdatedValue ? getUpdatedValue() : DEFAULT_EVENT_FILTERS[key]
            )
          }
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderFilterChips = () => {
    const activeFilters = [];

    if (name) {
      activeFilters.push(renderChip('name', name, 'Name'));
    }

    if (timeframe !== DEFAULT_EVENT_FILTERS.timeframe) {
      activeFilters.push(renderChip('timeframe', cfl(timeframe), 'Timeframe'));
    }

    if (tags !== DEFAULT_EVENT_FILTERS.tags) {
      tags.forEach((tag) =>
        activeFilters.push(
          renderChip('tags', tag, 'Tags', () => tags.filter((item) => item !== tag))
        )
      );
    }

    if (eventTypes !== DEFAULT_EVENT_FILTERS.eventTypes) {
      eventTypes.forEach((eventType) =>
        activeFilters.push(
          renderChip('eventTypes', eventType, 'Event Types', () =>
            eventTypes.filter((item) => item !== eventType)
          )
        )
      );
    }

    if (targetAudience !== DEFAULT_EVENT_FILTERS.targetAudience) {
      activeFilters.push(renderChip('targetAudience', targetAudience, 'Target Audience'));
    }

    return activeFilters.length > 0 ? (
      <div className="flex flex-wrap gap-2 mt-4">{activeFilters}</div>
    ) : null;
  };

  return (
    <div className="space-y-5">
      <h1 className="text-4xl font-bold">Events</h1>
      {admin && (
        <div className="flex items-center justify-end">
          <Link to="/admin/events/create">
            <Btn>Create Event</Btn>
          </Link>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Filters</h2>
          <Button
            variant="outline"
            onClick={() => navigate({ search: { ...DEFAULT_EVENT_FILTERS } })}
            className="flex items-center gap-2 text-black border-black hover:bg-black/5"
            disabled={JSON.stringify(searchParams) === JSON.stringify(DEFAULT_EVENT_FILTERS)}
          >
            <X className="h-4 w-4" />
            Clear All Filters
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <SearchBar
            value={name}
            onQueryChange={setNameFilter}
            label="Name"
            placeholder="Search by Name"
          />

          <div>
            <label className="block text-sm mb-1">Timeframe</label>
            <BtnDateFilter onSelectChange={setDateFilter} date={cfl(timeframe)} />
          </div>

          <div>
            <label className="block text-sm mb-1">Tags</label>
            <BtnTagFilter selectedTags={tags} onSelectChange={setTagFilter} />
          </div>

          <div>
            <label className="block text-sm mb-1">Event Types</label>
            <BtnEventTypeFilter
              selectedEventTypes={eventTypes}
              onSelectChange={setEventTypesFilter}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Member Only</label>
            <BtnMemberOnlyFilter onSelectChange={setMemberOnlyFilter} memberOnly={memberOnly} />
          </div>

          <div>
            <label className="block text-sm mb-1">Audience</label>
            <BtnTargetAudienceFilter onSelectChange={setTargetAudienceFilter} />
          </div>
        </div>

        {renderFilterChips()}
      </div>

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <div className="text-red-500 p-4 text-center">Error loading events data</div>
      ) : events.length === 0 ? (
        <div className="text-text text-center my-10">No events found</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export { EventList };
