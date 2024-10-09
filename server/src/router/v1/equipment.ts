import { Hono } from 'hono';

const equipment = new Hono();

equipment.get('/', c => c.json({}));

equipment.get('/:equipmentTypeID/equipment-items', c => {
    const equipmentTypeID = c.req.param('equipmentTypeID');
    return c.json({ equipmentTypeID });
});

equipment.get('/equipmentitem/:equipmentItemID/rental-history', c => {
    const equipmentItemID = c.req.param('equipmentItemID');
    return c.json({ equipmentItemID });
});

export default equipment;