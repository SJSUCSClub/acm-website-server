import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import {
  users,
  projects,
  files,
  interestedInProjects,
  projectsFiles,
} from '@/db/schema';
import { eq, getTableColumns } from 'drizzle-orm';
import type { User, Project, File as FileSchema } from '@/db/schema'; // naming conflict with File and schema File type
import {
  authMiddleWare,
  unauthorizedRequest,
  forbiddenRequest,
} from '@/middlewares/auth-middleware';
import {
  projectIDSchema,
  userSchema,
  fileSchema,
  projectSchema,
  errorSchema,
  newProjectSchema,
} from '@/util/zod';
import { uploadFile, deleteFile, generateObjectUrl } from '@/lib/aws/s3';

const projectRouter = new OpenAPIHono<Context>();
const fileRequestSchema = z.object({
  file: z
    .custom<File>((v) => v instanceof File)
    .openapi({
      type: 'string',
      format: 'binary',
    }),
});

projectRouter.openapi(
  createRoute({
    method: 'post',
    path: '/{projectID}/files',
    tags: ['projects'],
    summary: 'Upload a file to a project',
    middleware: [authMiddleWare('admin')],
    request: {
      body: {
        content: {
          'multipart/form-data': {
            schema: fileRequestSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successful Upload',
      },
      ...forbiddenRequest,
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const formDataBody = await c.req.parseBody();
    const file: File = <File>formDataBody['file'];
    const projectId: string = <string>c.req.param('projectID');
    const res = await uploadFile(file, `projects/${projectId}/${file.name}`);
    if (res) {
      return c.json({ status: 'successful' });
    } else {
      c.status(400);
      return c.json({ status: 'error occured uploading file' });
    }
  },
);

projectRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{projectID}/files/{fileKey}',
    tags: ['projects'],
    summary: 'Delete a file from a project',
    middleware: [authMiddleWare('admin')],
    request: {
      params: projectIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successful response',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const fileKey: string = c.req.param('fileKey');
    const res = await deleteFile(fileKey);
    if (res) {
      return c.json({ status: 'successful' });
    } else {
      c.status(400);
      return c.json({ status: 'error occured deleting file' });
    }
  },
);

projectRouter.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['projects'],
    summary: 'List all projects',
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
    path: '/{projectID}',
    tags: ['projects'],
    summary: 'Get a project by ID',
    request: {
      params: projectIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              project: projectSchema,
            }),
          },
        },
        description: 'Successful response',
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Project not found',
      },
    },
  }),
  async (c) => {
    const { projectID } = c.req.valid('param');
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, parseInt(projectID)));

    if (!project.length) {
      return c.json({ error: 'Project not found' }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json(
      { project: project[0] },
      HttpStatusCodes.OK,
    );
  },
);

projectRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{projectID}/interested',
    tags: ['projects'],
    summary: 'List all interested users for a project',
    middleware: [authMiddleWare('admin')],
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

    const formattedInterestedUsers = interestedUsers.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }));

    return c.json(
      { interestedUsers: formattedInterestedUsers },
      HttpStatusCodes.OK,
    );
  },
);

projectRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{projectID}/files',
    tags: ['projects'],
    summary: 'List all files for a project',
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
    const projectFiles: FileSchema[] = await db
      .select(getTableColumns(files))
      .from(projectsFiles)
      .innerJoin(files, eq(files.key, projectsFiles.fileKey))
      .where(eq(projectsFiles.projectId, parseInt(projectID)));

    const mappedProjectFiles = projectFiles.map(file => ({
      ...file,
      url: generateObjectUrl(file.key),
    }));

    return c.json({ projectFiles: mappedProjectFiles }, HttpStatusCodes.OK);
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
            schema: newProjectSchema,
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
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Failed to create project',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const body = c.req.valid('json');
    const newProject = await db
      .insert(projects)
      .values(body)
      .returning();
    if (newProject.length === 0) {
      return c.json({ error: 'Failed to create project' }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
    return c.json({ project: newProject[0] }, HttpStatusCodes.CREATED);
  },
);

export default projectRouter;
