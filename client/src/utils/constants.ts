import { type EventsFilters } from '@/routes/admin/_layout/events';

export const DEFAULT_EVENT_FILTERS: EventsFilters = {
  name: '',
  timeframe: 'all',
  tags: [],
  eventTypes: [],
  targetAudience: 'All',
  memberOnly: false
};
