import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { createSelectSchema } from 'drizzle-zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { users, projects, majors } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { User, Project, Major } from '@/db/schema';
import { authMiddleWare } from '@/middlewares/auth-middleware';

import authRouter from '@/router/v1/auth';

const v1App = new OpenAPIHono<Context>();

v1App.route('/auth', authRouter);

// Users
const userSchema = createSelectSchema(users);

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
			interests: user.interests[0],
		}));
		return c.json({ users: formattedUsers }, HttpStatusCodes.OK);
	},
);

// Projects
const projectSchema = createSelectSchema(projects);

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
		return c.json({majors: foundMajors}, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/majors/{majorName}/users',
		tags: ['majors'],
		summary: 'List all users of a major',
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
			[HttpStatusCodes.BAD_REQUEST]: {
				content: {
					'application/json': {
						schema: z.object({
							error: z.string(),
						}),
					},
				},
				description: 'Bad Request',
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
		try {
			const majorName  = c.req.param('majorName');

			if (!majorName) {
				return c.json({ error: 'Major name is required' }, HttpStatusCodes.BAD_REQUEST);
			}

			const foundUsers: User[] = await db.select().from(users).where(eq(users.major, majorName));
			const formattedUsers = foundUsers.map(user => ({
				...user,
				createdAt: user.createdAt.toISOString(),
				interests: user.interests[0],
			}));
			return c.json({ users: formattedUsers}, HttpStatusCodes.OK);
		} catch {
			return c.json({ error: 'Internal Server Error' }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
		}
	},
);

export default v1App;
