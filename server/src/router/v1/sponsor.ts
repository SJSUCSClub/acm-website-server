import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { sponsors } from '@/db/schema';
import { sponsorSchema } from '@/util/zod';
import { generateObjectUrl } from '@/lib/aws/s3';

const sponsorRouter = new OpenAPIHono<Context>();

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

export default sponsorRouter;
