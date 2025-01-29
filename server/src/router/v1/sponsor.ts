import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { sponsors } from '@/db/schema';
import type { Sponsor } from '@/db/schema';
import { sponsorSchema } from '@/util/zod';

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
							majors: z.array(sponsorSchema),
						}),
					},
				},
				description: 'Successful response',
			},
		},
	}),
	async (c) => {
		const sponsorList: Sponsor[] = await db.select().from(sponsors);
		return c.json({ sponsors: sponsorList}, HttpStatusCodes.OK);
	},
);

export default sponsorRouter;