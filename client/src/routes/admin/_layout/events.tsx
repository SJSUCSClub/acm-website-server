import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import Events from '@/pages/admin/Events';

const eventsFilterSchema = z.object({
  name: z.string().default(''),
  timeframe: z.enum(['upcoming', 'past', 'today', 'all']).default('all'),
  tags: z.string().array().default([]),
  eventTypes: z.string().array().default([]),
  targetAudience: z.string().default('All'),
  memberOnly: z.boolean().default(false)
});

export type EventsFilters = z.infer<typeof eventsFilterSchema>;

export const Route = createFileRoute('/admin/_layout/events')({
  component: Events,
  validateSearch: (search: EventsFilters) => eventsFilterSchema.parse(search)
});
