import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import { createSelectSchema } from 'drizzle-zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { eq, count, getTableColumns } from 'drizzle-orm';
import { users, projects, events, eventCompanies, subscribedCompanies, companies, subscribedEvents, eventsFiles, files, interestedInProjects, projectsFiles } from '@/db/schema';
import type { User, Project, Event, Company, File, ProjectFile } from '@/db/schema';
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
const fileSchema = createSelectSchema(files);

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
		parameters: [
			{
				name: 'projectID',
				in: 'path',
				required: true,
				schema: z.string(),
			},
		],
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
		const projectID = c.req.param('projectID');
		const interestedUsers: User[] = await db
			.select(...getTableColumns(users))
			.from(interestedInProjects)
			.innerJoin(users, eq(users.id, interestedInProjects.userId))
			.where(eq(interestedInProjects.projectId, parseInt(projectID)));
		return c.json({ interestedUsers }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/projects/{projectID}/files',
		tags: ['projects'],
		summary: 'List all files for a project',
		middleware: [authMiddleWare('user')],
		parameters: [
			{
				name: 'projectID',
				in: 'path',
				required: true,
				schema: z.string(),
			},
		],
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
		const projectID = c.req.param('projectID');
		const projectFiles: ProjectFile[] = await db
			.select()
			.from(projectsFiles)
			.innerJoin(files, eq(files.key, projectsFiles.fileKey))
			.where(eq(projectsFiles.projectId, parseInt(projectID)));
		return c.json({ projectFiles }, HttpStatusCodes.OK);
	},
);

// Events
const eventSchema = createSelectSchema(events);
const companySchema = createSelectSchema(companies);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/events/{eventID}/companies',
		tags: ['events'],
		summary: 'List all companies for an event',
		middleware: [authMiddleWare('user')],
		parameters: [
			{
				name: 'eventID',
				in: 'path',
				required: true,
				schema: z.string(),
			},
		],
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
		const eventID = c.req.param('eventID');
		const foundEventCompanies: Company[] = await db
			.select(...getTableColumns(companies))
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
		parameters: [
			{
				name: 'eventID',
				in: 'path',
				required: true,
				schema: z.string(),
			},
		],
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
		const eventID = c.req.param('eventID');
		const eventSubscribers: User[] = await db
			.select(...getTableColumns(users))
			.from(subscribedEvents)
			.innerJoin(users, eq(users.id, subscribedEvents.userId))
			.where(eq(subscribedEvents.eventID, parseInt(eventID)));
		return c.json({ eventSubscribers }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/events/{eventID}/subscribers/count',
		tags: ['events'],
		summary: 'Get the number of subscribers for an event',
		middleware: [authMiddleWare('user')],
		parameters: [
			{
				name: 'eventID',
				in: 'path',
				required: true,
				schema: z.string(),
			},
		],
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
		const eventID = c.req.param('eventID');
		const subscribersCount = await db
			.select({ count: count() })
			.from(subscribedEvents)
			.where(eq(subscribedEvents.eventID, parseInt(eventID)));
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
		parameters: [
			{
				name: 'eventID',
				in: 'path',
				required: true,
				schema: z.string(),
			},
		],
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
		const eventID = c.req.param('eventID');
		const eventFiles: File[] = await db
			.select(...getTableColumns(files))
			.from(eventsFiles)
			.innerJoin(files, eq(files.key, eventsFiles.fileKey))
			.where(eq(eventsFiles.eventId, parseInt(eventID)));
		return c.json({ eventFiles }, HttpStatusCodes.OK);
	},
);

// Companies
v1App.openapi(
	createRoute({
		method: 'get',
		path: '/companies/{companyID}/events',
		tags: ['companies'],
		summary: 'List all events for a company',
		middleware: [authMiddleWare('user')],
		parameters: [
			{
				name: 'companyID',
				in: 'path',
				required: true,
				schema: z.string(),
			},
		],
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
		const companyID = c.req.param('companyID');
		const companyEvents: Event[] = await db
			.select(...getTableColumns(events))
			.from(eventCompanies)
			.innerJoin(events, eq(events.id, eventCompanies.eventId))
			.where(eq(eventCompanies.companyId, parseInt(companyID)));
		return c.json({ companyEvents }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/companies/{companyID}/subscribers',
		tags: ['companies'],
		summary: 'List all subscribers for a company',
		middleware: [authMiddleWare('user')],
		parameters: [
			{
				name: 'companyID',
				in: 'path',
				required: true,
				schema: z.string(),
			},
		],
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
		const companyID = c.req.param('companyID');
		const companySubscribers: User[] = await db
			.select(...getTableColumns(users))
			.from(subscribedCompanies)
			.innerJoin(users, eq(users.id, subscribedCompanies.userId))
			.where(eq(subscribedCompanies.companyId, parseInt(companyID)));
		return c.json({ companySubscribers }, HttpStatusCodes.OK);
	},
);

v1App.openapi(
	createRoute({
		method: 'get',
		path: '/companies/{companyID}/subscribers/count',
		tags: ['companies'],
		summary: 'Get the number of subscribers for a company',
		middleware: [authMiddleWare('user')],
		parameters: [
			{
				name: 'companyID',
				in: 'path',
				required: true,
				schema: z.string(),
			},
		],
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
		const companyID = c.req.param('companyID');
		const subscribersCount = await db
			.select({ count: count() })
			.from(subscribedCompanies)
			.where(eq(subscribedCompanies.companyId, parseInt(companyID)));
		return c.json({ subscribersCount: subscribersCount[0].count }, HttpStatusCodes.OK);
	},
);

export default v1App;
