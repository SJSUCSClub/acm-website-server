import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { pinoLogger } from '@/middlewares/pino-logger';
import v1App from '@/router/v1';
import notFound from 'stoker/middlewares/not-found';
import onError from 'stoker/middlewares/on-error';
import { Context } from '@/lib/context';
import { env } from '@/env';

const app = new OpenAPIHono<Context>();

app.use(pinoLogger());

app.notFound(notFound);
if (env.NODE_ENV === 'development') {
	app.onError(onError);
}

app.use('/*', cors());

app.get('/', c =>
	c.json(
		{
			status: 'ok',
		},
		200,
	),
);

// V1 API
app.route('/api/v1', v1App);

export default {
	port: env.PORT || 5001,
	fetch: app.fetch,
};
