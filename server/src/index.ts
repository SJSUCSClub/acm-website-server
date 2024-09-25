import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

app.use('/*', cors());
app.get('/', c => c.json({
		status: 'ok',
	}));

export default {
	port: process.env.PORT || 5001,
	fetch: app.fetch,
};
