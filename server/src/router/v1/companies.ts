import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { Context } from "@/lib/context";
import { db } from "@/db/db";
import {
  users,
  events,
  eventCompanies,
  subscribedCompanies,
  companies,
} from "@/db/schema";
import { eq, count, getTableColumns } from "drizzle-orm";
import type { User, Event, Company } from "@/db/schema";
import {
  authMiddleWare,
  unauthorizedRequest,
  forbiddenRequest,
} from "@/middlewares/auth-middleware";
import {
  companySchema,
  companyIDSchema,
  eventSchema,
  userSchema,
} from "@/util/zod";
import { generateObjectUrl } from "@/lib/aws/s3";

const companyRouter = new OpenAPIHono<Context>();

companyRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["companies"],
    summary: "List all companies",
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              companies: z.array(companySchema),
            }),
          },
        },
        description: "Successful response",
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
    method: "get",
    path: "/{companyID}",
    tags: ["companies"],
    summary: "Get a company by ID",
    request: {
      params: companyIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              companies: companySchema,
            }),
          },
        },
        description: "Successful response",
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Company not found",
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Internal server error",
      },
    },
  }),
  async (c) => {
    try {
      const { companyID } = c.req.valid("param");

      const foundCompanies = await db
        .select()
        .from(companies)
        .where(eq(companies.id, parseInt(companyID)));

      if (foundCompanies.length === 0) {
        return c.json(
          { error: "Company not found" },
          HttpStatusCodes.NOT_FOUND,
        );
      }

      const company = foundCompanies[0];
      const mappedCompany = {
        ...company,
        logo: generateObjectUrl(company.logo),
      };

      return c.json({ companies: mappedCompany }, HttpStatusCodes.OK);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

companyRouter.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["companies"],
    summary: "Creates a new company",
    middleware: [authMiddleWare("admin")],
    request: {
      body: {
        content: {
          "application/json": {
            schema: companySchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: {
          "application/json": {
            schema: z.object({
              company: companySchema,
            }),
          },
        },
        description: "Successful response",
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
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
    },
  }),
  async (c) => {
    const { id, name, location, description, industryId, logo } =
      c.req.valid("json");
    const newCompany = await db
      .insert(companies)
      .values({ id, name, location, description, industryId, logo })
      .onConflictDoNothing()
      .returning();
    if (newCompany.length === 0) {
      return c.json(
        { error: "Company already exists" },
        HttpStatusCodes.CONFLICT,
      );
    }
    return c.json({ company: newCompany[0] }, HttpStatusCodes.CREATED);
  },
);

companyRouter.openapi(
  createRoute({
    method: "get",
    path: "/{companyID}/events",
    tags: ["companies"],
    summary: "List all events for a company",
    request: {
      params: companyIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              companyEvents: z.array(eventSchema),
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const { companyID } = c.req.valid("param");
    const companyEvents: Event[] = await db
      .select(getTableColumns(events))
      .from(eventCompanies)
      .innerJoin(events, eq(events.id, eventCompanies.eventId))
      .where(eq(eventCompanies.companyId, parseInt(companyID)));
    const formattedCompanyEvents = companyEvents.map((event) => ({
      ...event,
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
    method: "get",
    path: "/{companyID}/subscribers",
    tags: ["companies"],
    summary: "List all subscribers for a company",
    middleware: [authMiddleWare("admin")],
    request: {
      params: companyIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              companySubscribers: z.array(userSchema),
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const { companyID } = c.req.valid("param");
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
    method: "get",
    path: "/{companyID}/subscribers/count",
    tags: ["companies"],
    summary: "Get the number of subscribers for a company",
    middleware: [authMiddleWare("admin")],
    request: {
      params: companyIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              subscribersCount: z.number(),
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const { companyID } = c.req.valid("param");
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
