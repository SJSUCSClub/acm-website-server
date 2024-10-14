import { UNAUTHORIZED } from 'stoker/http-status-codes';
import { createMiddleware } from 'hono/factory';
import { Context } from '@/lib/context';
import { z } from 'zod';
import { lucia } from '@/lib/auth';
import { getCookie } from 'hono/cookie';
import type { MiddlewareHandler } from 'hono';

export const authMiddleWare = (role: 'user' | 'admin'): MiddlewareHandler => createMiddleware<Context>(async (c, next) => {
	const sessionId = getCookie(c, lucia.sessionCookieName) ?? null;
	if (!sessionId) {
		c.set('user', null);
		c.set('session', null);
		return c.json({ error: 'Unauthorized' }, UNAUTHORIZED);
	}
	const { session, user } = await lucia.validateSession(sessionId);
	if (!user) {
		return c.json({ error: 'Unauthorized' }, UNAUTHORIZED);
	}
	if (role === 'admin' && user.role !== 'admin') {
		return c.json({ error: 'Unauthorized' }, UNAUTHORIZED);
	}
	if (session && session.fresh) {
		c.header('Set-Cookie', lucia.createSessionCookie(session.id).serialize(), {
			append: true,
		});
	}
	if (!session) {
		c.header('Set-Cookie', lucia.createBlankSessionCookie().serialize(), {
			append: true,
		});
	}
	c.set('user', user);
	c.set('session', session);
	await next();
});

export const unauthorizedRequest = {
	[UNAUTHORIZED]: {
		description: 'Unauthorized',
		content: {
			'application/json': {
				schema: z.object({
					error: z.string(),
				}),
			},
		},
	},
};
