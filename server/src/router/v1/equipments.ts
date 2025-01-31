import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { equipmentRentalType, equipmentItem, equipmentRentals } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { EquipmentRentalType, EquipmentItem, EquipmentRental } from '@/db/schema';
import { equipmentRentalTypeSchema, equipmentItemSchema, equipmentRentalSchema, equipmentTypeIdSchema } from '@/util/zod';
import { authMiddleWare, unauthorizedRequest, forbiddenRequest } from '@/middlewares/auth-middleware';

const equipmentRentalRouter = new OpenAPIHono<Context>();

equipmentRentalRouter.openapi(
	createRoute({
		method: 'get',
		path: '/types',
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
		method: 'post',
		path: '/rentals',
		tags: ['equipment'],
		summary: 'Rent an equipment item',
		middleware: [authMiddleWare('admin')],
		request: {
			body: {
				content: {
					'application/json': {
						schema: equipmentRentalSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatusCodes.OK]: {
				content: {
					'application/json': {
						schema: equipmentRentalSchema,
					},
				},
				description: 'Successful response',
			},
			...unauthorizedRequest,
			...forbiddenRequest,
		},
	}),
	async (c) => {
		const user = c.get('user');
		if (!user) {
			return c.json({ error: 'User not found' }, HttpStatusCodes.UNAUTHORIZED);
		}
		const { itemId, userId, dateBorrowed, returnDate, price, condition } = c.req.valid('json');
		const newRental: EquipmentRental = await db
			.insert(equipmentRentals)
			.values({ itemId, userId, dateBorrowed, returnDate, price, condition })
			.onConflictDoNothing()
			.returning()
			.then((res) => res[0]);
		return c.json(newRental, HttpStatusCodes.OK);
	},
);

equipmentRentalRouter.openapi(
	createRoute({
		method: 'post',
		path: '/type',
		tags: ['equipment'],
		summary: 'Create a new equipment type',
		middleware: [authMiddleWare('admin')],
		request: {
			body: {
				content: {
					'application/json': {
						schema: equipmentRentalTypeSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatusCodes.OK]: {
				content: {
					'application/json': {
						schema: equipmentRentalTypeSchema,
					},
				},
				description: 'Successful response',
			},
			...unauthorizedRequest,
			...forbiddenRequest,
		},
	}),
	async (c) => {
		const { name, price, description, image } = c.req.valid('json');
		const newEquipmentType: EquipmentRentalType = await db
			.insert(equipmentRentalType)
			.values({ name, price, description, image })
			.onConflictDoNothing()
			.returning()
			.then((res) => res[0]);
		return c.json(newEquipmentType, HttpStatusCodes.OK);
	},
);

equipmentRentalRouter.openapi(
	createRoute({
		method: 'delete',
		path: '/type/{equipmentTypeID}',
		tags: ['equipment'],
		summary: 'Delete an equipment type',
		middleware: [authMiddleWare('admin')],
		request: {
			params: z.object({
				equipmentTypeID: z.string(),
			}),
		},
		responses: {
			[HttpStatusCodes.OK]: {
			  description: 'Successfully deleted user',
			  content: {
				'application/json': {
				  schema: z.object({
					success: z.boolean(),
				  }),
				},
			  },
			},
			...unauthorizedRequest,
		},
	}),
	async (c) => {
		const { equipmentTypeID } = c.req.valid('param');

		const deletedEquipmentType = await db
			.delete(equipmentRentalType)
			.where(eq(equipmentRentalType.id, parseInt(equipmentTypeID)))
			.returning();

		return c.json({ success: deletedEquipmentType.length > 0 }, HttpStatusCodes.OK);
	},
);

equipmentRentalRouter.openapi(
	createRoute({
		method: 'put',
		path: '/type/{equipmentTypeId}',
		tags: ['equipment'],
		summary: 'Update an equipment type',
		middleware: [authMiddleWare('admin')],
		request: {
			params: equipmentTypeIdSchema,
			body: {
				content: {
					'application/json': {
						schema: equipmentRentalTypeSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatusCodes.OK]: {
				description: 'Successfully updated equipment type',
				content: {
					'application/json': {
						schema: equipmentRentalTypeSchema,
					},
				},
			},
			...unauthorizedRequest,
		},
	}),
	async (c) => {
		const { equipmentTypeId } = c.req.valid('param');
		const { name, price, description, image } = c.req.valid('json');

		const updatedEquipmentType = await db
			.update(equipmentRentalType)
			.set({ name, price, description, image })
			.where(eq(equipmentRentalType.id, parseInt(equipmentTypeId)))
			.returning();

		return c.json(updatedEquipmentType[0], HttpStatusCodes.OK);
	},
);

equipmentRentalRouter.openapi(
	createRoute({
		method: 'get',
		path: '/type/{equipmentTypeId}/item',
		tags: ['equipment'],
		summary: 'List of all equipment items for a type',
		request: {
			params: equipmentTypeIdSchema,
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
		const { equipmentTypeId } = c.req.valid('param');
		const foundEquipmentItems: EquipmentItem[] = await db
			.select()
			.from(equipmentItem)
			.where(eq(equipmentItem.equipmentType, parseInt(equipmentTypeId)));
		return c.json({ equipmentItems: foundEquipmentItems }, HttpStatusCodes.OK);
	},
);

equipmentRentalRouter.openapi(
	createRoute({
		method: 'get',
		path: '/item/{equipmentItemID}/rental-history',
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

equipmentRentalRouter.openapi(
	createRoute({
		method: 'post',
		path: '/item',
		tags: ['equipment'],
		summary: 'Create a new equipment item',
		middleware: [authMiddleWare('admin')],
		request: {
			body: {
				content: {
					'application/json': {
						schema: equipmentItemSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatusCodes.OK]: {
				content: {
					'application/json': {
						schema: equipmentItemSchema,
					},
				},
				description: 'Successful response',
			},
			...unauthorizedRequest,
			...forbiddenRequest,
		},
	}),
	async (c) => {
		const { equipmentType } = c.req.valid('json');
		const newEquipmentItem: EquipmentItem = await db
			.insert(equipmentItem)
			.values({ equipmentType })
			.returning()
			.then((res) => res[0]);
		return c.json(newEquipmentItem, HttpStatusCodes.OK);
	},
);

equipmentRentalRouter.openapi(
	createRoute({
		method: 'delete',
		path: '/item/{equipmentItemID}',
		tags: ['equipment'],
		summary: 'Delete an equipment item',
		middleware: [authMiddleWare('admin')],
		request: {
			params: z.object({
				equipmentItemID: z.string(),
			}),
		},
		responses: {
			[HttpStatusCodes.OK]: {
				description: 'Successfully deleted equipment item',
				content: {
					'application/json': {
						schema: z.object({
							success: z.boolean(),
						}),
					},
				},
			},
			...unauthorizedRequest,
			...forbiddenRequest,
		},
	}),
	async (c) => {
		const { equipmentItemID } = c.req.valid('param');

		const deletedEquipmentItem = await db
			.delete(equipmentItem)
			.where(eq(equipmentItem.id, parseInt(equipmentItemID)))
			.returning();

		return c.json({ success: deletedEquipmentItem.length > 0 }, HttpStatusCodes.OK);
	},
);

equipmentRentalRouter.openapi(
	createRoute({
		method: 'put',
		path: '/item/{equipmentItemID}',
		tags: ['equipment'],
		summary: 'Update an equipment item',
		middleware: [authMiddleWare('admin')],
		request: {
			params: z.object({
				equipmentItemID: z.string(),
			}),
			body: {
				content: {
					'application/json': {
						schema: equipmentItemSchema,
					},
				},
			},
		},
		responses: {
			[HttpStatusCodes.OK]: {
				description: 'Successfully updated equipment item',
				content: {
					'application/json': {
						schema: equipmentItemSchema,
					},
				},
			},
			...unauthorizedRequest,
			...forbiddenRequest,
		},
	}),
	async (c) => {
		const { equipmentItemID } = c.req.valid('param');
		const { equipmentType } = c.req.valid('json');

		const updatedEquipmentItem = await db
			.update(equipmentItem)
			.set({ equipmentType })
			.where(eq(equipmentItem.id, parseInt(equipmentItemID)))
			.returning();

		return c.json(updatedEquipmentItem[0], HttpStatusCodes.OK);
	},
);

export default equipmentRentalRouter;