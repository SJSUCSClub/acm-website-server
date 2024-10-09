import { Hono } from 'hono';

const company = new Hono();

company.get('/:companyID/events', c => {
    const companyID = c.req.param('companyID');
    return c.json({ companyID });
});

company.get('/:companyID/subsribers', c => {
    const companyID = c.req.param('companyID');
    return c.json({ companyID });
});

company.get('/:companyID/subscribers/count', c => {
    const companyID = c.req.param('companyID');
    return c.json({ companyID });
});

export default company;