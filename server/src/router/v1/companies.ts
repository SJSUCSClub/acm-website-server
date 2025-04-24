import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import {
  users,
  events,
  eventCompanies,
  subscribedCompanies,
  companies,
  files,
} from '@/db/schema';
import { eq, count, getTableColumns, sql } from 'drizzle-orm';
import type { User, Event, Company } from '@/db/schema';
import {
  authMiddleWare,
  unauthorizedRequest,
  forbiddenRequest,
} from '@/middlewares/auth-middleware';
import {
  companySchema,
  companyIDSchema,
  eventSchema,
  userSchema,
  errorSchema,
  newCompanySchema,
} from '@/util/zod';
import {
  deleteFile,
  generateObjectUrl,
  getPresignedUrlPutObj,
} from '@/lib/aws/s3';

const companyRouter = new OpenAPIHono<Context>();

const generateLogoKey = (id: string | number): string => `companies/${id}/logo`;

companyRouter.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['companies'],
    summary: 'List all companies',
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              companies: z.array(companySchema),
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const foundCompanies: Company[] = await db.select().from(companies);
    const mappedCompanies = foundCompanies.map((company) => ({
      ...company,
      logo: generateObjectUrl(company.logo),
    }));
    return c.json({ companies: mappedCompanies }, HttpStatusCodes.OK);
  },
);

companyRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{companyID}',
    tags: ['companies'],
    summary: 'Get a company by ID',
    request: {
      params: companyIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              company: companySchema,
            }),
          },
        },
        description: 'Successful response',
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: 'Company not found',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: 'Internal server error',
      },
    },
  }),
  async (c) => {
    try {
      const { companyID } = c.req.valid('param');

      const foundCompanies = await db
        .select()
        .from(companies)
        .where(eq(companies.id, parseInt(companyID)));

      if (foundCompanies.length === 0) {
        return c.json(
          { error: 'Company not found' },
          HttpStatusCodes.NOT_FOUND,
        );
      }

      const foundcompany = foundCompanies[0];
      const mappedCompany = {
        ...foundcompany,
        logo: generateObjectUrl(foundcompany.logo),
      };

      return c.json({ company: mappedCompany }, HttpStatusCodes.OK);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

companyRouter.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['companies'],
    summary: 'Creates a new company',
    middleware: [authMiddleWare('admin')],
    request: {
      body: {
        content: {
          'application/json': {
            schema: newCompanySchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: {
          'application/json': {
            schema: z.object({
              company: companySchema,
            }),
          },
        },
        description: 'Successful response',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
      [HttpStatusCodes.CONFLICT]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Conflict',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Internal server error',
      },
    },
  }),
  async (c) => {
    const body = c.req.valid('json');
    try {
      const newCompany = await db
        .insert(companies)
        .values(body)
        .onConflictDoNothing()
        .returning();
      if (newCompany.length === 0) {
        return c.json(
          { error: 'Company already exists' },
          HttpStatusCodes.CONFLICT,
        );
      }
      const company = {
        ...newCompany[0],
        logo: generateObjectUrl(newCompany[0].logo),
      };
      return c.json({ company }, HttpStatusCodes.CREATED);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

companyRouter.openapi(
  createRoute({
    method: 'put',
    path: '/{companyID}',
    tags: ['companies'],
    summary: 'Update company',
    middleware: [authMiddleWare('admin')],
    request: {
      params: companyIDSchema,
      body: {
        content: {
          'application/json': {
            schema: newCompanySchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'Successful response',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
      [HttpStatusCodes.BAD_REQUEST]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Conflict',
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Not found',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Internal server error',
      },
    },
  }),
  async (c) => {
    const companyId = c.req.param('companyID');
    const body = c.req.valid('json');

    if (!companyId) {
      return c.json(
        { error: 'Company ID is required' },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    try {
      const updatedCompany = await db
        .update(companies)
        .set(body)
        .where(eq(companies.id, parseInt(companyId)))
        .returning();
      if (updatedCompany.length === 0) {
        return c.json(
          { error: 'Company not found' },
          HttpStatusCodes.NOT_FOUND,
        );
      }
      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

companyRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{companyID}',
    tags: ['companies'],
    summary: 'Delete company',
    middleware: [authMiddleWare('admin')],
    request: {
      params: companyIDSchema,
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'Successful response',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
      [HttpStatusCodes.BAD_REQUEST]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Conflict',
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Not found',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Internal server error',
      },
    },
  }),
  async (c) => {
    const companyId = c.req.param('companyID');

    if (!companyId) {
      return c.json(
        { error: 'Company ID is required' },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    try {
      const key = generateLogoKey(companyId);
      await db.delete(companies).where(eq(companies.id, parseInt(companyId)));
      await db.delete(files).where(eq(files.key, key));
      await deleteFile(key);
      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

companyRouter.openapi(
  createRoute({
    method: 'post',
    path: '/{companyID}/logo',
    tags: ['companies'],
    summary: 'Create logo',
    middleware: [authMiddleWare('admin')],
    request: {
      params: companyIDSchema,
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: {
          'application/json': {
            schema: z.object({
              presigned_url: z.string().url(),
            }),
          },
        },
        description: 'Successful response',
      },
      [HttpStatusCodes.BAD_REQUEST]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Bad request',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Failed to create logo',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const companyId = c.req.param('companyID');

    if (!companyId) {
      return c.json(
        { error: 'Not valid parameters' },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    const key = generateLogoKey(companyId);
    try {
      await db
        .insert(files)
        .values({ key, name: 'logo' })
        .onConflictDoNothing();
      await db
        .update(companies)
        .set({ logo: key })
        .where(eq(companies.id, parseInt(companyId)));

      const res = await getPresignedUrlPutObj(key);
      return c.json({ presigned_url: res }, HttpStatusCodes.CREATED);
    } catch (error) {
      console.log(error);
      return c.json(
        { error: 'Failed to create logo' },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

companyRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{companyID}/logo',
    tags: ['companies'],
    summary: 'Delete logo',
    middleware: [authMiddleWare('admin')],
    request: {
      params: companyIDSchema,
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'Successful response',
      },
      [HttpStatusCodes.BAD_REQUEST]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Bad request',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Failed to create logo',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const companyId = c.req.param('companyID');

    if (!companyId) {
      return c.json(
        { error: 'Not valid parameters' },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    const key = generateLogoKey(companyId);
    try {
      await db
        .update(companies)
        .set({ logo: sql`DEFAULT` })
        .where(eq(companies.id, parseInt(companyId)));
      await db.delete(files).where(eq(files.key, key));
      await deleteFile(key);
      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      console.log(error);
      return c.json(
        { error: 'Failed to create logo' },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

companyRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{companyID}/events',
    tags: ['companies'],
    summary: 'List all events for a company',
    request: {
      params: companyIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              companyEvents: z.array(eventSchema),
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const { companyID } = c.req.valid('param');
    const companyEvents: Event[] = await db
      .select(getTableColumns(events))
      .from(eventCompanies)
      .innerJoin(events, eq(events.id, eventCompanies.eventId))
      .where(eq(eventCompanies.companyId, parseInt(companyID)));
    const formattedCompanyEvents = companyEvents.map((event) => ({
      ...event,
      image: generateObjectUrl(event.image),
      createdAt: event.createdAt.toISOString(),
    }));
    return c.json(
      { companyEvents: formattedCompanyEvents },
      HttpStatusCodes.OK,
    );
  },
);

companyRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{companyID}/subscribers',
    tags: ['companies'],
    summary: 'List all subscribers for a company',
    middleware: [authMiddleWare('admin')],
    request: {
      params: companyIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              companySubscribers: z.array(userSchema),
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const { companyID } = c.req.valid('param');
    const companySubscribers: User[] = await db
      .select(getTableColumns(users))
      .from(subscribedCompanies)
      .innerJoin(users, eq(users.id, subscribedCompanies.userId))
      .where(eq(subscribedCompanies.companyId, parseInt(companyID)));
    const formattedCompanySubscribers = companySubscribers.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }));
    return c.json(
      { companySubscribers: formattedCompanySubscribers },
      HttpStatusCodes.OK,
    );
  },
);

companyRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{companyID}/subscribers/count',
    tags: ['companies'],
    summary: 'Get the number of subscribers for a company',
    middleware: [authMiddleWare('admin')],
    request: {
      params: companyIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              subscribersCount: z.number(),
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const { companyID } = c.req.valid('param');
    const subscribersCount = await db
      .select({ count: count() })
      .from(subscribedCompanies)
      .where(eq(subscribedCompanies.companyId, parseInt(companyID)));
    return c.json(
      { subscribersCount: subscribersCount[0].count },
      HttpStatusCodes.OK,
    );
  },
);

export default companyRouter;
