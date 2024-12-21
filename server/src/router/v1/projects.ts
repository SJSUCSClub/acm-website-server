import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { users, projects, files, interestedInProjects, projectsFiles } from '@/db/schema';
import { eq, getTableColumns } from 'drizzle-orm';
import type { User, Project, File } from '@/db/schema';
import { authMiddleWare, unauthorizedRequest, forbiddenRequest } from '@/middlewares/auth-middleware';
import { projectIDSchema, userSchema, fileSchema, projectSchema } from '@/util/zod';

const projectRouter = new OpenAPIHono<Context>();

projectRouter.openapi(
	createRoute({
		method: 'get',
		path: '/',
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

projectRouter.openapi(
	createRoute({
		method: 'get',
		path: '/{projectID}/interested',
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

projectRouter.openapi(
	createRoute({
		method: 'get',
		path: '/{projectID}/files',
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

projectRouter.openapi(
	createRoute({
		method: 'post',
		path: '/',
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
			...unauthorizedRequest,
			...forbiddenRequest,
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

export default projectRouter;