import { Hono } from 'hono';

const events = new Hono();

events.get('/', c => c.json({}));

events.get('/:eventID/companies', c => {
    const eventID = c.req.param('eventID');
    return c.json({ eventID });
});

events.get('/:eventID/subscribers', c => {
    const eventID = c.req.param('eventID');
    return c.json({ eventID });
});

events.get('/:eventID/subscribers/count', c => {
    const eventID = c.req.param('eventID');
    return c.json({ eventID });
});

events.get('/:eventID/files', c => {
    const eventID = c.req.param('eventID');
    return c.json({ eventID });
});

export default events;
