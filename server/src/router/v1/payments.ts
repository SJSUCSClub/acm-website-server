import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { paymentLinks } from '@/db/schema';
import {
  paymentIdSchema,
  paymentLinkSchema,
  newPaymentLinkSchema,
  updatePaymentLinkSchema,
} from '@/util/zod';
import {
  authMiddleWare,
  unauthorizedRequest,
  forbiddenRequest,
} from '@/middlewares/auth-middleware';
import { eq } from 'drizzle-orm';

const paymentRouter = new OpenAPIHono<Context>();

paymentRouter.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['payments'],
    summary: 'Get all payment links',
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              paymentLinks: z.array(paymentLinkSchema),
            }),
          },
        },
        description: 'List of all payment links',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Failed to get payment links',
      },
    },
  }),
  async (c) => {
    try {
      const payments = await db.select().from(paymentLinks);
      return c.json({ paymentLinks: payments }, HttpStatusCodes.OK);
    } catch (error) {
      return c.json(
        { error: `Failed to get payment links: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

paymentRouter.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['payments'],
    summary: 'Create payment link',
    middleware: [authMiddleWare('admin')],
    request: {
      body: {
        content: {
          'application/json': {
            schema: newPaymentLinkSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: {
          'application/json': {
            schema: z.object({
              paymentLink: paymentLinkSchema,
            }),
          },
        },
        description: 'User successfully blacklisted',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Failed to create payment link',
      },
    },
    ...unauthorizedRequest,
    ...forbiddenRequest,
  }),
  async (c) => {
    try {
      const { name, link } = c.req.valid('json');
      const newPaymentLink = await db
        .insert(paymentLinks)
        .values({ name, link })
        .onConflictDoNothing()
        .returning();

      if (newPaymentLink.length === 0) {
        return c.json(
          { error: 'Failed to create payment link' },
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }

      return c.json(
        { paymentLink: newPaymentLink[0] },
        HttpStatusCodes.CREATED,
      );
    } catch (error) {
      return c.json(
        { error: `Failed to create payment link: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

paymentRouter.openapi(
  createRoute({
    method: 'put',
    path: '/{paymentId}',
    tags: ['payments'],
    summary: 'Update a payment link',
    middleware: [authMiddleWare('admin')],
    request: {
      params: paymentIdSchema,
      body: {
        content: {
          'application/json': {
            schema: updatePaymentLinkSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'Payment link updated',
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Payment link not found',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Failed to update payment link',
      },
    },
    ...unauthorizedRequest,
    ...forbiddenRequest,
  }),
  async (c) => {
    try {
      const { paymentId } = c.req.valid('param');
      const body = c.req.valid('json');

      const updatedPaymentLink = await db
        .update(paymentLinks)
        .set(body)
        .where(eq(paymentLinks.id, parseInt(paymentId)))
        .returning();

      if (updatedPaymentLink.length === 0) {
        return c.json(
          { error: 'Payment link not found' },
          HttpStatusCodes.NOT_FOUND,
        );
      }

      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json(
        { error: `Failed to update payment link: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

paymentRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{paymentId}',
    tags: ['payments'],
    summary: 'Delete a payment link',
    middleware: [authMiddleWare('admin')],
    request: {
      params: paymentIdSchema,
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'Payment link deleted',
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Payment link not found',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Failed to delete payment link',
      },
    },
    ...unauthorizedRequest,
    ...forbiddenRequest,
  }),
  async (c) => {
    try {
      const { paymentId } = c.req.valid('param');
      const deletedPaymentLink = await db
        .delete(paymentLinks)
        .where(eq(paymentLinks.id, parseInt(paymentId)))
        .returning();

      if (deletedPaymentLink.length === 0) {
        return c.json(
          { error: 'Payment link not found' },
          HttpStatusCodes.NOT_FOUND,
        );
      }
      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json(
        { error: `Failed to delete payment link: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

export default paymentRouter;
