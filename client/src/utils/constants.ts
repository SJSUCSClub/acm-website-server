import { type EventListSearch } from '@/components/organisms/event-list';

export const DEFAULT_EVENT_FILTERS: EventListSearch = {
  name: '',
  timeframe: 'all',
  tags: [],
  eventTypes: [],
  targetAudience: 'All',
  memberOnly: false
};
