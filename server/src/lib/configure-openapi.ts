import { OpenAPIHono } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
import { MiddlewareHandler } from 'hono';
import { Context } from '@/lib/context';

export default function configureOpenAPI(app: OpenAPIHono<Context>): void {
	app.doc('/docs', {
		openapi: '3.1.0',
		info: {
			title: 'ACM Website API',
			version: '1.0.0',
		},
	});

	app.get('/ref',
		apiReference({
			spec: {
				url: '/docs',
			},
			theme: 'kepler',
		}) as unknown as MiddlewareHandler<Context>,
	);
}
