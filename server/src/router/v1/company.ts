import { Hono } from 'hono';
import { db } from '../../db/db';
import { eq, count } from 'drizzle-orm';
import { events, eventCompanies, users, subscribedCompanies } from '../../db/schema';
import type { Event, User } from '../../db/schema';

const company = new Hono();

company.get('/:companyID/events', async c => {
    const companyID = c.req.param('companyID'); 
    const companyEvents: Event[] = await db
        .select()
        .from(eventCompanies)
        .innerJoin(events, eq(events.id, eventCompanies.eventId))
        .where(eq(eventCompanies.companyId, parseInt(companyID)));
	return c.json({
		companyEvents: companyEvents,
	});
});

company.get('/:companyID/subscribers', async c => {
    const companyID = c.req.param('companyID');
    const companySubscribers: User[] = await db
        .select()
        .from(subscribedCompanies)
        .innerJoin(users, eq(users.id, subscribedCompanies.userId))
        .where(eq(subscribedCompanies.companyId, parseInt(companyID)));

    return c.json({ companySubscribers: companySubscribers });
});

company.get('/:companyID/subscribers/count', async c => {
    const companyID = c.req.param('companyID');
    const subscribersCount = await db
        .select({ count: count() })
        .from(subscribedCompanies)
        .where(eq(subscribedCompanies.companyId, parseInt(companyID)));
    return c.json({ subscribersCount: subscribersCount[0].count });
});

export default company;
