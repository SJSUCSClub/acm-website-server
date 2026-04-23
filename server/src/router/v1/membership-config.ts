import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { eq } from 'drizzle-orm';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { membershipConfig } from '@/db/schema';
import {
  authMiddleWare,
  forbiddenRequest,
  unauthorizedRequest,
} from '@/middlewares/auth-middleware';
import {
  membershipConfigSchema,
  updateMembershipConfigSchema,
} from '@/util/zod';
import { invalidateMembershipCache } from '@/lib/google-sheets';

const membershipConfigRouter = new OpenAPIHono<Context>();

membershipConfigRouter.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['membership-config'],
    summary: 'Get the current membership sheet configuration',
    middleware: [authMiddleWare('admin')],
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: membershipConfigSchema,
          },
        },
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const rows = await db
      .select()
      .from(membershipConfig)
      .where(eq(membershipConfig.id, 1));
    const row = rows[0] ?? { sheetId: '', emailColumn: 'C' };
    return c.json(
      { sheetId: row.sheetId, emailColumn: row.emailColumn },
      HttpStatusCodes.OK,
    );
  },
);

membershipConfigRouter.openapi(
  createRoute({
    method: 'put',
    path: '/',
    tags: ['membership-config'],
    summary: 'Update the membership sheet configuration',
    middleware: [authMiddleWare('admin')],
    request: {
      body: {
        content: {
          'application/json': {
            schema: updateMembershipConfigSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Successfully updated config',
        content: {
          'application/json': {
            schema: membershipConfigSchema,
          },
        },
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const body = c.req.valid('json');

    const updated = await db
      .update(membershipConfig)
      .set(body)
      .where(eq(membershipConfig.id, 1))
      .returning();

    invalidateMembershipCache();

    const row = updated[0];
    return c.json(
      { sheetId: row.sheetId, emailColumn: row.emailColumn },
      HttpStatusCodes.OK,
    );
  },
);

export default membershipConfigRouter;
