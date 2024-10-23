import { Hono } from 'hono';
import { db } from '../../db/db';
import { eq } from 'drizzle-orm';
import { projects as projectsSchema, users, interestedInProjects, projectsFiles, files } from '../../db/schema';
import type { Project, User, ProjectFile } from '../../db/schema';

const projects = new Hono();

projects.get('/', async c => {
	const foundProjects: Project[] = await db.select().from(projectsSchema);
	return c.json({
		projects: foundProjects,
	});
});

projects.get('/:projectID/interested', async c => {
    const projectID = c.req.param('projectID');
    const interestedUsers: User[] = await db
        .select() 
        .from(interestedInProjects)
        .innerJoin(users, eq(users.id, interestedInProjects.userId))
        .where(eq(interestedInProjects.projectId, parseInt(projectID)));
    return c.json({
        interestedUsers: interestedUsers
    });
});

projects.get('/:projectID/files', async c => {
    const projectID = c.req.param('projectID');
    const projectFiles: ProjectFile[] = await db
        .select()
        .from(projectsFiles)
        .innerJoin(files, eq(files.key, projectsFiles.fileKey))
        .where(eq(projectsFiles.projectId, parseInt(projectID)));

    return c.json({
        projectID
    });
});

export default projects;
