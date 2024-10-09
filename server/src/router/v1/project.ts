import { Hono } from 'hono';

const project = new Hono();

project.get('/:projectID/interested', c => {
    const projectID = c.req.param('projectID');
    return c.json({ projectID });
});

project.get('/:projectID/files', c => {
    const projectID = c.req.param('projectID');
    return c.json({ projectID });
});

export default project;