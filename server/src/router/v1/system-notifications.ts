import { db } from '@/db/db';
import { systemNotifications } from '@/db/schema';
import type { Context } from '@/lib/context';
import { systemNotificationSchema } from '@/util/zod';
import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';

const systemNotificationsRouter = new OpenAPIHono<Context>();

systemNotificationsRouter.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['system-notifications'],
    summary: 'List all system notifications',
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              systemNotifications: z.array(systemNotificationSchema),
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const systemNotificationList = await db.select().from(systemNotifications);
    return c.json({ systemNotifications: systemNotificationList }, HttpStatusCodes.OK);
  },
);

export default systemNotificationsRouter;
