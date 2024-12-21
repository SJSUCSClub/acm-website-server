import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { equipmentRentalType, equipmentItem, equipmentRentals } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { EquipmentRentalType, EquipmentItem, EquipmentRental } from '@/db/schema';
import { equipmentRentalTypeSchema, equipmentItemSchema, equipmentRentalSchema } from '@/util/zod';

const equipmentRentalRouter = new OpenAPIHono<Context>();

equipmentRentalRouter.openapi(
	createRoute({
		method: 'get',
		path: '/',
		tags: ['equipment'],
		summary: 'List of all equipment types',
		responses: {
			[HttpStatusCodes.OK]: {
				content: {
					'application/json': {
						schema: z.object({
							equipmentTypes: z.array(equipmentRentalTypeSchema),
						}),
					},
				},
				description: 'Successful response',
			},
		},
	}),
	async (c) => {
		const foundEquipmentTypes: EquipmentRentalType[] = await db.select().from(equipmentRentalType);
		return c.json({ equipmentTypes: foundEquipmentTypes }, HttpStatusCodes.OK);
	},
);

equipmentRentalRouter.openapi(
	createRoute({
		method: 'get',
		path: '/{equipmentTypeID}/equipment-items',
		tags: ['equipment'],
		summary: 'List of all equipment items for a type',
		request: {
			params: z.object({
				equipmentTypeID: z.string(),
			}),
		},
		responses: {
			[HttpStatusCodes.OK]: {
				content: {
					'application/json': {
						schema: z.object({
							equipmentItems: z.array(equipmentItemSchema),
						}),
					},
				},
				description: 'Successful response',
			},
		},
	}),
	async (c) => {
		const { equipmentTypeID } = c.req.valid('param');
		const foundEquipmentItems: EquipmentItem[] = await db
			.select()
			.from(equipmentItem)
			.where(eq(equipmentItem.equipmentType, parseInt(equipmentTypeID)));
		return c.json({ equipmentItems: foundEquipmentItems }, HttpStatusCodes.OK);
	},
);

equipmentRentalRouter.openapi(
	createRoute({
		method: 'get',
		path: '/equipment-item/{equipmentItemID}/rental-history',
		tags: ['equipment'],
		summary: 'Lists rental history for an equipment item',
		request: {
			params: z.object({
				equipmentItemID: z.string(),
			}),
		},
		responses: {
			[HttpStatusCodes.OK]: {
				content: {
					'application/json': {
						schema: z.object({
							rentalHistory: z.array(equipmentRentalSchema),
						}),
					},
				},
				description: 'Successful response',
			},
		},
	}),
	async (c) => {
		const { equipmentItemID } = c.req.valid('param');
		const rentalHistory: EquipmentRental[] = await db
			.select()
			.from(equipmentRentals)
			.where(eq(equipmentRentals.itemId, parseInt(equipmentItemID)));
		return c.json({ rentalHistory }, HttpStatusCodes.OK);
	},
);

export default equipmentRentalRouter;