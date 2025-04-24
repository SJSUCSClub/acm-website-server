import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';

import type { Context } from '@/lib/context';
import { db } from '@/db/db';
import {
  clubLinks,
  events,
  files,
  landingQuestions,
  landingSpotlights,
} from '@/db/schema';
import type { ClubLink, LandingQuestion } from '@/db/schema';
import {
  clubLinkSchema,
  errorSchema,
  landingQuestionSchema,
  landingSpotlightSchema,
  newLandingQuestionSchema,
  newSpotlightSchema,
  spotlightSchema,
  updateClubLinkSchema,
} from '@/util/zod';
import { eq, sql } from 'drizzle-orm';
import {
  authMiddleWare,
  forbiddenRequest,
  unauthorizedRequest,
} from '@/middlewares/auth-middleware';
import {
  deleteFile,
  generateObjectUrl,
  getPresignedUrlPutObj,
} from '@/lib/aws/s3';

const clubRouter = new OpenAPIHono<Context>();

const generateSpotlightImageKey = (id: string | number): string =>
  `club/spotlights/${id}/image`;

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
            schema: updateClubLinkSchema,
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

    const newLinks = await db
      .update(clubLinks)
      .set(body)
      .where(eq(clubLinks.id, 1))
      .returning();
    if (newLinks.length === 0) {
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
      .select({
        id: landingSpotlights.id,
        eventId: events.id,
        type: events.eventType,
        image: landingSpotlights.imageKey,
        name: events.name,
        description: landingSpotlights.description,
      })
      .from(landingSpotlights)
      .innerJoin(events, eq(landingSpotlights.eventId, events.id));
    const nspotlights = spotlights.map((spotlight) => ({
      ...spotlight,
      image: generateObjectUrl(spotlight.image),
    }));
    return c.json({ spotlights: nspotlights }, HttpStatusCodes.OK);
  },
);

clubRouter.openapi(
  createRoute({
    method: 'get',
    path: '/spotlights/{spotlightID}',
    tags: ['club'],
    summary: 'Get a spotlight by ID',
    request: {
      params: z.object({
        spotlightID: z.string(),
      }),
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              spotlight: spotlightSchema,
            }),
          },
        },
        description: 'Successful response',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Internal server error',
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Not found',
      },
    },
  }),
  async (c) => {
    const { spotlightID } = c.req.valid('param');
    try {
      const spotlight = await db
        .select({
          id: landingSpotlights.id,
          eventId: events.id,
          type: events.eventType,
          image: landingSpotlights.imageKey,
          name: events.name,
          description: landingSpotlights.description,
        })
        .from(landingSpotlights)
        .innerJoin(events, eq(landingSpotlights.eventId, events.id))
        .where(eq(landingSpotlights.id, parseInt(spotlightID)));

      if (!spotlight.length) {
        return c.json(
          { error: 'Spotlight not found' },
          HttpStatusCodes.NOT_FOUND,
        );
      }

      const mappedSpotlight = {
        ...spotlight[0],
        image: generateObjectUrl(spotlight[0].image),
      };

      return c.json({ spotlight: mappedSpotlight }, HttpStatusCodes.OK);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
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
            schema: newSpotlightSchema,
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
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Internal server error',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const body = c.req.valid('json');

    try {
      const newSpotlight = await db
        .insert(landingSpotlights)
        .values(body)
        .returning();
      if (newSpotlight.length === 0) {
        throw new Error('Failed to create spotlight');
      }
      return c.json({ spotlight: newSpotlight[0] }, HttpStatusCodes.CREATED);
    } catch (error) {
      return c.json(
        { error: `Failed to create spotlight: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
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
            schema: newSpotlightSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'No content',
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
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { spotlightID } = c.req.valid('param');
    const body = c.req.valid('json');

    try {
      const updatedSpotlight = await db
        .update(landingSpotlights)
        .set(body)
        .where(eq(landingSpotlights.id, parseInt(spotlightID)))
        .returning();
      if (updatedSpotlight.length === 0) {
        return c.json(
          { error: 'Spotlight not found' },
          HttpStatusCodes.NOT_FOUND,
        );
      }
      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json(
        { error: `Failed to update spotlight: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

clubRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/spotlights/{spotlightID}',
    tags: ['club'],
    summary: 'Delete club spotlight',
    middleware: [authMiddleWare('admin')],
    request: {
      params: z.object({
        spotlightID: z.string(),
      }),
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'No content',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Internal server error',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { spotlightID } = c.req.valid('param');

    try {
      const key = generateSpotlightImageKey(spotlightID);
      await db
        .delete(landingSpotlights)
        .where(eq(landingSpotlights.id, parseInt(spotlightID)));
      await db.delete(files).where(eq(files.key, key));
      await deleteFile(key);
      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json(
        { error: `Failed to update spotlight: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

clubRouter.openapi(
  createRoute({
    method: 'post',
    path: '/spotlights/{spotlightID}/image',
    tags: ['club'],
    summary: 'Upload club spotlight image',
    middleware: [authMiddleWare('admin')],
    request: {
      params: z.object({
        spotlightID: z.string(),
      }),
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: {
          'application/json': {
            schema: z.object({
              presigned_url: z.string(),
            }),
          },
        },
        description: 'Successful response',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Internal server error',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { spotlightID } = c.req.valid('param');

    try {
      const key = generateSpotlightImageKey(spotlightID);
      await db.insert(files).values({ key, name: 'image' });
      await db
        .update(landingSpotlights)
        .set({ imageKey: key })
        .where(eq(landingSpotlights.id, parseInt(spotlightID)))
        .returning();
      const res = await getPresignedUrlPutObj(key);
      return c.json({ presigned_url: res }, HttpStatusCodes.CREATED);
    } catch (error) {
      return c.json(
        { error: `Failed to update spotlight: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

clubRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/spotlights/{spotlightID}/image',
    tags: ['club'],
    summary: 'Delete club spotlight image',
    middleware: [authMiddleWare('admin')],
    request: {
      params: z.object({
        spotlightID: z.string(),
      }),
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'Successful response',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Internal server error',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { spotlightID } = c.req.valid('param');

    try {
      const key = generateSpotlightImageKey(spotlightID);
      await db
        .update(landingSpotlights)
        .set({ imageKey: sql`DEFAULT` })
        .where(eq(landingSpotlights.id, parseInt(spotlightID)));
      await db.delete(files).where(eq(files.key, key));
      await deleteFile(key);
      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json(
        { error: `Failed to update spotlight: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
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
    path: '/questions',
    tags: ['club'],
    summary: 'Create club question',
    middleware: [authMiddleWare('admin')],
    request: {
      body: {
        content: {
          'application/json': {
            schema: newLandingQuestionSchema,
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
        description: 'Successful response',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Internal server error',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const body = c.req.valid('json');

    try {
      const newQuestion = await db
        .insert(landingQuestions)
        .values(body)
        .returning();
      if (newQuestion.length === 0) {
        throw new Error('Failed to create question');
      }
      return c.json({ question: newQuestion[0] }, HttpStatusCodes.CREATED);
    } catch (error) {
      return c.json(
        { error: `Failed to create question: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
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
            schema: newLandingQuestionSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'No content',
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
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { questionID } = c.req.valid('param');
    const body = c.req.valid('json');

    try {
      const newQuestion = await db
        .update(landingQuestions)
        .set(body)
        .where(eq(landingQuestions.id, parseInt(questionID)))
        .returning();
      if (newQuestion.length === 0) {
        return c.json(
          { error: 'Question not found' },
          HttpStatusCodes.NOT_FOUND,
        );
      }
      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json(
        { error: `Failed to update question: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

clubRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/questions/{questionID}',
    tags: ['club'],
    summary: 'Update club question',
    middleware: [authMiddleWare('admin')],
    request: {
      params: z.object({
        questionID: z.string(),
      }),
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: 'No content',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: errorSchema,
          },
        },
        description: 'Internal server error',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { questionID } = c.req.valid('param');

    try {
      await db
        .delete(landingQuestions)
        .where(eq(landingQuestions.id, parseInt(questionID)));
      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json(
        { error: `Failed to update question: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

export default clubRouter;
