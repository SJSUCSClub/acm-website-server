import { logger } from 'hono-pino';
import pino from 'pino';
import { PinoPretty } from 'pino-pretty';

import { env } from '@/env';

export function pinoLogger(): ReturnType<typeof logger> {
	return logger({
		pino: pino(
			{
				level: env.NODE_ENV === 'development' ? 'debug' : 'info',
			},
			env.NODE_ENV === 'development' ? PinoPretty() : undefined,
		),
		http: {
			reqId: () => crypto.randomUUID(),
		},
	});
}
