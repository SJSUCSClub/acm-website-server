import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { authMiddleWare } from '@/middlewares/auth-middleware';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { users, events, subscribedCompanies, companies, subscribedEvents, equipmentRentalType, equipmentItem, equipmentRentals, userRoleEnum, equipmentConditionEnum, bookmarkedEvents } from '@/db/schema';
import { db } from '@/db/db';
import { eq, getTableColumns } from 'drizzle-orm';
import { unauthorizedRequest } from '@/middlewares/auth-middleware';
import type { User, Event, Company } from '@/db/schema';
import type { Context } from '@/lib/context';
import { userSchema, companySchema, bookmarkSchema, updateUserSchema, userIdSchema, eventSchema } from '@/util/zod';

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
		const formattedUsers = foundUsers.map(user => ({
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

		return c.json({
			...user,
			createdAt: user.createdAt.toISOString(),
			gradDate: user.gradDate,
		}, HttpStatusCodes.OK);
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
		return c.json({
			...user,
			createdAt: user.createdAt.toISOString(),
			gradDate: user.gradDate,
		}, HttpStatusCodes.OK);
	},
);

userRouter.openapi(
	createRoute({
		method: 'get',
		path: '/rental-history',
		tags: ['users'],
		summary: 'Get current user\'s equipment rental history',
		middleware: [authMiddleWare('user')],
		responses: {
			[HttpStatusCodes.OK]: {
				description: 'Successful response',
				content: {
					'application/json': {
						schema: z.object({
							rentals: z.array(z.object({
								itemId: z.number(),
								dateBorrowed: z.string(),
								returnDate: z.string(),
								price: z.number(),
								condition: z.enum(equipmentConditionEnum.enumValues),
								equipmentType: z.object({
									name: z.string(),
									description: z.string().nullable(),
								}),
							})),
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
			.innerJoin(
				equipmentItem,
				eq(equipmentRentals.itemId, equipmentItem.id),
			)
			.innerJoin(
				equipmentRentalType,
				eq(equipmentItem.equipmentType, equipmentRentalType.id),
			)
			.where(eq(equipmentRentals.userId, session.userId));
		return c.json({
			rentals: rentals.map(rental => ({
				...rental,
				price: Number(rental.price),
				dateBorrowed: rental.dateBorrowed,
				returnDate: rental.returnDate,
			})),
		}, HttpStatusCodes.OK);
	},
);

// GET /users/bookmarks
userRouter.openapi(
	createRoute({
		method: 'get',
		path: '/bookmarks',
		tags: ['users'],
		summary: 'Get current user\'s bookmarks',
		middleware: [authMiddleWare('user')],
		responses: {
			[HttpStatusCodes.OK]: {
				description: 'Successful response',
				content: {
					'application/json': {
						schema: z.object({
							bookmarks: z.array(bookmarkSchema),
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
			.select()
			.from(bookmarkedEvents)
			.where(eq(bookmarkedEvents.userId, session.userId));

		return c.json({ bookmarks }, HttpStatusCodes.OK);
	},
);

userRouter.openapi(
	createRoute({
		method: 'get',
		path: '/subscriptions',
		tags: ['users'],
		summary: 'Get current user\'s subscriptions',
		middleware: [authMiddleWare('user')],
		responses: {
			[HttpStatusCodes.OK]: {
				description: 'Successful response',
				content: {
					'application/json': {
						schema: z.object({
							companies: z.array(companySchema),
							events: z.array(eventSchema),
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
		const foundSubscribedCompanies: Company[] = await db
			.select(getTableColumns(companies))
			.from(subscribedCompanies)
			.innerJoin(companies, eq(companies.id, subscribedCompanies.companyId))
			.where(eq(subscribedCompanies.userId, session.userId));

		// Get subscribed events
		const foundSubscribedEvents: Event[] = await db
			.select(getTableColumns(events))
			.from(subscribedEvents)
			.innerJoin(events, eq(events.id, subscribedEvents.eventId))
			.where(eq(subscribedEvents.userId, session.userId));

		// Format events to match schema
		const formattedEvents = foundSubscribedEvents.map(event => ({
			...event,
			createdAt: event.createdAt.toISOString(),
		}));

		return c.json({
			companies: foundSubscribedCompanies,
			events: formattedEvents,
		}, HttpStatusCodes.OK);
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

    return c.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
      gradDate: user.gradDate,
    }, HttpStatusCodes.OK);
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
    const updateData = updateUserSchema.extend({
      role: z.enum(userRoleEnum.enumValues).optional(),
    }).parse(body);

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
    return c.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
      gradDate: user.gradDate,
    }, HttpStatusCodes.OK);
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

    await db
      .delete(users)
      .where(eq(users.id, userId));

    return c.json({ success: true }, HttpStatusCodes.OK);
  },
);

export default userRouter;