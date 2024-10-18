import type { Context as HonoContext } from 'hono';
import { PinoLogger } from 'hono-pino';
import type { User, Session } from 'lucia';

export interface Context extends HonoContext {
	Variables: {
		user: User | null;
		session: Session | null;
		logger: PinoLogger;
	};
}
