import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { users, majors } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { User, Major } from '@/db/schema';
import { authMiddleWare, unauthorizedRequest, forbiddenRequest } from '@/middlewares/auth-middleware';
import { majorSchema, userSchema } from '@/util/zod';

const majorRouter = new OpenAPIHono<Context>();

majorRouter.openapi(
	createRoute({
		method: 'get',
		path: '/',
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

majorRouter.openapi(
	createRoute({
		method: 'put',
		path: '/{major}',
		tags: ['majors'],
		summary: 'update major',
		middleware: [authMiddleWare('admin')],
		request: {
			body: {
				content: {
					'application/json': {
						schema: majorSchema,
					},
				},
			},
			params: z.object({
				major: z.string(),
			}),
		},
		responses: {
			[HttpStatusCodes.NO_CONTENT]: {
				description: 'Successful response',
			},
			...unauthorizedRequest,
			...forbiddenRequest,
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
		},
	}),
	async (c) => {
		const { name } = c.req.valid('json');
		const { major } = c.req.valid('param');

		const newMajor = await db
			.update(majors)
			.set({ name })
			.where(eq(majors.name, major))
			.returning();
		if (newMajor.length === 0) {
			return c.json({ error: 'Major not updated' }, HttpStatusCodes.CONFLICT);
		}
		return c.text('', HttpStatusCodes.NO_CONTENT);
	},
);

majorRouter.openapi(
	createRoute({
		method: 'delete',
		path: '/{major}',
		tags: ['majors'],
		summary: 'delete major',
		middleware: [authMiddleWare('admin')],
		request: {
			params: z.object({
				major: z.string(),
			}),
		},
		responses: {
			[HttpStatusCodes.NO_CONTENT]: {
				description: 'Successful response',
			},
			...unauthorizedRequest,
			...forbiddenRequest,
			[HttpStatusCodes.NOT_FOUND]: {
				content: {
					'application/json': {
						schema: z.object({
							error: z.string(),
						}),
					},
				},
				description: 'Conflict',
			},
		},
	}),
	async (c) => {
		const { major } = c.req.valid('param');
		
		const newMajor = await db
			.delete(majors)
			.where(eq(majors.name, major))
			.returning();

		if (newMajor.length === 0) {
			return c.json({ error: 'Major not deleted' }, HttpStatusCodes.NOT_FOUND);
		}
		return c.text('', HttpStatusCodes.NO_CONTENT);
	},
);

majorRouter.openapi(
	createRoute({
		method: 'post',
		path: '/',
		tags: ['majors'],
		summary: 'create major',
		middleware: [authMiddleWare('admin')],
		request: {
			body: {
				content: {
					'application/json': {
						schema: majorSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatusCodes.CREATED]: {
				content: {
					'application/json': {
						schema: majorSchema,
					},
				},
				description: 'Successful response',
			},
			...unauthorizedRequest,
			...forbiddenRequest,
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
		},
	}),
	async (c) => {
		const { name } = c.req.valid('json');
		const newMajor = await db
			.insert(majors)
			.values({ name })
			.onConflictDoNothing()
			.returning();
		if (newMajor.length === 0) {
			return c.json({ error: 'Major already exists' }, HttpStatusCodes.CONFLICT);
		}
		return c.json(newMajor[0], HttpStatusCodes.CREATED);
	},
);

majorRouter.openapi(
	createRoute({
		method: 'get',
		path: '/{majorName}/users',
		tags: ['majors'],
		summary: 'List of all users in a major',
		middleware: [authMiddleWare('admin')],
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

export default majorRouter;