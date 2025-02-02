import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { officers } from '@/db/schema';
import type { Officer} from '@/db/schema';
import { officerSchema } from '@/util/zod';

const officerRouter = new OpenAPIHono<Context>();

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
			.from(officers);
		return c.json({ officers: foundOfficers }, HttpStatusCodes.OK);
	},
);

export default officerRouter;