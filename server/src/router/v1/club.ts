import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { Context } from "@/lib/context";
import { db } from "@/db/db";
import { clubLinks, landingSpotlights } from "@/db/schema";
import type { ClubLink, LandingSpotlight } from "@/db/schema";
import { clubLinkSchema, landingSpotlightSchema } from "@/util/zod";
import { eq } from "drizzle-orm";
import {
  authMiddleWare,
  forbiddenRequest,
  unauthorizedRequest,
} from "@/middlewares/auth-middleware";

const clubRouter = new OpenAPIHono<Context>();

clubRouter.openapi(
  createRoute({
    method: "get",
    path: "/links",
    tags: ["club"],
    summary: "List all club links",
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              links: clubLinkSchema,
            }),
          },
        },
        description: "Successful response",
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
    method: "put",
    path: "/links",
    tags: ["club"],
    summary: "Update club link",
    middleware: [authMiddleWare("admin")],
    request: {
      body: {
        content: {
          "application/json": {
            schema: clubLinkSchema.omit({ id: true }),
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: "No content",
      },
      [HttpStatusCodes.CONFLICT]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Conflict",
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const param = c.req.valid("json");

    const newMajor = await db
      .update(clubLinks)
      .set(param)
      .where(eq(clubLinks.id, 1))
      .returning();
    if (newMajor.length === 0) {
      return c.json(
        { error: "Club link not updated" },
        HttpStatusCodes.CONFLICT,
      );
    }
    return c.text("", HttpStatusCodes.NO_CONTENT);
  },
);

clubRouter.openapi(
  createRoute({
    method: "get",
    path: "/spotlights",
    tags: ["club"],
    summary: "List all spotlights",
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              spotlights: z.array(landingSpotlightSchema),
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const spotlights: LandingSpotlight[] = await db
      .select()
      .from(landingSpotlights);
    return c.json({ spotlights }, HttpStatusCodes.OK);
  },
);

clubRouter.openapi(
  createRoute({
    method: "post",
    path: "/spotlights",
    tags: ["club"],
    summary: "Update club spotlight",
    middleware: [authMiddleWare("admin")],
    request: {
      body: {
        content: {
          "application/json": {
            schema: landingSpotlightSchema.omit({ id: true }),
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: {
          "application/json": {
            schema: z.object({
              spotlight: landingSpotlightSchema,
            }),
          },
        },
        description: "Create spotlight",
      },
      [HttpStatusCodes.CONFLICT]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Conflict",
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const param = c.req.valid("json");

    const newSpotlight = await db.insert(landingSpotlights).values(param).returning();
    if (newSpotlight.length === 0) {
      return c.json(
        { error: "Spotlight not created" },
        HttpStatusCodes.CONFLICT,
      );
    }
    return c.json({ spotlight: newSpotlight[0] }, HttpStatusCodes.CREATED);
  },
);

clubRouter.openapi(
  createRoute({
    method: "put",
    path: "/spotlights/{spotlightID}",
    tags: ["club"],
    summary: "Update club spotlight",
    middleware: [authMiddleWare("admin")],
    request: {
      params: z.object({
        spotlightID: z.string(),
      }),
      body: {
        content: {
          "application/json": {
            schema: landingSpotlightSchema.omit({ id: true }),
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: "No content",
      },
      [HttpStatusCodes.CONFLICT]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Conflict",
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { spotlightID } = c.req.valid("param");
    const param = c.req.valid("json");

    const newSpotlight = await db
      .update(landingSpotlights)
      .set(param)
      .where(eq(landingSpotlights.id, parseInt(spotlightID)))
      .returning();
    if (newSpotlight.length === 0) {
      return c.json(
        { error: "Spotlight not updated" },
        HttpStatusCodes.CONFLICT,
      );
    }
    return c.text("", HttpStatusCodes.NO_CONTENT);
  },
);

export default clubRouter;
