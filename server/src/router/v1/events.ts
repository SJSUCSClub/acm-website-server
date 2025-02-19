import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

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
  bookmarkedEvents,
} from '@/db/schema';
import { eq, count, getTableColumns, and, lt, gt, arrayContains } from 'drizzle-orm';
import type { User, Company, File, Event, Url } from '@/db/schema';
import {
  authMiddleWare,
  forbiddenRequest,
  unauthorizedRequest,
} from '@/middlewares/auth-middleware';
import { createSelectSchema } from 'drizzle-zod';
import {
  companySchema,
  eventIDSchema,
  userSchema,
  fileSchema,
  eventSchema,
  csFieldsEnumSchema,
  timestampEnumSchema,
} from '@/util/zod';

const eventRouter = new OpenAPIHono<Context>();

const subscribedEventSchema = createSelectSchema(subscribedEvents);
const bookmarkedEventSchema = createSelectSchema(bookmarkedEvents);
const urlSchema = createSelectSchema(urls);

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
              foundEventCompanies: z.array(companySchema),
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
    return c.json({ foundEventCompanies }, HttpStatusCodes.OK);
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
    return c.json({ eventFiles }, HttpStatusCodes.OK);
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
    const {  tags = '', timeframe = 'all' } = c.req.valid('query');

    const conditions = [];

    if (timeframe !== 'all') {
      const today = new Date().toISOString().split('T')[0];

      conditions.push(
        timeframe === 'upcoming' ? gt(events.startDate, today) :
        timeframe === 'past' ? lt(events.startDate, today) :
        eq(events.startDate, today),
      );
    }

    const validTags = tags
      .split(',')
      .filter(tag => csFieldsEnumSchema._def.values.includes(tag as z.infer<typeof csFieldsEnumSchema>))
      .map(tag => tag as z.infer<typeof csFieldsEnumSchema>);

    if (tags?.length > 0) {
      conditions.push(arrayContains(events.tags, validTags));
    }

    const foundEvents: Event[] = await db.select().from(events).where(and(...conditions));
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
              foundEvent: eventSchema,
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
    return c.json({ foundEvent: foundEvents[0] }, HttpStatusCodes.OK);
  },
);

eventRouter.openapi(
  createRoute({
    method: 'post',
    path: '/{eventID}/subscribe',
    tags: ['events'],
    summary: 'User subscribes to an event',
    middleware: [authMiddleWare('user')],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              newSubscription: subscribedEventSchema,
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
      [HttpStatusCodes.CONFLICT]: {
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: 'Conflict',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const user = c.get('user');
    const { eventID } = c.req.valid('param');

    const foundEvents: Event[] = await db
      .select()
      .from(events)
      .where(eq(events.id, parseInt(eventID)));

    if (foundEvents.length === 0) {
      return c.json({ error: 'Event not found' }, HttpStatusCodes.NOT_FOUND);
    }
    const event = foundEvents[0];
    if (event.memberOnly && user?.role === 'user') {
      return c.json({ error: 'Not member' }, HttpStatusCodes.FORBIDDEN);
    }

    const newSubscription = await db
      .insert(subscribedEvents)
      .values({ userId: user!.id, eventId: parseInt(eventID) })
      .onConflictDoNothing()
      .returning();

    if (newSubscription.length === 0) {
      return c.json(
        { error: 'Subscription already exists' },
        HttpStatusCodes.CONFLICT,
      );
    }

    return c.json({ newSubscription: newSubscription[0] }, HttpStatusCodes.OK);
  },
);

eventRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{eventID}/subscribe',
    tags: ['events'],
    summary: 'User unsubscribes to an event',
    middleware: [authMiddleWare('user')],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              deletedSubscription: subscribedEventSchema,
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
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const user = c.get('user');
    const { eventID } = c.req.valid('param');

    const deletedSubscription = await db
      .delete(subscribedEvents)
      .where(
        and(
          eq(subscribedEvents.userId, user!.id),
          eq(subscribedEvents.eventId, parseInt(eventID)),
        ),
      )
      .returning();

    if (deletedSubscription.length === 0) {
      return c.json(
        { error: 'Subscription not found' },
        HttpStatusCodes.NOT_FOUND,
      );
    }

    const formattedDeletedSubscription = deletedSubscription.map((sub) => ({
      ...sub,
      subscribedDate: sub.subscribedDate.toISOString(),
    }));
    return c.json(
      { deletedSubscription: formattedDeletedSubscription[0] },
      HttpStatusCodes.OK,
    );
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
    method: 'post',
    path: '/{eventID}/bookmark',
    tags: ['events'],
    summary: 'User bookmarks an event',
    middleware: [authMiddleWare('user')],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              newBookmark: bookmarkedEventSchema,
            }),
          },
        },
        description: 'Successful response',
      },
      [HttpStatusCodes.CONFLICT]: {
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: 'Conflict',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const user = c.get('user');
    const { eventID } = c.req.valid('param');

    const newBookmark = await db
      .insert(bookmarkedEvents)
      .values({ userId: user!.id, eventId: parseInt(eventID) })
      .onConflictDoNothing()
      .returning();

    if (newBookmark.length === 0) {
      return c.json(
        { error: 'Bookmark already exists' },
        HttpStatusCodes.CONFLICT,
      );
    }

    return c.json({ newBookmark: newBookmark[0] }, HttpStatusCodes.OK);
  },
);

eventRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{eventID}/bookmark',
    tags: ['events'],
    summary: 'User unbookmarks an event',
    middleware: [authMiddleWare('user')],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              deletedBookmark: bookmarkedEventSchema,
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
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const user = c.get('user');
    const { eventID } = c.req.valid('param');

    const deletedBookmark = await db
      .delete(bookmarkedEvents)
      .where(
        and(
          eq(bookmarkedEvents.userId, user!.id),
          eq(bookmarkedEvents.eventId, parseInt(eventID)),
        ),
      )
      .returning();

    if (deletedBookmark.length === 0) {
      return c.json({ error: 'Bookmark not found' }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({ deletedBookmark: deletedBookmark[0] }, HttpStatusCodes.OK);
  },
);

export default eventRouter;
