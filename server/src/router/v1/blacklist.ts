import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { blacklist } from '@/db/schema';
import type { NewBlacklist, Blacklist } from '@/db/schema';
import { newBlacklistSchema, userIdSchema, blacklistSchema } from '@/util/zod';
import { authMiddleWare } from '@/middlewares/auth-middleware';
import { eq } from 'drizzle-orm';

const blacklistRouter = new OpenAPIHono<Context>();

blacklistRouter.openapi(
	createRoute({
		method: 'get',
		path: '/',
		tags: ['blacklist'],
		summary: 'Get all blacklisted users',
		middleware: [authMiddleWare('admin')],
		responses: {
			[HttpStatusCodes.OK]: {
				content: {
					'application/json': {
						schema: z.object({
							blacklist: z.array(blacklistSchema),
						}),
					},
				},
				description: 'List of all blacklisted users',
			},
		},
	}),
	async (c) => {
		const blacklistedUsers: Blacklist[] = await db
			.select()
			.from(blacklist);
		return c.json({ blacklist: blacklistedUsers }, HttpStatusCodes.OK);
	},
);

blacklistRouter.openapi(
	createRoute({
	  method: 'post',
	  path: '/',
	  tags: ['blacklist'],
	  summary: 'Blacklist a user',
	  middleware: [authMiddleWare('admin')],
	  request: {
		body: {
			content: {
				'application/json': {
					schema: newBlacklistSchema,
				},
			},
		},
	  },
	  responses: {
		[HttpStatusCodes.CREATED]: {
			content: {
				'application/json': {
					schema: z.object({
						blacklist: newBlacklistSchema,
					}),
				},
			},
			description: 'User successfully blacklisted',
		},
	  },
	}),
	async (c) => {
		const { userId, reason } = c.req.valid('json');
		const newBlacklist: NewBlacklist[] = await db
			.insert(blacklist)
			.values({ userId, reason })
			.onConflictDoNothing()
			.returning();
		return c.json({ blacklist: newBlacklist[0] }, HttpStatusCodes.CREATED);
	},
);

blacklistRouter.openapi(
	createRoute({
	  method: 'delete',
	  path: '/{userId}',
	  tags: ['blacklist'],
	  summary: 'Remove a user from blacklist',
	  middleware: [authMiddleWare('admin')],
	  request: {
		params: userIdSchema,
	  },
	  responses: {
		[HttpStatusCodes.OK]: {
			content: {
				'application/json': {
					schema: z.object({
						success: z.boolean(),
					}),
				},
			},
			description: 'User removed from blacklist',
		},
	  },
	}),
	async (c) => {
		const { userId } = c.req.valid('param');
		const deletedBlacklist: Blacklist[] = await db
			.delete(blacklist)
			.where(eq(blacklist.userId, userId))
			.returning();
		return c.json({ success: deletedBlacklist.length > 0 }, HttpStatusCodes.OK);
	},
);

export default blacklistRouter;	