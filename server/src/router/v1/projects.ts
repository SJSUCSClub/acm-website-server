import { Hono } from 'hono';
import { db } from '../../db/db';
import { projects as projectsSchema } from '../../db/schema';
import type { Project } from '../../db/schema';

const projects = new Hono();

projects.get('/', async c => {
	const foundProjects: Project[] = await db.select().from(projectsSchema);
	return c.json({
		projects: foundProjects,
	});
});

projects.get('/:projectID/interested', c => {
    const projectID = c.req.param('projectID');
    return c.json({ projectID });
});

projects.get('/:projectID/files', c => {
    const projectID = c.req.param('projectID');
    return c.json({ projectID });
});

export default projects;
