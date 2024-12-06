
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { users, eventCompanies, companies, subscribedEvents, eventsFiles, files } from '@/db/schema';
import { eq, count, getTableColumns } from 'drizzle-orm';
import type { User, Company, File } from '@/db/schema';
import { authMiddleWare } from '@/middlewares/auth-middleware';
import { companySchema, eventIDSchema, userSchema, fileSchema } from '@/util/zod';

const eventRouter = new OpenAPIHono<Context>();

eventRouter.openapi(
	createRoute({
		method: 'get',
		path: '/{eventID}/companies',
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

eventRouter.openapi(
	createRoute({
		method: 'get',
		path: '/{eventID}/subscribers',
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

eventRouter.openapi(
	createRoute({
		method: 'get',
		path: '/{eventID}/subscribers/count',
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

eventRouter.openapi(
	createRoute({
		method: 'get',
		path: '/{eventID}/files',
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

export default eventRouter;