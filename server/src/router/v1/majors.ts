import { Hono } from 'hono';

const majors = new Hono();

majors.get('/', c => c.json({}));

majors.get('/:majorName/users', c => {
    const majorName = c.req.param('majorName');
    return c.json({ majorName });
});

export default majors;
