import { Hono } from 'hono';
import { db } from '../../db/db';
import { users } from '../../db/schema';
import type { User } from '../../db/schema';

const users = new Hono();

users.get('/', async c => {
    const foundUsers: User[] = await db.select().from(users);
	return c.json({
		users: foundUsers,
	});
});

users.get('/rental-history', c => c.json({}));

export default users;