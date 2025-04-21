import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { files, officers } from '@/db/schema';
import type { Officer } from '@/db/schema';
import {
  errorSchema,
  newOfficerSchema,
  officerIDSchema,
  officerReorderSchema,
  officerSchema,
} from '@/util/zod';
import {
  deleteFile,
  generateObjectUrl,
  getPresignedUrlPutObj,
} from '@/lib/aws/s3';
import {
  authMiddleWare,
  forbiddenRequest,
  unauthorizedRequest,
} from '@/middlewares/auth-middleware';
import { count, eq, sql } from 'drizzle-orm';

const officerRouter = new OpenAPIHono<Context>();

const generatePhotoKey = (id: string | number): string =>
  `officers/${id}/photo`;

type OfficerReorder = z.infer<typeof officerReorderSchema>;
officerRouter.openapi(
  createRoute({
    method: 'put',
    path: '/reorder',
    tags: ['officers'],
    summary: 'Reorder officers',
    middleware: [authMiddleWare('admin')],
    request: {
      body: {
        content: {
          'application/json': {
            schema: officerReorderSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'Successful response',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Failed to create officer',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const body: OfficerReorder = await c.req.json();
    try {
      await db.transaction(async (tx) => {
        for (const officer of body.reorder) {
          await tx
            .update(officers)
            .set({ order_index: officer.order_index })
            .where(eq(officers.id, officer.id));
        }
      });

      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

officerRouter.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['officers'],
    summary: 'List all officers',
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              officers: z.array(officerSchema),
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const foundOfficers: Officer[] = await db
      .select()
      .from(officers)
      .orderBy(officers.order_index);
    const officersWithUrls = foundOfficers.map((officer) => ({
      ...officer,
      photo: generateObjectUrl(officer.photo),
    }));

    return c.json({ officers: officersWithUrls }, HttpStatusCodes.OK);
  },
);

officerRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{officerID}',
    tags: ['officers'],
    summary: 'Get officers by ID',
    request: {
      params: officerIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              officer: officerSchema,
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
        description: 'Officer not found',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Failed to create officer',
      },
    },
  }),
  async (c) => {
    const { officerID } = c.req.valid('param');
    try {
      const officer = await db
        .select()
        .from(officers)
        .where(eq(officers.id, parseInt(officerID)));

      if (!officer.length) {
        return c.json(
          { error: 'Officer not found' },
          HttpStatusCodes.NOT_FOUND,
        );
      }

      const foundofficer = officer[0];
      const mappedOfficer = {
        ...foundofficer,
        photo: generateObjectUrl(foundofficer.photo),
      };
      return c.json({ officer: mappedOfficer }, HttpStatusCodes.OK);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

officerRouter.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['officers'],
    summary: 'Creates a new officer',
    middleware: [authMiddleWare('admin')],
    request: {
      body: {
        content: {
          'application/json': {
            schema: newOfficerSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              officer: officerSchema,
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
        description: 'Failed to create officer',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const body: z.infer<typeof newOfficerSchema> = c.req.valid('json');
    try {
      const officerCount = await db.select({ count: count() }).from(officers);
      if (officerCount.length === 0) {
        throw new Error('Query error');
      }
      const newOfficer = await db
        .insert(officers)
        .values({
          ...body,
          order_index: officerCount[0].count + 1,
        })
        .returning();
      return c.json({ officer: newOfficer[0] }, HttpStatusCodes.OK);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

officerRouter.openapi(
  createRoute({
    method: 'put',
    path: '/{officerID}',
    tags: ['officers'],
    summary: 'Update a officer',
    middleware: [authMiddleWare('admin')],
    request: {
      params: officerIDSchema,
      body: {
        content: {
          'application/json': {
            schema: newOfficerSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'Successful response',
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Not Found',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Failed to create officer',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { officerID } = c.req.valid('param');
    const body = c.req.valid('json');
    try {
      const updatedOfficer = await db
        .update(officers)
        .set(body)
        .where(eq(officers.id, parseInt(officerID)))
        .returning();
      if (updatedOfficer.length === 0) {
        return c.json(
          { error: 'Officer not found' },
          HttpStatusCodes.NOT_FOUND,
        );
      }
      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

officerRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{officerID}',
    tags: ['officers'],
    summary: 'Delete a officer',
    middleware: [authMiddleWare('admin')],
    request: {
      params: officerIDSchema,
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'Successful response',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Failed to create officer',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { officerID } = c.req.valid('param');
    const key = generatePhotoKey(officerID);
    try {
      await db.delete(officers).where(eq(officers.id, parseInt(officerID)));
      await db.delete(files).where(eq(files.key, key));
      await deleteFile(key);
      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

officerRouter.openapi(
  createRoute({
    method: 'post',
    path: '/{officerID}/photo',
    tags: ['officers'],
    summary: 'Upload a photo for an officer',
    middleware: [authMiddleWare('admin')],
    request: {
      params: officerIDSchema,
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: {
          'application/json': {
            schema: z.object({
              presigned_url: z.string(),
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
        description: 'Failed to create officer',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { officerID } = c.req.valid('param');
    const key = generatePhotoKey(officerID);
    try {
      await db
        .insert(files)
        .values({ key, name: 'photo' })
        .onConflictDoNothing();
      await db
        .update(officers)
        .set({ photo: key })
        .where(eq(officers.id, parseInt(officerID)));

      const res = await getPresignedUrlPutObj(key);
      if (!res) {
        throw new Error('Failed to generate presigned url');
      }
      return c.json({ presigned_url: res }, HttpStatusCodes.CREATED);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

officerRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{officerID}/photo',
    tags: ['officers'],
    summary: 'Delete a photo for an officer',
    middleware: [authMiddleWare('admin')],
    request: {
      params: officerIDSchema,
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'Successful response',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Failed to create officer',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { officerID } = c.req.valid('param');
    const key = generatePhotoKey(officerID);
    try {
      await db
        .update(officers)
        .set({ photo: sql`DEFAULT` })
        .where(eq(officers.id, parseInt(officerID)));
      await db.delete(files).where(eq(files.key, key));
      const res = await deleteFile(key);
      if (!res) {
        throw new Error('Failed to delete file');
      }
      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

export default officerRouter;
