import { db } from '@/db/db';
import { users, projects } from '@/db/schema';
import type { User, Project } from '@/db/schema';
import authRouter from '@/router/v1/auth';
import type { Context } from '@/lib/context';
import { OpenAPIHono } from '@hono/zod-openapi';

const v1App = new OpenAPIHono<Context>();

v1App.route('/auth', authRouter);

// Users
v1App.get('/users', async c => {
	const foundUsers: User[] = await db.select().from(users);
	// c.var.logger.info('Found users', { users: foundUsers }); // logger example
	return c.json({
		users: foundUsers,
	});
});

// Projects
v1App.get('/projects', async c => {
	const foundProjects: Project[] = await db.select().from(projects);
	return c.json({
		projects: foundProjects,
	});
});

export default v1App;
