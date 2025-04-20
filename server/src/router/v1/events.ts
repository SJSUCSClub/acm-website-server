import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import * as HttpStatusCodes from "stoker/http-status-codes";
import {
  companyIDSchema,
  errorSchema,
  newEventSchema,
  urlSchema,
} from "@/util/zod";

import type { Context } from "@/lib/context";
import { db } from "@/db/db";
import {
  users,
  eventCompanies,
  companies,
  subscribedEvents,
  eventsFiles,
  files,
  events,
  urls,
  attendingEvents,
} from "@/db/schema";
import {
  eq,
  count,
  getTableColumns,
  and,
  lt,
  gt,
  arrayContains,
  inArray,
  ilike,
  sql,
} from "drizzle-orm";
import type { User, Company, File, Event, Url } from "@/db/schema";
import {
  authMiddleWare,
  forbiddenRequest,
  unauthorizedRequest,
} from "@/middlewares/auth-middleware";
import {
  companySchema,
  eventIDSchema,
  userSchema,
  fileSchema,
  eventSchema,
  csFieldsEnumSchema,
  timestampEnumSchema,
  eventTypesEnumSchema,
  targetAudienceEnumSchema,
} from "@/util/zod";
import {
  deleteFile,
  generateObjectUrl,
  getPresignedUrlPutObj,
} from "@/lib/aws/s3";

const eventRouter = new OpenAPIHono<Context>();

const generateImageKey = (id: string | number): string => `events/${id}/image`;
const generateFileKey = (id: string | number, filename: string): string =>
  `events/${id}/files/${filename}`;

eventRouter.openapi(
  createRoute({
    method: "get",
    path: "/{eventID}/companies",
    tags: ["events"],
    summary: "List all companies for an event",
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              eventCompanies: z.array(companySchema),
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid("param");
    const foundEventCompanies: Company[] = await db
      .select(getTableColumns(companies))
      .from(eventCompanies)
      .innerJoin(companies, eq(companies.id, eventCompanies.companyId))
      .where(eq(eventCompanies.eventId, parseInt(eventID)));

    const mappedCompanies = foundEventCompanies.map((company) => ({
      ...company,
      logo: generateObjectUrl(company.logo),
    }));

    return c.json({ eventCompanies: mappedCompanies }, HttpStatusCodes.OK);
  },
);

eventRouter.openapi(
  createRoute({
    method: "post",
    path: "/{eventID}/companies/{companyID}",
    tags: ["events"],
    summary: "Add a company to an event",
    middleware: [authMiddleWare("admin")],
    request: {
      params: z.object({
        eventID: eventIDSchema.shape.eventID,
        companyID: companyIDSchema.shape.companyID,
      }),
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: "Successful response",
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
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { eventID, companyID } = c.req.valid("param");

    try {
      await db
        .insert(eventCompanies)
        .values({ eventId: parseInt(eventID), companyId: parseInt(companyID) });
      return c.text("", HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

eventRouter.openapi(
  createRoute({
    method: "delete",
    path: "/{eventID}/companies/{companyID}",
    tags: ["events"],
    summary: "Delete a company from an event",
    middleware: [authMiddleWare("admin")],
    request: {
      params: z.object({
        eventID: eventIDSchema.shape.eventID,
        companyID: companyIDSchema.shape.companyID,
      }),
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: "Successful response",
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
        description: "Internal server error",
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { eventID, companyID } = c.req.valid("param");

    try {
      await db
        .delete(eventCompanies)
        .where(
          and(
            eq(eventCompanies.eventId, parseInt(eventID)),
            eq(eventCompanies.companyId, parseInt(companyID)),
          ),
        );
      return c.text("", HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

eventRouter.openapi(
  createRoute({
    method: "get",
    path: "/{eventID}/subscribers",
    tags: ["events"],
    summary: "List all subscribers for an event",
    middleware: [authMiddleWare("admin")],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              eventSubscribers: z.array(userSchema),
            }),
          },
        },
        description: "Successful response",
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
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid("param");

    try {
      const eventSubscribers = await db
        .select(getTableColumns(users))
        .from(subscribedEvents)
        .innerJoin(users, eq(users.id, subscribedEvents.userId))
        .where(eq(subscribedEvents.eventId, parseInt(eventID)));
      return c.json(
        { eventSubscribers },
        HttpStatusCodes.OK,
      );
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

eventRouter.openapi(
  createRoute({
    method: "get",
    path: "/{eventID}/subscribers/count",
    tags: ["events"],
    summary: "Get the number of subscribers for an event",
    middleware: [authMiddleWare("admin")],
    request: {
      params: eventIDSchema,
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
    const { eventID } = c.req.valid("param");
    const subscribersCount = await db
      .select({ count: count() })
      .from(subscribedEvents)
      .where(eq(subscribedEvents.eventId, parseInt(eventID)));
    return c.json(
      { subscribersCount: subscribersCount[0].count },
      HttpStatusCodes.OK,
    );
  },
);

eventRouter.openapi(
  createRoute({
    method: "get",
    path: "/{eventID}/files",
    tags: ["events"],
    summary: "List all files for an event",
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              eventFiles: z.array(fileSchema),
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid("param");
    const eventFiles: File[] = await db
      .select(getTableColumns(files))
      .from(eventsFiles)
      .innerJoin(files, eq(files.key, eventsFiles.fileKey))
      .where(eq(eventsFiles.eventId, parseInt(eventID)));

    const mappedFiles = eventFiles.map((file) => ({
      ...file,
      url: generateObjectUrl(file.key),
    }));

    return c.json({ eventFiles: mappedFiles }, HttpStatusCodes.OK);
  },
);

eventRouter.openapi(
  createRoute({
    method: "post",
    path: "/{eventID}/files/{filename}",
    tags: ["events"],
    summary: "Upload a file to an event",
    middleware: [authMiddleWare("admin")],
    request: {
      params: z.object({
        eventID: eventIDSchema.shape.eventID,
        filename: z.string(),
      }),
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              presigned_url: z.string(),
            }),
          },
        },
        description: "Successful response",
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
        description: "Internal server error",
      },
      ...forbiddenRequest,
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const { eventID, filename } = c.req.valid("param");
    const key = generateFileKey(eventID, filename);

    try {
      await db.insert(files).values({ key, name: filename });
      await db
        .insert(eventsFiles)
        .values({ eventId: parseInt(eventID), fileKey: key });

      const res = await getPresignedUrlPutObj(key);
      if (!res) {
        throw new Error("Failed to generate presigned url");
      }
      return c.json({ presigned_url: res }, HttpStatusCodes.OK);
    } catch (error) {
      console.log(error);
      return c.json(
        { error: `Failed to upload file: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

eventRouter.openapi(
  createRoute({
    method: "delete",
    path: "/{eventID}/files/{filename}",
    tags: ["events"],
    summary: "Delete  file of an event",
    middleware: [authMiddleWare("admin")],
    request: {
      params: z.object({
        eventID: eventIDSchema.shape.eventID,
        filename: z.string(),
      }),
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: "Successful response",
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
        description: "Internal server error",
      },
      ...forbiddenRequest,
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const { eventID, filename } = c.req.valid("param");
    const key = generateFileKey(eventID, filename);

    try {
      await db
        .delete(eventsFiles)
        .where(
          and(
            eq(eventsFiles.fileKey, key),
            eq(eventsFiles.eventId, parseInt(eventID)),
          ),
        );
      await db.delete(files).where(eq(files.key, key));
      const res = await deleteFile(key);
      if (!res) {
        throw new Error("Failed to delete file");
      }
      return c.text("", HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      console.log(error);
      return c.json(
        { error: `Failed to upload file: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

eventRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["events"],
    summary: "List all events",
    request: {
      query: z.object({
        name: z.string().optional(),
        tags: z.string().optional(),
        eventTypes: z.string().optional(),
        targetAudience: z.string().optional(),
        timeframe: timestampEnumSchema.optional(),
        memberOnly: z.union([z.literal("true"), z.literal("false")]).optional(),
      }),
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              foundEvents: z.array(eventSchema),
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const {
      name = "",
      tags = "",
      timeframe = "all",
      eventTypes = "",
      targetAudience = "",
      memberOnly,
    } = c.req.valid("query");

    const conditions = [];

    if (timeframe !== "all") {
      const today = new Date().toISOString().split("T")[0];

      conditions.push(
        timeframe === "upcoming"
          ? gt(events.startDate, today)
          : timeframe === "past"
            ? lt(events.startDate, today)
            : eq(events.startDate, today),
      );
    }

    const validTags = tags
      .split(",")
      .filter((tag) =>
        csFieldsEnumSchema._def.values.includes(
          tag as z.infer<typeof csFieldsEnumSchema>,
        ),
      )
      .map((tag) => tag as z.infer<typeof csFieldsEnumSchema>);

    if (tags?.length > 0) {
      conditions.push(arrayContains(events.tags, validTags));
    }

    const validEventTypes = eventTypes
      .split(",")
      .filter((eventType) =>
        eventTypesEnumSchema._def.values.includes(
          eventType as z.infer<typeof eventTypesEnumSchema>,
        ),
      )
      .map((eventType) => eventType as z.infer<typeof eventTypesEnumSchema>);

    if (validEventTypes?.length > 0) {
      conditions.push(inArray(events.eventType, validEventTypes));
    }

    if (
      targetAudience &&
      targetAudienceEnumSchema._def.values.includes(
        targetAudience as z.infer<typeof targetAudienceEnumSchema>,
      )
    ) {
      conditions.push(
        eq(
          events.targetAudience,
          targetAudience as z.infer<typeof targetAudienceEnumSchema>,
        ),
      );
    }

    if (memberOnly === "true") {
      conditions.push(eq(events.memberOnly, true));
    }

    if (name) {
      conditions.push(ilike(events.name, `%${name}%`));
    }

    const foundEvents: Event[] = await db
      .select()
      .from(events)
      .where(and(...conditions));
    return c.json({ foundEvents }, HttpStatusCodes.OK);
  },
);

eventRouter.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["events"],
    summary: "Create an event",
    middleware: [authMiddleWare("admin")],
    request: {
      body: {
        content: {
          "application/json": {
            schema: newEventSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: {
          "application/json": {
            schema: z.object({
              event: eventSchema,
            }),
          },
        },
        description: "Successful response",
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Failed to create event",
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const body = c.req.valid("json");

    try {
      const newEvent = await db.insert(events).values(body).returning();
      if (newEvent.length === 0) {
        throw new Error("Failed to create event");
      }
      return c.json({ event: newEvent[0] }, HttpStatusCodes.CREATED);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

eventRouter.openapi(
  createRoute({
    method: "get",
    path: "/{eventID}",
    tags: ["events"],
    summary: "List event information",
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              event: eventSchema,
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
        description: "Not Found",
      },
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid("param");
    const foundEvents: Event[] = await db
      .select()
      .from(events)
      .where(eq(events.id, parseInt(eventID)));

    if (foundEvents.length === 0) {
      return c.json({ error: "Event not found" }, HttpStatusCodes.NOT_FOUND);
    }

    const mappedEvent = {
      ...foundEvents[0],
      image: generateObjectUrl(foundEvents[0].image),
    };

    return c.json({ event: mappedEvent }, HttpStatusCodes.OK);
  },
);

eventRouter.openapi(
  createRoute({
    method: "put",
    path: "/{eventID}",
    tags: ["events"],
    summary: "Update event information",
    middleware: [authMiddleWare("admin")],
    request: {
      params: eventIDSchema,
      body: {
        content: {
          "application/json": {
            schema: newEventSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: "Successful response",
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
        description: "Not Found",
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
        description: "Internal server error",
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid("param");
    const body = c.req.valid("json");
    try {
      const updatedEvent = await db
        .update(events)
        .set(body)
        .where(eq(events.id, parseInt(eventID)))
        .returning();

      if (updatedEvent.length === 0) {
        return c.json({ error: "Event not found" }, HttpStatusCodes.NOT_FOUND);
      }

      return c.text("", HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

eventRouter.openapi(
  createRoute({
    method: "delete",
    path: "/{eventID}",
    tags: ["events"],
    summary: "Delete event",
    middleware: [authMiddleWare("admin")],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: "Successful response",
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
        description: "Internal server error",
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid("param");
    try {
      const key = generateImageKey(eventID);
      await db.delete(events).where(eq(events.id, parseInt(eventID)));
      await db.delete(files).where(eq(files.key, key));
      await deleteFile(key);
      return c.text("", HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json({ error }, HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
);

eventRouter.openapi(
  createRoute({
    method: "post",
    path: "/{eventID}/image",
    tags: ["events"],
    summary: "Upload event image",
    middleware: [authMiddleWare("admin")],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: {
          "application/json": {
            schema: z.object({
              presigned_url: z.string(),
            }),
          },
        },
        description: "Successful response",
      },
      [HttpStatusCodes.BAD_REQUEST]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Bad request",
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Not Found",
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid("param");
    if (!eventID) {
      return c.json(
        { error: "Event ID is required" },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    const key = generateImageKey(eventID);
    try {
      await db
        .insert(files)
        .values({ key, name: "image" })
        .onConflictDoNothing();
      await db
        .update(events)
        .set({ image: key })
        .where(eq(events.id, parseInt(eventID)));

      const res = await getPresignedUrlPutObj(key);
      if (!res) {
        throw new Error("Failed to generate presigned url");
      }
      return c.json({ presigned_url: res }, HttpStatusCodes.CREATED);
    } catch (error) {
      return c.json(
        { error: `Failed to upload image: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

eventRouter.openapi(
  createRoute({
    method: "delete",
    path: "/{eventID}/image",
    tags: ["events"],
    summary: "Delete event image",
    middleware: [authMiddleWare("admin")],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: "Successful response",
      },
      [HttpStatusCodes.BAD_REQUEST]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Bad request",
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Not Found",
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid("param");

    if (!eventID) {
      return c.json(
        { error: "Event ID is required" },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    const key = generateImageKey(eventID);
    try {
      await db
        .update(events)
        .set({ image: sql`DEFAULT` })
        .where(eq(events.id, parseInt(eventID)));
      await db.delete(files).where(eq(files.key, key));
      const res = await deleteFile(key);
      if (!res) {
        throw new Error("Failed to delete file");
      }
      return c.text("", HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      console.log(error);
      return c.json(
        { error: `Failed to upload image: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

eventRouter.openapi(
  createRoute({
    method: "get",
    path: "/{eventID}/url",
    tags: ["events"],
    summary: "Fetch event URL",
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              url: urlSchema,
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid("param");
    const url: Url[] = await db
      .select(getTableColumns(urls))
      .from(events)
      .innerJoin(urls, eq(events.shortenedEventUrl, urls.id))
      .where(eq(events.id, parseInt(eventID)));
    return c.json({ url: url[0] }, HttpStatusCodes.OK);
  },
);

eventRouter.openapi(
  createRoute({
    method: "get",
    path: "/{eventID}/attendance",
    tags: ["events"],
    summary: "List all attendees for an event",
    middleware: [authMiddleWare("admin")],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              eventAttendees: z.array(userSchema),
            }),
          },
        },
        description: "Successful response",
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Internal Server Error",
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid("param");
    try {
      const eventAttendees = await db
        .select(getTableColumns(users))
        .from(attendingEvents)
        .innerJoin(users, eq(users.id, attendingEvents.userId))
        .where(eq(attendingEvents.eventId, parseInt(eventID)));
      return c.json(
        { eventAttendees },
        HttpStatusCodes.OK,
      );
    } catch (error) {
      return c.json(
        { error: `Internal server error: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

eventRouter.openapi(
  createRoute({
    method: "get",
    path: "/{eventID}/attendance/count",
    tags: ["events"],
    summary: "Get the number of attendees for an event",
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              attendeesCount: z.number(),
            }),
          },
        },
        description: "Successful response",
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Internal Server Error",
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    try {
      const { eventID } = c.req.valid("param");
      const attendeesCount = await db
        .select({ count: count() })
        .from(attendingEvents)
        .where(eq(attendingEvents.eventId, parseInt(eventID)));
      return c.json(
        { attendeesCount: attendeesCount[0].count },
        HttpStatusCodes.OK,
      );
    } catch (error) {
      return c.json(
        { error: `Internal server error: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

export default eventRouter;
