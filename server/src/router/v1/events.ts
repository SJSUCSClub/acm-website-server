import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import {
  urlSchema,
} from '@/util/zod';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import {
  users,
  eventCompanies,
  companies,
  subscribedEvents,
  eventsFiles,
  files,
  events,
  urls,
  attendingEvents,
} from '@/db/schema';
import {
  eq,
  count,
  getTableColumns,
  and,
  lt,
  gt,
  arrayContains,
} from 'drizzle-orm';
import type {
  User,
  Company,
  File,
  Event,
  Url,
} from '@/db/schema';
import {
  authMiddleWare,
  forbiddenRequest,
  unauthorizedRequest,
} from '@/middlewares/auth-middleware';
import {
  companySchema,
  eventIDSchema,
  userSchema,
  fileSchema,
  eventSchema,
  csFieldsEnumSchema,
  timestampEnumSchema,
} from '@/util/zod';
import { generateObjectUrl } from '@/lib/aws/s3';

const eventRouter = new OpenAPIHono<Context>();

eventRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{eventID}/companies',
    tags: ['events'],
    summary: 'List all companies for an event',
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              eventCompanies: z.array(companySchema),
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid('param');
    const foundEventCompanies: Company[] = await db
      .select(getTableColumns(companies))
      .from(eventCompanies)
      .innerJoin(companies, eq(companies.id, eventCompanies.companyId))
      .where(eq(eventCompanies.eventId, parseInt(eventID)));

    const mappedCompanies = foundEventCompanies.map((company) => ({
      ...company,
      logo: generateObjectUrl(company.logo),
    }));

    return c.json({ eventCompanies: mappedCompanies }, HttpStatusCodes.OK);
  },
);

eventRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{eventID}/subscribers',
    tags: ['events'],
    summary: 'List all subscribers for an event',
    middleware: [authMiddleWare('admin')],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              eventSubscribers: z.array(userSchema),
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid('param');
    const eventSubscribers: User[] = await db
      .select(getTableColumns(users))
      .from(subscribedEvents)
      .innerJoin(users, eq(users.id, subscribedEvents.userId))
      .where(eq(subscribedEvents.eventId, parseInt(eventID)));
    const formattedEventSubscribers = eventSubscribers.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }));
    return c.json(
      { eventSubscribers: formattedEventSubscribers },
      HttpStatusCodes.OK,
    );
  },
);

eventRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{eventID}/subscribers/count',
    tags: ['events'],
    summary: 'Get the number of subscribers for an event',
    middleware: [authMiddleWare('admin')],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              subscribersCount: z.number(),
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid('param');
    const subscribersCount = await db
      .select({ count: count() })
      .from(subscribedEvents)
      .where(eq(subscribedEvents.eventId, parseInt(eventID)));
    return c.json(
      { subscribersCount: subscribersCount[0].count },
      HttpStatusCodes.OK,
    );
  },
);

eventRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{eventID}/files',
    tags: ['events'],
    summary: 'List all files for an event',
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              eventFiles: z.array(fileSchema),
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid('param');
    const eventFiles: File[] = await db
      .select(getTableColumns(files))
      .from(eventsFiles)
      .innerJoin(files, eq(files.key, eventsFiles.fileKey))
      .where(eq(eventsFiles.eventId, parseInt(eventID)));

    const mappedFiles = eventFiles.map((file) => ({
      ...file,
      key: generateObjectUrl(file.key),
    }));

    return c.json({ eventFiles: mappedFiles }, HttpStatusCodes.OK);
  },
);

eventRouter.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['events'],
    summary: 'List all events',
    request: {
      query: z.object({
        tags: z.string().optional(),
        timeframe: timestampEnumSchema.optional(),
      }),
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              foundEvents: z.array(eventSchema),
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const { tags = '', timeframe = 'all' } = c.req.valid('query');

    const conditions = [];

    if (timeframe !== 'all') {
      const today = new Date().toISOString().split('T')[0];

      conditions.push(
        timeframe === 'upcoming'
          ? gt(events.startDate, today)
          : timeframe === 'past'
            ? lt(events.startDate, today)
            : eq(events.startDate, today),
      );
    }

    const validTags = tags
      .split(',')
      .filter((tag) =>
        csFieldsEnumSchema._def.values.includes(
          tag as z.infer<typeof csFieldsEnumSchema>,
        ),
      )
      .map((tag) => tag as z.infer<typeof csFieldsEnumSchema>);

    if (tags?.length > 0) {
      conditions.push(arrayContains(events.tags, validTags));
    }

    const foundEvents: Event[] = await db
      .select()
      .from(events)
      .where(and(...conditions));
    return c.json({ foundEvents }, HttpStatusCodes.OK);
  },
);

eventRouter.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['events'],
    summary: 'Create an event',
    middleware: [authMiddleWare('admin')],
    request: {
      body: {
        content: {
          'application/json': {
            schema: eventSchema.omit({ id: true, createdAt: true }),
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: {
          'application/json': {
            schema: z.object({
              event: eventSchema,
            }),
          },
        },
        description: 'Successful response',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const {
      name,
      location,
      startDate,
      endDate,
      description,
      urls,
      eventType,
      eventCapacity,
      image,
      startTime,
      endTime,
      tags,
      targetAudience,
      shortenedEventUrl,
    } = c.req.valid('json');
    const newEvent = await db
      .insert(events)
      .values({
        name,
        location,
        startDate,
        endDate,
        description,
        urls,
        eventType,
        eventCapacity,
        image,
        startTime,
        endTime,
        tags,
        targetAudience,
        shortenedEventUrl,
      })
      .returning();
    return c.json({ event: newEvent[0] }, HttpStatusCodes.CREATED);
  },
);

eventRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{eventID}',
    tags: ['events'],
    summary: 'List event information',
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              event: eventSchema,
            }),
          },
        },
        description: 'Successful response',
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: 'Not Found',
      },
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid('param');
    const foundEvents: Event[] = await db
      .select()
      .from(events)
      .where(eq(events.id, parseInt(eventID)));

    if (foundEvents.length === 0) {
      return c.json({ error: 'Event not found' }, HttpStatusCodes.NOT_FOUND);
    }

    const mappedEvent = {
      ...foundEvents[0],
      image: generateObjectUrl(foundEvents[0].image),
    };

    return c.json({ event: mappedEvent }, HttpStatusCodes.OK);
  },
);

eventRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{eventID}/url',
    tags: ['events'],
    summary: 'Fetch event URL',
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              url: urlSchema,
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid('param');
    const url: Url[] = await db
      .select(getTableColumns(urls))
      .from(events)
      .innerJoin(urls, eq(events.shortenedEventUrl, urls.id))
      .where(eq(events.id, parseInt(eventID)));
    return c.json({ url: url[0] }, HttpStatusCodes.OK);
  },
);

eventRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{eventID}/attendance',
    tags: ['events'],
    summary: 'List all attendees for an event',
    middleware: [authMiddleWare('admin')],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              eventAttendees: z.array(userSchema),
            }),
          },
        },
        description: 'Successful response',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: 'Internal Server Error',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    try {
      const user = c.get('user');
      if (!user) {
        return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
      }

      const { eventID } = c.req.valid('param');
      const eventAttendees: User[] = await db
        .select(getTableColumns(users))
        .from(attendingEvents)
        .innerJoin(users, eq(users.id, attendingEvents.userId))
        .where(eq(attendingEvents.eventId, parseInt(eventID)));
      const formattedEventAttendees = eventAttendees.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
      }));
      return c.json(
        { eventAttendees: formattedEventAttendees },
        HttpStatusCodes.OK,
      );
    } catch (error) {
      return c.json(
        { error: `Internal server error: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

eventRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{eventID}/attendance/count',
    tags: ['events'],
    summary: 'Get the number of attendees for an event',
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              attendeesCount: z.number(),
            }),
          },
        },
        description: 'Successful response',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: 'Internal Server Error',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    try {
      const { eventID } = c.req.valid('param');
      const attendeesCount = await db
        .select({ count: count() })
        .from(attendingEvents)
        .where(eq(attendingEvents.eventId, parseInt(eventID)));
      return c.json(
        { attendeesCount: attendeesCount[0].count },
        HttpStatusCodes.OK,
      );
    } catch (error) {
      return c.json(
        { error: `Internal server error: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

export default eventRouter;
