import { Hono } from 'hono';

const officers = new Hono();

officers.get('/', c => c.json({}));

export default officers;