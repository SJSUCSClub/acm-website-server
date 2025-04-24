import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { sponsors } from '@/db/schema';
import { newSponsorSchema, sponsorSchema } from '@/util/zod';
import { deleteFile, generateObjectUrl, getPresignedUrlPutObj } from '@/lib/aws/s3';
import {
  authMiddleWare,
  forbiddenRequest,
  unauthorizedRequest,
} from '@/middlewares/auth-middleware';
import { eq } from 'drizzle-orm';

const sponsorRouter = new OpenAPIHono<Context>();

const generateSponsorLogoKey = (id: string | number): string =>
  `sponsors/${id}/logo`;

sponsorRouter.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['sponsors'],
    summary: 'List all sponsors',
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              sponsors: z.array(sponsorSchema),
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const sponsorList = await db.select().from(sponsors);
    const mappedSponsors = sponsorList.map((sponsor) => ({
      ...sponsor,
      logoKey: generateObjectUrl(sponsor.logoKey),
    }));
    return c.json({ sponsors: mappedSponsors }, HttpStatusCodes.OK);
  },
);

sponsorRouter.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['sponsors'],
    summary: 'create sponsor',
    middleware: [authMiddleWare('admin')],
    request: {
      body: {
        content: {
          'application/json': {
            schema: newSponsorSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: {
          'application/json': {
            schema: z.object({
              sponsor: sponsorSchema,
            }),
          },
        },
        description: 'Successful response',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Failed to create sponsor',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const body = c.req.valid('json');

    try {
      const newSponsor = await db.insert(sponsors).values(body).returning();
      if (newSponsor.length === 0) {
        throw new Error('Failed to create sponsor');
      }
      return c.json({ sponsor: newSponsor[0] }, HttpStatusCodes.CREATED);
    } catch (error) {
      return c.json(
        { error: `Failed to create sponsor: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

sponsorRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{sponsorName}',
    tags: ['sponsors'],
    summary: 'delete sponsor',
    middleware: [authMiddleWare('admin')],
    request: {
      params: z.object({
        sponsorName: z.string(),
      }),
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'Successful response',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Failed to create sponsor',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { sponsorName } = c.req.valid('param');
    const sponsorKey = generateSponsorLogoKey(sponsorName);
    try {
      await db.delete(sponsors).where(eq(sponsors.name, sponsorName));
      await deleteFile(sponsorKey);
      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json(
        { error: `Failed to delete sponsor: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

sponsorRouter.openapi(
  createRoute({
    method: 'post',
    path: '/{sponsorName}/logo',
    tags: ['sponsors'],
    summary: 'upload sponsor logo',
    middleware: [authMiddleWare('admin')],
    request: {
      params: z.object({
        sponsorName: z.string(),
      }),
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
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Failed to create sponsor',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { sponsorName } = c.req.valid('param');
    const sponsorKey = generateSponsorLogoKey(sponsorName);
    try {
      await db
        .update(sponsors)
        .set({ logoKey: sponsorKey })
        .where(eq(sponsors.name, sponsorName))
        .returning();
      const res = await getPresignedUrlPutObj(sponsorKey);
      return c.json({ presigned_url: res }, HttpStatusCodes.CREATED);
    } catch (error) {
      return c.json(
        { error: `Failed to delete sponsor: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);
export default sponsorRouter;
