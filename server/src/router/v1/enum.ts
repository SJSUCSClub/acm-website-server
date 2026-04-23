import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';

const enumRouter = new OpenAPIHono<Context>();

enumRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{enumType}',
    tags: ['enums'],
    summary: 'Get enum types',
    request: {
      params: z.object({
        enumType: z.string(),
      }),
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: 'Get array of values for enum type',
        content: {
          'application/json': {
            schema: z.object({
              types: z.array(z.string()),
            }),
          },
        },
      },
      [HttpStatusCodes.NOT_FOUND]: {
        description: 'Enum type does not exist',
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    const { enumType } = c.req.valid('param');
    const types = await db.execute(sql.raw(`select getEnumValues('${enumType}') as types`));
    const values = types.rows[0].types as string[];
    if (!values.length) {
      return c.json({ error: 'Enum type not found' }, HttpStatusCodes.NOT_FOUND);
    }
    return c.json({ types: types.rows[0].types }, HttpStatusCodes.OK);
  },
);

export default enumRouter;
