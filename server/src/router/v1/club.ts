import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import { clubLinks, events, landingQuestions, landingSpotlights } from '@/db/schema';
import type { ClubLink, LandingQuestion } from '@/db/schema';
import {
  clubLinkSchema,
  landingQuestionSchema,
  landingSpotlightSchema,
  spotlightSchema,
} from '@/util/zod';
import { eq } from 'drizzle-orm';
import {
  authMiddleWare,
  forbiddenRequest,
  unauthorizedRequest,
} from '@/middlewares/auth-middleware';
import { env } from '@/env';

const clubRouter = new OpenAPIHono<Context>();

clubRouter.openapi(
  createRoute({
    method: 'get',
    path: '/links',
    tags: ['club'],
    summary: 'List all club links',
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              links: clubLinkSchema,
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const links: ClubLink[] = await db.select().from(clubLinks);
    return c.json({ links: links[0] }, HttpStatusCodes.OK);
  },
);

clubRouter.openapi(
  createRoute({
    method: 'put',
    path: '/links',
    tags: ['club'],
    summary: 'Update club link',
    middleware: [authMiddleWare('admin')],
    request: {
      body: {
        content: {
          'application/json': {
            schema: clubLinkSchema.omit({ id: true }),
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'No content',
      },
      [HttpStatusCodes.CONFLICT]: {
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: 'Conflict',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const body = c.req.valid('json');

    const newMajor = await db
      .update(clubLinks)
      .set(body)
      .where(eq(clubLinks.id, 1))
      .returning();
    if (newMajor.length === 0) {
      return c.json(
        { error: 'Club link not updated' },
        HttpStatusCodes.CONFLICT,
      );
    }
    return c.text('', HttpStatusCodes.NO_CONTENT);
  },
);

clubRouter.openapi(
  createRoute({
    method: 'get',
    path: '/spotlights',
    tags: ['club'],
    summary: 'List all spotlights',
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              spotlights: z.array(spotlightSchema),
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const spotlights = await db
      .select({id: landingSpotlights.id, type: events.eventType, image: landingSpotlights.imageKey, name: events.name, description: events.description})
      .from(landingSpotlights)
      .innerJoin(events, eq(landingSpotlights.eventId, events.id));
    const nspotlights = spotlights.map((spotlight) => ({...spotlight, image: env.S3_BUCKET_URL + spotlight.image}));
    return c.json({spotlights: nspotlights}, HttpStatusCodes.OK);
  },
);

clubRouter.openapi(
  createRoute({
    method: 'post',
    path: '/spotlights',
    tags: ['club'],
    summary: 'Create club spotlight',
    middleware: [authMiddleWare('admin')],
    request: {
      body: {
        content: {
          'application/json': {
            schema: landingSpotlightSchema.omit({ id: true }),
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: {
          'application/json': {
            schema: z.object({
              spotlight: landingSpotlightSchema,
            }),
          },
        },
        description: 'Create spotlight',
      },
      [HttpStatusCodes.CONFLICT]: {
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: 'Conflict',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const body = c.req.valid('json');

    const newSpotlight = await db
      .insert(landingSpotlights)
      .values(body)
      .returning();
    if (newSpotlight.length === 0) {
      return c.json(
        { error: 'Spotlight not created' },
        HttpStatusCodes.CONFLICT,
      );
    }
    return c.json({ spotlight: newSpotlight[0] }, HttpStatusCodes.CREATED);
  },
);

clubRouter.openapi(
  createRoute({
    method: 'put',
    path: '/spotlights/{spotlightID}',
    tags: ['club'],
    summary: 'Update club spotlight',
    middleware: [authMiddleWare('admin')],
    request: {
      params: z.object({
        spotlightID: z.string(),
      }),
      body: {
        content: {
          'application/json': {
            schema: landingSpotlightSchema.omit({ id: true }),
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'No content',
      },
      [HttpStatusCodes.CONFLICT]: {
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: 'Conflict',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { spotlightID } = c.req.valid('param');
    const body = c.req.valid('json');

    const newSpotlight = await db
      .update(landingSpotlights)
      .set(body)
      .where(eq(landingSpotlights.id, parseInt(spotlightID)))
      .returning();
    if (newSpotlight.length === 0) {
      return c.json(
        { error: 'Spotlight not updated' },
        HttpStatusCodes.CONFLICT,
      );
    }
    return c.text('', HttpStatusCodes.NO_CONTENT);
  },
);

clubRouter.openapi(
  createRoute({
    method: 'get',
    path: '/questions',
    tags: ['club'],
    summary: 'List all questions',
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              questions: z.array(landingQuestionSchema),
            }),
          },
        },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const questions: LandingQuestion[] = await db
      .select()
      .from(landingQuestions);
    return c.json({ questions }, HttpStatusCodes.OK);
  },
);

clubRouter.openapi(
  createRoute({
    method: 'post',
    path: '/questions',
    tags: ['club'],
    summary: 'Create club question',
    middleware: [authMiddleWare('admin')],
    request: {
      body: {
        content: {
          'application/json': {
            schema: landingQuestionSchema.omit({ id: true }),
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: {
          'application/json': {
            schema: z.object({
              question: landingQuestionSchema,
            }),
          },
        },
        description: 'Create question',
      },
      [HttpStatusCodes.CONFLICT]: {
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: 'Conflict',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const body = c.req.valid('json');

    const newQuestion = await db
      .insert(landingQuestions)
      .values(body)
      .returning();
    if (newQuestion.length === 0) {
      return c.json(
        { error: 'Question not created' },
        HttpStatusCodes.CONFLICT,
      );
    }
    return c.json({ question: newQuestion[0] }, HttpStatusCodes.CREATED);
  },
);

clubRouter.openapi(
  createRoute({
    method: 'put',
    path: '/questions/{questionID}',
    tags: ['club'],
    summary: 'Update club question',
    middleware: [authMiddleWare('admin')],
    request: {
      params: z.object({
        questionID: z.string(),
      }),
      body: {
        content: {
          'application/json': {
            schema: landingQuestionSchema.omit({ id: true }),
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'No content',
      },
      [HttpStatusCodes.CONFLICT]: {
        content: {
          'application/json': {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: 'Conflict',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { questionID } = c.req.valid('param');
    const body = c.req.valid('json');

    const newQuestion = await db
      .update(landingQuestions)
      .set(body)
      .where(eq(landingQuestions.id, parseInt(questionID)))
      .returning();
    if (newQuestion.length === 0) {
      return c.json(
        { error: 'Question not updated' },
        HttpStatusCodes.CONFLICT,
      );
    }
    return c.text('', HttpStatusCodes.NO_CONTENT);
  },
);

export default clubRouter;
