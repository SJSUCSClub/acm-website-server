import { Hono } from 'hono';
import { db } from '../../db/db';
import { eq } from 'drizzle-orm';
import { users, majors } from '../../db/schema';
import type { User } from '../../db/schema';

const majors = new Hono();

majors.get('/', c => c.json({}));

majors.get('/:majorName/users', async c => {
    const majorName = c.req.param('majorName');
    const majorUsers: User[] = await db
        .select()
        .from(majors)
        .innerJoin(users, eq(users.major, majors.name))
        .where(eq(majors.name, majorName));
    return c.json({ majorUsers: majorUsers });
});

export default majors;
