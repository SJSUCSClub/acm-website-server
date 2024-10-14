import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '@/db/db';
import { sessions, users } from '@/db/schema';
import { Google } from 'arctic';
import { setCookie } from 'hono/cookie';
const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);
import { env } from '@/env';

export interface DatabaseUserAttributes {
	id: string;
	createdAt: Date;
	name: string;
	email: string;
	major: string;
	gradDate: Date;
	interests: ('web development' | 'machine learning' | 'cloud computing' | 'artificial intelligence')[];
	profilePic: string | null;
}

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: env.NODE_ENV === 'production',
		},
	},
	getUserAttributes: (attributes: DatabaseUserAttributes): DatabaseUserAttributes => ({
		id: attributes.id,
		createdAt: attributes.createdAt,
		name: attributes.name,
		email: attributes.email,
		major: attributes.major,
		gradDate: attributes.gradDate,
		interests: attributes.interests,
		profilePic: attributes.profilePic,
	}),
});

export const googleAuth = new Google(
	env.GOOGLE_CLIENT_ID,
	env.GOOGLE_CLIENT_SECRET,
	env.GOOGLE_REDIRECT_URI,
);

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

import { Context, setUser, setSession } from '@/lib/context';

export async function authMiddleware(c: Context, next: () => Promise<void>): Promise<void> {
  const sessionId = c.req.cookie('session');
  if (!sessionId) {
    setUser(c, null);
    setSession(c, null);
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);
  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    setCookie(c, sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }
  if (!session) {
    const sessionCookie = lucia.createBlankSessionCookie();
    setCookie(c, sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }
  setUser(c, user);
  setSession(c, session);
  await next();
}
