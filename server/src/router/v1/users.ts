import { Hono } from 'hono';
import { db } from '../../db/db';
import { users } from '../../db/schema';
import type { User } from '../../db/schema';

const usersRouter = new Hono();

usersRouter.get('/', async c => {
    const foundUsers: User[] = await db.select().from(users);
	return c.json({
		users: foundUsers,
	});
});

usersRouter.get('/rental-history', c => c.json({}));

export default usersRouter;