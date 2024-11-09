import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { createSelectSchema } from 'drizzle-zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { eq, count, getTableColumns, and } from 'drizzle-orm';
import { users, projects, majors, events, eventCompanies, subscribedCompanies, companies, subscribedEvents, eventsFiles, files, interestedInProjects, projectsFiles, equipmentRentalType, equipmentItem, equipmentRentals } from '@/db/schema';
import type { User, Project, Event, Company, File, Major, EquipmentRentalType, EquipmentItem, EquipmentRental } from '@/db/schema';
import { csFieldsEnum } from '@/db/schema';
import { authMiddleWare } from '@/middlewares/auth-middleware';

import authRouter from '@/router/v1/auth';

const v1App = new OpenAPIHono<Context>();

v1App.route('/auth', authRouter);

// Users
const userSchema = createSelectSchema(users).extend({
	interests: z.array(z.enum(csFieldsEnum.enumValues)),
});

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/users',
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

// Projects
const projectSchema = createSelectSchema(projects);
const fileSchema = createSelectSchema(files);
const projectIDSchema = z.object({
	projectID: z.string(),
});

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/projects',
		tags: ['projects'],
		summary: 'List all projects',
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
		},
	}),
	async (c) => {
		const foundProjects: Project[] = await db.select().from(projects);
		return c.json({ projects: foundProjects }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/projects/{projectID}/interested',
		tags: ['projects'],
		summary: 'List all interested users for a project',
		middleware: [authMiddleWare('user')],
		request: {
			params: projectIDSchema,
		},
		responses: {
			[HttpStatusCodes.OK]: {
				content: {
					'application/json': {
						schema: z.object({
							interestedUsers: z.array(userSchema),
						}),
					},
				},
				description: 'Successful response',
			},
		},
	}),
	async (c) => {
		const { projectID } = c.req.valid('param');
		const interestedUsers: User[] = await db
			.select(getTableColumns(users))
			.from(interestedInProjects)
			.innerJoin(users, eq(users.id, interestedInProjects.userId))
			.where(eq(interestedInProjects.projectId, parseInt(projectID)));

		const formattedInterestedUsers = interestedUsers.map(user => ({
			...user,
			createdAt: user.createdAt.toISOString(),
		}));

		return c.json({ interestedUsers: formattedInterestedUsers }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/projects/{projectID}/files',
		tags: ['projects'],
		summary: 'List all files for a project',
		middleware: [authMiddleWare('user')],
		request: {
			params: projectIDSchema,
		},
		responses: {
			[HttpStatusCodes.OK]: {
				content: {
					'application/json': {
						schema: z.object({
							projectFiles: z.array(fileSchema),
						}),
					},
				},
				description: 'Successful response',
			},
		},
	}),
	async (c) => {
		const { projectID } = c.req.valid('param');
		const projectFiles: File[] = await db
			.select(getTableColumns(files))
			.from(projectsFiles)
			.innerJoin(files, eq(files.key, projectsFiles.fileKey))
			.where(eq(projectsFiles.projectId, parseInt(projectID)));

		return c.json({ projectFiles }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'post',
		path: '/projects',
		tags: ['projects'],
		summary: 'Creates a new project',
		middleware: [authMiddleWare('admin')],
		request: {
			body: {
				content: {
					'application/json': {
						schema: projectSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatusCodes.CREATED]: {
				content: {
					'application/json': {
						schema: z.object({
							project: projectSchema,
						}),
					},
				},
				description: 'Successful response',
			},
			[HttpStatusCodes.UNAUTHORIZED]: {
				content: {
					'application/json': {
						schema: z.object({
							error: z.string(),
						}),
					},
				},
				description: 'Unauthorized',
			},
			[HttpStatusCodes.FORBIDDEN]: {
				content: {
					'application/json': {
						schema: z.object({
							error: z.string(),
						}),
					},
				},
				description: 'Forbidden',
			},
		},
	}),
	async (c) => {
		const { id, name, description, githubLink } = c.req.valid('json');
		const newProject = await db
			.insert(projects).values({ id, name, description, githubLink })
			// .onConflictDoNothing()
			.returning();
		return c.json({ project: newProject[0] }, HttpStatusCodes.CREATED);
	},
);

// Events
const baseEventSchema = createSelectSchema(events);
const eventSchema = baseEventSchema.extend({
	tags: z.array(z.enum(csFieldsEnum.enumValues)),
	urls: z.array(z.string()),
});

const companySchema = createSelectSchema(companies);
const eventIDSchema = z.object({
	eventID: z.string(),
});

const subscribedEventSchema = createSelectSchema(subscribedEvents);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/events',
		tags: ['events'],
		summary: 'List all events',
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
		const foundEvents: Event[] = await db
			.select()
			.from(events);
		return c.json({ foundEvents }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'post',
		path: '/events',
		tags: ['events'],
		summary: 'Create an event',
		middleware: [authMiddleWare('admin')],
		request: {
			body: {
				content: {
					'application/json': {
						schema: eventSchema.omit({ id: true, createdAt: true}),
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
			[HttpStatusCodes.UNAUTHORIZED]: {
				content: {
					'application/json': {
						schema: z.object({
							error: z.string(),
						}),
					},
				},
				description: 'Unauthorized',
			},
			[HttpStatusCodes.FORBIDDEN]: {
				content: {
					'application/json': {
						schema: z.object({
							error: z.string(),
						}),
					},
				},
				description: 'Forbidden',
			},
		},
	}),
	async (c) => {
		const { name, location, startDate, endDate, description, urls, eventType, eventCapacity, image, startTime, endTime, tags, targetAudience, shortenedEventUrl } = c.req.valid('json');
		const newEvent = await db
			.insert(events).values({ name, location, startDate, endDate, description, urls, eventType, eventCapacity, image, startTime, endTime, tags, targetAudience, shortenedEventUrl })
			.returning();
		return c.json({ event: newEvent[0] }, HttpStatusCodes.CREATED);
	},
);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/events/{eventID}',
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
		},
	}),
	async (c) => {
		const { eventID } = c.req.valid('param');
		const foundEvents: Event[] = await db
			.select()
			.from(events)
			.where(eq(events.id, parseInt(eventID)));
		return c.json({ foundEvent: foundEvents[0] }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/events/{eventID}/companies',
		tags: ['events'],
		summary: 'List all companies for an event',
		middleware: [authMiddleWare('user')],
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

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/events/{eventID}/subscribers',
		tags: ['events'],
		summary: 'List all subscribers for an event',
		middleware: [authMiddleWare('user')],
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
		const formattedEventSubscribers = eventSubscribers.map(user => ({
			...user,
			createdAt: user.createdAt.toISOString(),
		}));
		return c.json({ eventSubscribers: formattedEventSubscribers }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/events/{eventID}/subscribers/count',
		tags: ['events'],
		summary: 'Get the number of subscribers for an event',
		middleware: [authMiddleWare('user')],
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
		return c.json({ subscribersCount: subscribersCount[0].count }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/events/{eventID}/files',
		tags: ['events'],
		summary: 'List all files for an event',
		middleware: [authMiddleWare('user')],
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

v1App.openapi(
	createRoute({
		method: 'post',
		path: '/events/{eventID}/subscribe',
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
			[HttpStatusCodes.UNAUTHORIZED]: {
				content: {
					'application/json': {
						schema: z.object({
							error: z.string(),
						}),
					},
				},
				description: 'Unauthorized',
			},
			[HttpStatusCodes.FORBIDDEN]: {
				content: {
					'application/json': {
						schema: z.object({
							error: z.string(),
						}),
					},
				},
				description: 'Forbidden',
			},
		},
	}),
	async (c) => {
		const user = c.get('user');
		const { eventID } = c.req.valid('param');

		if (!user) {
			return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
		}

		const newSubscription = await db
			.insert(subscribedEvents)
			.values({ userId: user.id, eventId: parseInt(eventID) })
			.onConflictDoNothing()
			.returning();

		if (newSubscription.length === 0) {
			return c.json({ error: 'Subscription already exists' }, HttpStatusCodes.CONFLICT);
		}

		return c.json({ newSubscription: newSubscription[0] }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'delete',
		path: '/events/{eventID}/subscribe',
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
			[HttpStatusCodes.UNAUTHORIZED]: {
				content: {
					'application/json': {
						schema: z.object({
							error: z.string(),
						}),
					},
				},
				description: 'Unauthorized',
			},
			[HttpStatusCodes.FORBIDDEN]: {
				content: {
					'application/json': {
						schema: z.object({
							error: z.string(),
						}),
					},
				},
				description: 'Forbidden',
			},
		},
	}),
	async (c) => {
		const user = c.get('user');
		const { eventID } = c.req.valid('param');

		if (!user) {
			return c.json({ error: 'Unauthorized' }, HttpStatusCodes.UNAUTHORIZED);
		}
		
		const deletedSubscription = await db
			.delete(subscribedEvents)
			.where(
				and(
				  eq(subscribedEvents.userId, user.id),
				  eq(subscribedEvents.eventId, parseInt(eventID)),
				),
			  ).returning();
		
		if (deletedSubscription.length === 0) {
			return c.json({ error: 'Subscription not found' }, HttpStatusCodes.NOT_FOUND);
		}
		
		const formattedDeletedSubscription = deletedSubscription.map(sub => ({
			...sub,
			subscribedDate: sub.subscribedDate.toISOString(),
		}));
		return c.json({ deletedSubscription: formattedDeletedSubscription[0] }, HttpStatusCodes.OK);
	},
);

// Companies
const companyIDSchema = z.object({
	companyID: z.string(),
});

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/companies/{companyID}/events',
		tags: ['companies'],
		summary: 'List all events for a company',
		middleware: [authMiddleWare('user')],
		request: {
			params: companyIDSchema,
		},
		responses: {
			[HttpStatusCodes.OK]: {
				content: {
					'application/json': {
						schema: z.object({
							companyEvents: z.array(eventSchema),
						}),
					},
				},
				description: 'Successful response',
			},
		},
	}),
	async (c) => {
		const { companyID } = c.req.valid('param');
		const companyEvents: Event[] = await db
			.select(getTableColumns(events))
			.from(eventCompanies)
			.innerJoin(events, eq(events.id, eventCompanies.eventId))
			.where(eq(eventCompanies.companyId, parseInt(companyID)));
		const formattedCompanyEvents = companyEvents.map(event => ({
			...event,
			createdAt: event.createdAt.toISOString(),
		}));
		return c.json({ companyEvents: formattedCompanyEvents }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/companies/{companyID}/subscribers',
		tags: ['companies'],
		summary: 'List all subscribers for a company',
		middleware: [authMiddleWare('user')],
		request: {
			params: companyIDSchema,
		},
		responses: {
			[HttpStatusCodes.OK]: {
				content: {
					'application/json': {
						schema: z.object({
							companySubscribers: z.array(userSchema),
						}),
					},
				},
				description: 'Successful response',
			},
		},
	}),
	async (c) => {
		const { companyID } = c.req.valid('param');
		const companySubscribers: User[] = await db
			.select(getTableColumns(users))
			.from(subscribedCompanies)
			.innerJoin(users, eq(users.id, subscribedCompanies.userId))
			.where(eq(subscribedCompanies.companyId, parseInt(companyID)));
		const formattedCompanySubscribers = companySubscribers.map(user => ({
			...user,
			createdAt: user.createdAt.toISOString(),
			interests: user.interests,
		}));
		return c.json({ companySubscribers: formattedCompanySubscribers }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/companies/{companyID}/subscribers/count',
		tags: ['companies'],
		summary: 'Get the number of subscribers for a company',
		middleware: [authMiddleWare('user')],
		request: {
			params: companyIDSchema,
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
		const {	 companyID } = c.req.valid('param');
		const subscribersCount = await db
			.select({ count: count() })
			.from(subscribedCompanies)
			.where(eq(subscribedCompanies.companyId, parseInt(companyID)));
		return c.json({ subscribersCount: subscribersCount[0].count }, HttpStatusCodes.OK);
	},
);

// Equipment
const equipmentRentalTypeSchema = createSelectSchema(equipmentRentalType);
const equipmentItemSchema = createSelectSchema(equipmentItem);
const equipmentRentalSchema = createSelectSchema(equipmentRentals);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/equipment-rentals',
		tags: ['equipment'],
		summary: 'List of all equipment types',
		responses: {
			[HttpStatusCodes.OK]: {
				content: {
					'application/json': {
						schema: z.object({
							equipmentTypes: z.array(equipmentRentalTypeSchema),
						}),
					},
				},
				description: 'Successful response',
			},
		},
	}),
	async (c) => {
		const foundEquipmentTypes: EquipmentRentalType[] = await db.select().from(equipmentRentalType);
		return c.json({ equipmentTypes: foundEquipmentTypes }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/equipment-rentals/{equipmentTypeID}/equipment-items',
		tags: ['equipment'],
		summary: 'List of all equipment items for a type',
		request: {
			params: z.object({
				equipmentTypeID: z.string(),
			}),
		},
		responses: {
			[HttpStatusCodes.OK]: {
				content: {
					'application/json': {
						schema: z.object({
							equipmentItems: z.array(equipmentItemSchema),
						}),
					},
				},
				description: 'Successful response',
			},
		},
	}),
	async (c) => {
		const { equipmentTypeID } = c.req.valid('param');
		const foundEquipmentItems: EquipmentItem[] = await db
			.select()
			.from(equipmentItem)
			.where(eq(equipmentItem.equipmentType, parseInt(equipmentTypeID)));
		return c.json({ equipmentItems: foundEquipmentItems }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/equipment-rentals/equipment-item/{equipmentItemID}/rental-history',
		tags: ['equipment'],
		summary: 'Lists rental history for an equipment item',
		request: {
			params: z.object({
				equipmentItemID: z.string(),
			}),
		},
		responses: {
			[HttpStatusCodes.OK]: {
				content: {
					'application/json': {
						schema: z.object({
							rentalHistory: z.array(equipmentRentalSchema),
						}),
					},
				},
				description: 'Successful response',
			},
		},
	}),
	async (c) => {
		const { equipmentItemID } = c.req.valid('param');
		const rentalHistory: EquipmentRental[] = await db
			.select()
			.from(equipmentRentals)
			.where(eq(equipmentRentals.itemId, parseInt(equipmentItemID)));
		return c.json({ rentalHistory }, HttpStatusCodes.OK);
	},
);

// Majors
const majorSchema = createSelectSchema(majors);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/majors',
		tags: ['majors'],
		summary: 'List all majors',
		responses: {
			[HttpStatusCodes.OK]: {
				content: {
					'application/json': {
						schema: z.object({
							majors: z.array(majorSchema),
						}),
					},
				},
				description: 'Successful response',
			},
		},
	}),
	async (c) => {
		const foundMajors: Major[] = await db.select().from(majors);
		return c.json({ majors: foundMajors }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/majors/{majorName}/users',
		tags: ['majors'],
		summary: 'List of all users in a major',
		middleware: [authMiddleWare('user')],
		request: {
			params: z.object({
				majorName: z.string(),
			}),
		},
		responses: {
			[HttpStatusCodes.OK]: {
				content: {
					'application/json': {
						schema: z.object({
							majorUsers: z.array(userSchema),
						}),
					},
				},
				description: 'Successful response',
			},
		},
	}),
	async (c) => {
		const { majorName } = c.req.valid('param');
		const majorUsers: User[] = await db
			.select()
			.from(users)
			.where(eq(users.major, majorName));
		const formattedMajorUsers = majorUsers.map(user => ({
			...user,
			createdAt: user.createdAt.toISOString(),
		}));
		return c.json({ majorUsers: formattedMajorUsers }, HttpStatusCodes.OK);
	},
);

export default v1App;
