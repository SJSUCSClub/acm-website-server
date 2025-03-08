import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { authMiddleWare } from '@/middlewares/auth-middleware';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import {
  users,
  events,
  subscribedCompanies,
  companies,
  subscribedEvents,
  equipmentRentalType,
  equipmentItem,
  equipmentRentals,
  userRoleEnum,
  equipmentConditionEnum,
  bookmarkedEvents,
  projects,
  interestedInProjects,
  attendingEvents,
} from '@/db/schema';
import { db } from '@/db/db';
import { eq, getTableColumns, and } from 'drizzle-orm';
import { unauthorizedRequest } from '@/middlewares/auth-middleware';
import type { User } from '@/db/schema';
import type { Context } from '@/lib/context';
import {
  userSchema,
  updateUserSchema,
  userIdSchema,
  eventIDSchema,
  companyIDSchema,
  projectSchema,
  bookmarkedEvent,
  subscribedEvent,
  subscribedCompany,
  errorSchema,
  attendingEvent,
} from '@/util/zod';

const userRouter = new OpenAPIHono<Context>();

userRouter.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['users'],
    summary: 'Admin List all users',
    middleware: [authMiddleWare('admin')],
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              users: z.array(userSchema),
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const foundUsers: User[] = await db.select().from(users);
    const formattedUsers = foundUsers.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }));
    return c.json({ users: formattedUsers }, HttpStatusCodes.OK);
  },
);

userRouter.openapi(
  createRoute({
    method: 'get',
    path: '/my',
    tags: ['users'],
    summary: 'Get current user',
    middleware: [authMiddleWare('user')],
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: userSchema,
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const session = c.get('session');
    if (!session) {
      return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
    }
    const user: User = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .then((res) => res[0]);

    return c.json(
      {
        ...user,
        createdAt: user.createdAt.toISOString(),
        gradDate: user.gradDate,
      },
      HttpStatusCodes.OK,
    );
  },
);

userRouter.openapi(
  createRoute({
    method: 'put',
    path: '/my',
    tags: ['users'],
    summary: 'Update current user',
    middleware: [authMiddleWare('user')],
    request: {
      body: {
        content: {
          'application/json': {
            schema: updateUserSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successfully updated user',
        content: {
          'application/json': {
            schema: userSchema,
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const session = c.get('session');
    const body = await c.req.json();
    const updateData = updateUserSchema.parse(body);
    if (!session) {
      return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
    }

    const updatedUser = await db
      .update(users)
      .set({
        ...updateData,
        gradDate: updateData.gradDate?.toISOString(),
      })
      .where(eq(users.id, session.userId))
      .returning();

    const user = updatedUser[0];
    return c.json(
      {
        ...user,
        createdAt: user.createdAt.toISOString(),
        gradDate: user.gradDate,
      },
      HttpStatusCodes.OK,
    );
  },
);

userRouter.openapi(
  createRoute({
    method: 'get',
    path: '/my/rental-history',
    tags: ['users'],
    summary: "Get current user's equipment rental history",
    middleware: [authMiddleWare('user')],
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: z.object({
              rentals: z.array(
                z.object({
                  itemId: z.number(),
                  dateBorrowed: z.string(),
                  returnDate: z.string(),
                  price: z.number(),
                  condition: z.enum(equipmentConditionEnum.enumValues),
                  equipmentType: z.object({
                    name: z.string(),
                    description: z.string().nullable(),
                  }),
                }),
              ),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const session = c.get('session');
    if (!session) {
      return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
    }

    const rentals = await db
      .select({
        itemId: equipmentRentals.itemId,
        dateBorrowed: equipmentRentals.dateBorrowed,
        returnDate: equipmentRentals.returnDate,
        price: equipmentRentals.price,
        condition: equipmentRentals.condition,
        equipmentType: {
          name: equipmentRentalType.name,
          description: equipmentRentalType.description,
        },
      })
      .from(equipmentRentals)
      .innerJoin(equipmentItem, eq(equipmentRentals.itemId, equipmentItem.id))
      .innerJoin(
        equipmentRentalType,
        eq(equipmentItem.equipmentType, equipmentRentalType.id),
      )
      .where(eq(equipmentRentals.userId, session.userId));
    return c.json(
      {
        rentals: rentals.map((rental) => ({
          ...rental,
          price: Number(rental.price),
          dateBorrowed: rental.dateBorrowed,
          returnDate: rental.returnDate,
        })),
      },
      HttpStatusCodes.OK,
    );
  },
);

// GET /users/bookmarks
userRouter.openapi(
  createRoute({
    method: 'get',
    path: '/my/bookmarks',
    tags: ['users'],
    summary: "Get current user's bookmarks",
    middleware: [authMiddleWare('user')],
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: z.object({
              bookmarks: z.array(bookmarkedEvent),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const session = c.get('session');
    if (!session) {
      return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
    }
    const bookmarks = await db
      .select({
        ...getTableColumns(events),
        bookmarkedDate: bookmarkedEvents.bookmarkedDate,
      })
      .from(bookmarkedEvents)
      .innerJoin(events, eq(events.id, bookmarkedEvents.eventId))
      .where(eq(bookmarkedEvents.userId, session.userId));

    return c.json({ bookmarks }, HttpStatusCodes.OK);
  },
);

userRouter.openapi(
  createRoute({
    method: 'get',
    path: '/my/bookmarked/{eventID}',
    tags: ['users'],
    summary: 'Check if current user has bookmarked an event',
    middleware: [authMiddleWare('user')],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: z.object({
              bookmarked: z.boolean(),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const session = c.get('session');
    if (!session) {
      return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
    }
    const { eventID } = c.req.valid('param');
    const bookmark = await db
      .select()
      .from(bookmarkedEvents)
      .where(
        and(
          eq(bookmarkedEvents.userId, session.userId),
          eq(bookmarkedEvents.eventId, parseInt(eventID)),
        ),
      );

    return c.json({ bookmarked: bookmark.length > 0 }, HttpStatusCodes.OK);
  },
);

userRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/my/bookmarked/{eventID}',
    tags: ['users'],
    summary: 'Delete a bookmarked event',
    middleware: [authMiddleWare('user')],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'Successful response',
      },
      [HttpStatusCodes.BAD_REQUEST]: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    try {
      const session = c.get('session');
      if (!session) {
        return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
      }

      const eventID = c.req.param('eventID');
      if (!eventID) {
        return c.json(
          { error: 'Event ID not provided' },
          HttpStatusCodes.BAD_REQUEST,
        );
      }

      await db
        .delete(bookmarkedEvents)
        .where(
          and(
            eq(bookmarkedEvents.userId, session.userId),
            eq(bookmarkedEvents.eventId, parseInt(eventID)),
          ),
        );

      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

userRouter.openapi(
  createRoute({
    method: 'get',
    path: '/my/subscribed-events',
    tags: ['users'],
    summary: "Get authenticated user's subscribed events",
    middleware: [authMiddleWare('user')],
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: z.object({
              events: z.array(subscribedEvent),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const session = c.get('session');
    if (!session) {
      return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
    }

    // Get subscribed events
    const foundSubscribedEvents = await db
      .select({
        ...getTableColumns(events),
        subscribedDate: subscribedEvents.subscribedDate,
      })
      .from(subscribedEvents)
      .innerJoin(events, eq(events.id, subscribedEvents.eventId))
      .where(eq(subscribedEvents.userId, session.userId));

    return c.json(
      {
        events: foundSubscribedEvents,
      },
      HttpStatusCodes.OK,
    );
  },
);

userRouter.openapi(
  createRoute({
    method: 'get',
    path: '/my/subscribed-events/{eventID}',
    tags: ['users'],
    summary: 'Check if current user has subscribed to an event',
    middleware: [authMiddleWare('user')],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: z.object({
              subscribed: z.boolean(),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const session = c.get('session');
    if (!session) {
      return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
    }
    const { eventID } = c.req.valid('param');
    const sub = await db
      .select()
      .from(subscribedEvents)
      .where(
        and(
          eq(subscribedEvents.userId, session.userId),
          eq(subscribedEvents.eventId, parseInt(eventID)),
        ),
      );

    return c.json({ subscribed: sub.length > 0 }, HttpStatusCodes.OK);
  },
);

userRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/my/subscribed-events/{eventID}',
    tags: ['users'],
    summary: 'Delete a subscribed event',
    middleware: [authMiddleWare('user')],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'Successful response',
      },
      [HttpStatusCodes.BAD_REQUEST]: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    try {
      const session = c.get('session');
      if (!session) {
        return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
      }
      const eventID = c.req.param('eventID');
      if (!eventID) {
        return c.json(
          { error: 'Event ID not provided' },
          HttpStatusCodes.BAD_REQUEST,
        );
      }

      await db
        .delete(subscribedEvents)
        .where(
          and(
            eq(subscribedEvents.userId, session.userId),
            eq(subscribedEvents.eventId, parseInt(eventID)),
          ),
        );

      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

userRouter.openapi(
  createRoute({
    method: 'get',
    path: '/my/subscribed-companies',
    tags: ['users'],
    summary: "Get authenticated user's subscribed companies",
    middleware: [authMiddleWare('user')],
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: z.object({
              companies: z.array(subscribedCompany),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const session = c.get('session');
    if (!session) {
      return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
    }

    // Get subscribed companies
    const foundSubscribedCompanies = await db
      .select({
        ...getTableColumns(companies),
        subscribedDate: subscribedCompanies.subscribedDate,
      })
      .from(subscribedCompanies)
      .innerJoin(companies, eq(companies.id, subscribedCompanies.companyId))
      .where(eq(subscribedCompanies.userId, session.userId));

    return c.json(
      {
        companies: foundSubscribedCompanies,
      },
      HttpStatusCodes.OK,
    );
  },
);

userRouter.openapi(
  createRoute({
    method: 'get',
    path: '/my/subscribed-companies/{companyID}',
    tags: ['users'],
    summary: 'Check if current user has subscribed to a company',
    middleware: [authMiddleWare('user')],
    request: {
      params: companyIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: z.object({
              subscribed: z.boolean(),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const session = c.get('session');
    if (!session) {
      return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
    }
    const { companyID } = c.req.valid('param');
    const sub = await db
      .select()
      .from(subscribedCompanies)
      .where(
        and(
          eq(subscribedCompanies.userId, session.userId),
          eq(subscribedCompanies.companyId, parseInt(companyID)),
        ),
      );

    return c.json({ subscribed: sub.length > 0 }, HttpStatusCodes.OK);
  },
);

userRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/my/subscribed-companies/{companyID}',
    tags: ['users'],
    summary: "Delete a company from a user's subscribed companies",
    middleware: [authMiddleWare('user')],
    request: {
      params: companyIDSchema,
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'Successful response',
      },
      [HttpStatusCodes.BAD_REQUEST]: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    try {
      const session = c.get('session');
      if (!session) {
        return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
      }

      const companyID = c.req.param('companyID');
      if (!companyID) {
        return c.json(
          { error: 'Company ID not provided' },
          HttpStatusCodes.BAD_REQUEST,
        );
      }

      await db
        .delete(subscribedCompanies)
        .where(
          and(
            eq(subscribedCompanies.userId, session.userId),
            eq(subscribedCompanies.companyId, parseInt(companyID)),
          ),
        );

      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

userRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{userId}',
    tags: ['users'],
    summary: 'Admin Get a user by ID',
    middleware: [authMiddleWare('admin')],
    request: {
      params: userIdSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: userSchema,
          },
        },
      },
      [HttpStatusCodes.NOT_FOUND]: {
        description: 'User not found',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const { userId } = c.req.valid('param');
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((res) => res[0]);

    if (!user) {
      return c.json({ error: 'User not found' }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json(
      {
        ...user,
        createdAt: user.createdAt.toISOString(),
        gradDate: user.gradDate,
      },
      HttpStatusCodes.OK,
    );
  },
);

userRouter.openapi(
  createRoute({
    method: 'put',
    path: '/{userId}',
    tags: ['users'],
    summary: 'Admin Update a user',
    middleware: [authMiddleWare('admin')],
    request: {
      params: userIdSchema,
      body: {
        content: {
          'application/json': {
            schema: updateUserSchema.extend({
              role: z.enum(userRoleEnum.enumValues).optional(),
            }),
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successfully updated user',
        content: {
          'application/json': {
            schema: userSchema,
          },
        },
      },
      [HttpStatusCodes.NOT_FOUND]: {
        description: 'User not found',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const { userId } = c.req.valid('param');
    const body = await c.req.json();
    const updateData = updateUserSchema
      .extend({
        role: z.enum(userRoleEnum.enumValues).optional(),
      })
      .parse(body);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((res) => res[0]);

    if (!existingUser) {
      return c.json({ error: 'User not found' }, HttpStatusCodes.NOT_FOUND);
    }

    const updatedUser = await db
      .update(users)
      .set({
        ...updateData,
        gradDate: updateData.gradDate?.toISOString(),
      })
      .where(eq(users.id, userId))
      .returning();

    const user = updatedUser[0];
    return c.json(
      {
        ...user,
        createdAt: user.createdAt.toISOString(),
        gradDate: user.gradDate,
      },
      HttpStatusCodes.OK,
    );
  },
);

userRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{userId}',
    tags: ['users'],
    summary: 'Admin Delete a user',
    middleware: [authMiddleWare('admin')],
    request: {
      params: userIdSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successfully deleted user',
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
            }),
          },
        },
      },
      [HttpStatusCodes.NOT_FOUND]: {
        description: 'User not found',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const { userId } = c.req.valid('param');

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((res) => res[0]);

    if (!existingUser) {
      return c.json({ error: 'User not found' }, HttpStatusCodes.NOT_FOUND);
    }

    await db.delete(users).where(eq(users.id, userId));

    return c.json({ success: true }, HttpStatusCodes.OK);
  },
);

userRouter.openapi(
  createRoute({
    method: 'get',
    path: '/my/projects-interest',
    tags: ['users'],
    summary: 'List all project ids that the user is interested in',
    middleware: [authMiddleWare('user')],
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              projects: z.array(projectSchema),
            }),
          },
        },
        description: 'Successful response',
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const user = c.get('user');

    const projectsInInterest = await db
      .select(getTableColumns(projects))
      .from(interestedInProjects)
      .innerJoin(projects, eq(projects.id, interestedInProjects.projectId))
      .where(eq(interestedInProjects.userId, user?.id || ''));

    return c.json({ projects: projectsInInterest }, HttpStatusCodes.OK);
  },
);

userRouter.openapi(
  createRoute({
    method: 'post',
    path: '/my/projects-interest/{projectID}',
    tags: ['users'],
    summary: 'Show interest in a project',
    middleware: [authMiddleWare('user')],
    request: {
      params: z.object({
        projectID: z.string(),
      }),
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'Successful response',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    try {
      const user = c.get('user');
      const projectID = c.req.param('projectID');

      if (!user || !projectID) {
        return c.text('', HttpStatusCodes.UNAUTHORIZED);
      }

      await db.insert(interestedInProjects).values({
        userId: user.id,
        projectId: parseInt(projectID),
      });

      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

userRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/my/projects-interest/{projectID}',
    tags: ['users'],
    summary: 'Delete interest in a project',
    middleware: [authMiddleWare('user')],
    request: {
      params: z.object({
        projectID: z.string(),
      }),
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'Successful response',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    try {
      const user = c.get('user');
      const projectID = c.req.param('projectID');

      if (!user || !projectID) {
        return c.text('', HttpStatusCodes.UNAUTHORIZED);
      }

      await db
        .delete(interestedInProjects)
        .where(
          and(
            eq(interestedInProjects.userId, user.id),
            eq(interestedInProjects.projectId, parseInt(projectID)),
          ),
        );

      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

userRouter.openapi(
  createRoute({
    method: 'get',
    path: '/my/attending-events',
    tags: ['users'],
    summary: 'Get all events a user is attending',
    middleware: [authMiddleWare('user')],
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: z.object({
              events: z.array(attendingEvent),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
    }

    const foundAttendingEvents = await db
      .select({
        ...getTableColumns(events),
        attendingDate: attendingEvents.attendingDate,
      })
      .from(attendingEvents)
      .innerJoin(events, eq(events.id, attendingEvents.eventId))
      .where(eq(attendingEvents.userId, user.id));

    return c.json({ events: foundAttendingEvents }, HttpStatusCodes.OK);
  },
);

userRouter.openapi(
  createRoute({
    method: 'get',
    path: '/my/attending-events/{eventID}',
    tags: ['users'],
    summary: 'Check if user is attending an event',
    middleware: [authMiddleWare('user')],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: z.object({
              attending: z.boolean(),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const session = c.get('session');
    if (!session) {
      return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
    }
    const { eventID } = c.req.valid('param');
    const attendance = await db
      .select()
      .from(attendingEvents)
      .where(
        and(
          eq(attendingEvents.userId, session.userId),
          eq(attendingEvents.eventId, parseInt(eventID)),
        ),
      );

    return c.json({ attending: attendance.length > 0 }, HttpStatusCodes.OK);
  },
);

export default userRouter;
