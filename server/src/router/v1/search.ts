import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { sql } from "drizzle-orm";
import { z } from "zod";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { Context } from "@/lib/context";
import { db } from "@/db/db";
import { companies, events, projects } from "@/db/schema";

const searchRouter = new OpenAPIHono<Context>();

searchRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["search"],
    summary: "Get fuzzy search results",
    request: {
      query: z.object({
        query: z.string().optional(),
      }),
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: "Get array of values for enum type",
        content: {
          "application/json": {
            schema: z.object({
              results: z.array(
                z.object({
                  name: z.string(),
                  type: z.enum(["event", "project", "company"]),
                  similarity: z.number(),
                }),
              ),
            }),
          },
        },
      },
      [HttpStatusCodes.NOT_FOUND]: {
        description: "Enum type does not exist",
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
    },
  }),
  async (c) => {
    const searchQuery = c.req.query("query");
    console.log("searchQuery", searchQuery);
    if (!searchQuery) {
      return c.json({ results: [] }, HttpStatusCodes.OK);
    }
    const eventRes = await db
      .select({
        name: events.name,
        type: sql<string>`'event'`.as("type"),
        similarity: sql<number>`similarity(name, ${searchQuery})`,
      })
      .from(events)
      .where(sql`${searchQuery} % name`);
    const projectRes = await db
      .select({
        name: projects.name,
        type: sql<string>`'project'`.as("type"),
        similarity: sql<number>`similarity(name, ${searchQuery})`,
      })
      .from(projects)
      .where(sql`${searchQuery} % name`);
    const companyRes = await db
      .select({
        name: companies.name,
        type: sql<string>`'company'`.as("type"),
        similarity: sql<number>`similarity(name, ${searchQuery})`,
      })
      .from(companies)
      .where(sql`${searchQuery} % name`);

    const results = [...eventRes, ...projectRes, ...companyRes].sort(
      (a, b) => b.similarity - a.similarity,
    );
    return c.json(
      { results: results.length > 10 ? results.slice(0, 10) : results },
      HttpStatusCodes.OK,
    );
  },
);

export default searchRouter;
