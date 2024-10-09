import { Hono } from 'hono';
import { db } from '../../db/db';
import { users, projects } from '../../db/schema';
import type { User, Project } from '../../db/schema';

const v1App = new Hono();

// Users
v1App.get('/users', async c => {
	const foundUsers: User[] = await db.select().from(users);
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
