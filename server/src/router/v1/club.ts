import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { Context } from "@/lib/context";
import { db } from "@/db/db";
import { clubLinks } from "@/db/schema";
import type { ClubLink } from "@/db/schema";
import { clubLinkSchema } from "@/util/zod";
import { eq } from "drizzle-orm";
import { authMiddleWare, forbiddenRequest, unauthorizedRequest } from "@/middlewares/auth-middleware";

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
    // middlewares: [authMiddleware("admin")],
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
		const param = c.req.valid('json');
    console.log(param);

		const newMajor = await db
			.update(clubLinks)
			.set(param)
			.where(eq(clubLinks.id, 1))
			.returning();
		if (newMajor.length === 0) {
			return c.json({ error: 'Club link not updated' }, HttpStatusCodes.CONFLICT);
		}
		return c.text('', HttpStatusCodes.NO_CONTENT);
  },
);

export default clubRouter;
