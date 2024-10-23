import { Hono } from 'hono';
import { db } from '../../db/db';
import { eq, count } from 'drizzle-orm';
import { eventCompanies, companies, users, subscribedEvents, eventsFiles, files } from '../../db/schema';
import type { Company, User } from '../../db/schema';

const events = new Hono();

events.get('/', c => c.json({}));

events.get('/:eventID/companies', async c => {
    const eventID = c.req.param('eventID');
    const eventCompany: Company[] = await db
        .select() 
        .from(eventCompanies)
        .innerJoin(companies, eq(companies.id, eventCompanies.companyId))
        .where(eq(eventCompanies.eventId, parseInt(eventID)))
    return c.json({
        eventCompany: eventCompany
    });
});

events.get('/:eventID/subscribers', async c => {
    const eventID = c.req.param('eventID');
    const eventSubscribers: User[] = await db
        .select()
        .from(subscribedEvents)
        .innerJoin(users, eq(users.id, subscribedEvents.userId))
        .where(eq(subscribedEvents.eventID, parseInt(eventID)))
    return c.json({
        eventSubscribers: eventSubscribers
    });
});

events.get('/:eventID/subscribers/count', async c => {
    const eventID = c.req.param('eventID');
    const eventSubscribersCount = await db
        .select({ count: count() })
        .from(subscribedEvents)
        .where(eq(subscribedEvents.eventID, parseInt(eventID)))
    return c.json({
        eventSubscribersCount: eventSubscribersCount[0].count
    });
});

events.get('/:eventID/files', async c => {
    const eventID = c.req.param('eventID');
    const eventFiles = await db
        .select()
        .from(eventsFiles)
        .innerJoin(files, eq(files.key, eventsFiles.fileKey))
        .where(eq(eventsFiles.eventId, parseInt(eventID)))

    return c.json({
        eventFiles: eventFiles
    });
});

export default events;
