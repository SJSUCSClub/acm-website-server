import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import type { MiddlewareHandler } from 'hono';
import { z } from 'zod';
import { FORBIDDEN, UNAUTHORIZED } from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { lucia } from '@/lib/auth';

import { db } from '@/db/db';
import { blacklist } from '@/db/schema';
import type { Blacklist } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const authMiddleWare = (role: 'user' | 'member' | 'admin'): MiddlewareHandler =>
  createMiddleware<Context>(async (c, next) => {
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
    const blacklistedUser: Blacklist | undefined = await db
      .select()
      .from(blacklist)
      .where(eq(blacklist.userId, user.id))
      .then((res) => res[0]);

    if (blacklistedUser) {
      return c.json({ error: 'Blacklisted', message: blacklistedUser.reason }, FORBIDDEN);
    }
    const roleRank = { user: 0, member: 1, admin: 2 } as const;
    if (roleRank[user.role] < roleRank[role]) {
      return c.json({ error: 'Forbidden' }, FORBIDDEN);
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

export const forbiddenRequest = {
  [FORBIDDEN]: {
    description: 'Forbidden',
    content: {
      'application/json': {
        schema: z.object({
          error: z.string(),
        }),
      },
    },
  },
};

export const blacklistedRequest = {
  [FORBIDDEN]: {
    description: 'Blacklisted',
    content: {
      'application/json': {
        schema: z.object({
          error: z.string(),
        }),
      },
    },
  },
};
