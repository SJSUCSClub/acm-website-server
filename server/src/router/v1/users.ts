import { Hono } from 'hono';

const users = new Hono();

users.get('/', c => c.json({}));

users.get('/rental-history', c => c.json({}));

export default users;