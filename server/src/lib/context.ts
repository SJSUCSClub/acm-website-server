import type { Env } from 'hono';
import { PinoLogger } from 'hono-pino';
import type { User, Session } from 'lucia';

export interface Context extends Env {
	Variables: {
		user: User | null;
		session: Session | null;
		logger: PinoLogger;
	};
}

export function setUser(c: Context, user: User | null): void {
	(c as any).set('user', user);
}

export function setSession(c: Context, session: Session | null): void {
	(c as any).set('session', session);
}

export function getUser(c: Context): User | null {
	return (c as any).get('user');
}

export function getSession(c: Context): Session | null {
	return (c as any).get('session');
}
