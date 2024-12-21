import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { Context } from "@/lib/context";
import { db } from "@/db/db";
import {
  users,
  projects,
  majors,
  events,
  eventCompanies,
  subscribedCompanies,
  companies,
  subscribedEvents,
  eventsFiles,
  files,
  interestedInProjects,
  projectsFiles,
  equipmentRentalType,
  equipmentItem,
  equipmentRentals,
  educationLevelEnum,
  userRoleEnum,
  equipmentConditionEnum,
  bookmarkedEvents,
} from "@/db/schema";
import { eq, count, getTableColumns, and } from "drizzle-orm";
import type {
  User,
  Project,
  Event,
  Company,
  File,
  Major,
  EquipmentRentalType,
  EquipmentItem,
  EquipmentRental,
  SubscribedCompany,
} from "@/db/schema";
import { csFieldsEnum } from "@/db/schema";
import {
  authMiddleWare,
  unauthorizedRequest,
} from "@/middlewares/auth-middleware";

import authRouter from "@/router/v1/auth";

const v1App = new OpenAPIHono<Context>();

v1App.route("/auth", authRouter);

// Users
const userSchema = createSelectSchema(users).extend({
  interests: z.array(z.enum(csFieldsEnum.enumValues)),
});

v1App.openapi(
  createRoute({
    method: "get",
    path: "/users",
    tags: ["users"],
    summary: "Admin List all users",
    middleware: [authMiddleWare("admin")],
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              users: z.array(userSchema),
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const foundUsers: User[] = await db.select().from(users);
    const formattedUsers = foundUsers.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }));
    return c.json({ users: formattedUsers }, HttpStatusCodes.OK);
  }
);

// Projects
const projectSchema = createSelectSchema(projects);
const fileSchema = createSelectSchema(files);
const projectIDSchema = z.object({
  projectID: z.string(),
});

v1App.openapi(
  createRoute({
    method: "get",
    path: "/projects",
    tags: ["projects"],
    summary: "List all projects",
    middleware: [authMiddleWare("user")],
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              projects: z.array(projectSchema),
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const foundProjects: Project[] = await db.select().from(projects);
    return c.json({ projects: foundProjects }, HttpStatusCodes.OK);
  }
);

v1App.openapi(
  createRoute({
    method: "get",
    path: "/projects/{projectID}/interested",
    tags: ["projects"],
    summary: "List all interested users for a project",
    middleware: [authMiddleWare("user")],
    request: {
      params: projectIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              interestedUsers: z.array(userSchema),
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const { projectID } = c.req.valid("param");
    const interestedUsers: User[] = await db
      .select(getTableColumns(users))
      .from(interestedInProjects)
      .innerJoin(users, eq(users.id, interestedInProjects.userId))
      .where(eq(interestedInProjects.projectId, parseInt(projectID)));

    const formattedInterestedUsers = interestedUsers.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }));

    return c.json(
      { interestedUsers: formattedInterestedUsers },
      HttpStatusCodes.OK
    );
  }
);

v1App.openapi(
  createRoute({
    method: "get",
    path: "/projects/{projectID}/files",
    tags: ["projects"],
    summary: "List all files for a project",
    middleware: [authMiddleWare("user")],
    request: {
      params: projectIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              projectFiles: z.array(fileSchema),
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const { projectID } = c.req.valid("param");
    const projectFiles: File[] = await db
      .select(getTableColumns(files))
      .from(projectsFiles)
      .innerJoin(files, eq(files.key, projectsFiles.fileKey))
      .where(eq(projectsFiles.projectId, parseInt(projectID)));

    return c.json({ projectFiles }, HttpStatusCodes.OK);
  }
);

v1App.openapi(
  createRoute({
    method: "post",
    path: "/projects",
    tags: ["projects"],
    summary: "Creates a new project",
    middleware: [authMiddleWare("admin")],
    request: {
      body: {
        content: {
          "application/json": {
            schema: projectSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: {
          "application/json": {
            schema: z.object({
              project: projectSchema,
            }),
          },
        },
        description: "Successful response",
      },
      [HttpStatusCodes.UNAUTHORIZED]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Unauthorized",
      },
      [HttpStatusCodes.FORBIDDEN]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Forbidden",
      },
    },
  }),
  async (c) => {
    const { id, name, description, githubLink } = c.req.valid("json");
    const newProject = await db
      .insert(projects)
      .values({ id, name, description, githubLink })
      // .onConflictDoNothing()
      .returning();
    return c.json({ project: newProject[0] }, HttpStatusCodes.CREATED);
  }
);

// Events
const baseEventSchema = createSelectSchema(events);
const eventSchema = baseEventSchema.extend({
  tags: z.array(z.enum(csFieldsEnum.enumValues)),
  urls: z.array(z.string()),
});

const companySchema = createSelectSchema(companies);
const eventIDSchema = z.object({
  eventID: z.string(),
});

v1App.openapi(
  createRoute({
    method: "get",
    path: "/events/{eventID}/companies",
    tags: ["events"],
    summary: "List all companies for an event",
    middleware: [authMiddleWare("user")],
    request: {
      params: eventIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              foundEventCompanies: z.array(companySchema),
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
    return c.json({ foundEventCompanies }, HttpStatusCodes.OK);
  }
);

v1App.openapi(
  createRoute({
    method: "get",
    path: "/events/{eventID}/subscribers",
    tags: ["events"],
    summary: "List all subscribers for an event",
    middleware: [authMiddleWare("user")],
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
    },
  }),
  async (c) => {
    const { eventID } = c.req.valid("param");
    const eventSubscribers: User[] = await db
      .select(getTableColumns(users))
      .from(subscribedEvents)
      .innerJoin(users, eq(users.id, subscribedEvents.userId))
      .where(eq(subscribedEvents.eventId, parseInt(eventID)));
    const formattedEventSubscribers = eventSubscribers.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }));
    return c.json(
      { eventSubscribers: formattedEventSubscribers },
      HttpStatusCodes.OK
    );
  }
);

v1App.openapi(
  createRoute({
    method: "get",
    path: "/events/{eventID}/subscribers/count",
    tags: ["events"],
    summary: "Get the number of subscribers for an event",
    middleware: [authMiddleWare("user")],
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
      HttpStatusCodes.OK
    );
  }
);

v1App.openapi(
  createRoute({
    method: "get",
    path: "/events/{eventID}/files",
    tags: ["events"],
    summary: "List all files for an event",
    middleware: [authMiddleWare("user")],
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
    return c.json({ eventFiles }, HttpStatusCodes.OK);
  }
);

// Companies
const companyIDSchema = z.object({
  companyID: z.string(),
});
const subscribedCompanySchema = createSelectSchema(subscribedCompanies);

v1App.openapi(
  createRoute({
    method: "get",
    path: "/companies",
    tags: ["companies"],
    summary: "List all companies",
    middleware: [authMiddleWare("user")],
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
    return c.json({ companies: foundCompanies }, HttpStatusCodes.OK);
  }
);

v1App.openapi(
  createRoute({
    method: "post",
    path: "/companies",
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
      [HttpStatusCodes.UNAUTHORIZED]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Unauthorized",
      },
      [HttpStatusCodes.FORBIDDEN]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Forbidden",
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
        HttpStatusCodes.CONFLICT
      );
    }
    return c.json({ company: newCompany[0] }, HttpStatusCodes.CREATED);
  }
);

v1App.openapi(
  createRoute({
    method: "post",
    path: "/companies/subscribe",
    tags: ["companies"],
    summary: "Subscribe to a company",
    middleware: [authMiddleWare("user")],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              companyId: z.string(),
            }),
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: {
          "application/json": {
            schema: z.object({
              subscription: subscribedCompanySchema,
            }),
          },
        },
        description: "Successfully subscribed",
      },
      [HttpStatusCodes.CONFLICT]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Already subscribed",
      },
      [HttpStatusCodes.UNAUTHORIZED]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Already subscribed",
      },
    },
  }),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "User not found" }, HttpStatusCodes.UNAUTHORIZED);
    }
    const { companyId } = c.req.valid("json");
    const newSubscription: SubscribedCompany[] = await db
      .insert(subscribedCompanies)
      .values({
        userId: user.id,
        companyId: parseInt(companyId),
        subscribedDate: new Date(),
      })
      .onConflictDoNothing()
      .returning();
    if (newSubscription.length === 0) {
      return c.json({ error: "Already subscribed" }, HttpStatusCodes.CONFLICT);
    }
    return c.json(
      { subscription: newSubscription[0] },
      HttpStatusCodes.CREATED
    );
  }
);

v1App.openapi(
  createRoute({
    method: "delete",
    path: "/companies/subscribe",
    tags: ["companies"],
    summary: "Unsubscribe from a company",
    middleware: [authMiddleWare("user")],
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              companyId: z.number(),
            }),
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
        description: "Successfully unsubscribed",
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Not found",
      },
      [HttpStatusCodes.UNAUTHORIZED]: {
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
        description: "Unauthorized",
      },
    },
  }),
  async (c) => {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "User not found" }, HttpStatusCodes.UNAUTHORIZED);
    }
    const { companyId } = c.req.valid("json");
    const result = await db
      .delete(subscribedCompanies)
      .where(
        and(
          eq(subscribedCompanies.userId, user.id),
          eq(subscribedCompanies.companyId, companyId)
        )
      )
      .returning();
    if (result.length === 0) {
      return c.json(
        { error: "Subscription not found" },
        HttpStatusCodes.NOT_FOUND
      );
    }
    return c.json(
      { message: "Successfully unsubscribed from company" },
      HttpStatusCodes.OK
    );
  }
);

v1App.openapi(
  createRoute({
    method: "get",
    path: "/companies/{companyID}/events",
    tags: ["companies"],
    summary: "List all events for a company",
    middleware: [authMiddleWare("user")],
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
      HttpStatusCodes.OK
    );
  }
);

v1App.openapi(
  createRoute({
    method: "get",
    path: "/companies/{companyID}/subscribers",
    tags: ["companies"],
    summary: "List all subscribers for a company",
    middleware: [authMiddleWare("user")],
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
      HttpStatusCodes.OK
    );
  }
);

v1App.openapi(
  createRoute({
    method: "get",
    path: "/companies/{companyID}/subscribers/count",
    tags: ["companies"],
    summary: "Get the number of subscribers for a company",
    middleware: [authMiddleWare("user")],
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
      HttpStatusCodes.OK
    );
  }
);

// Equipment
const equipmentRentalTypeSchema = createSelectSchema(equipmentRentalType);
const equipmentItemSchema = createSelectSchema(equipmentItem);
const equipmentRentalSchema = createSelectSchema(equipmentRentals);

v1App.openapi(
  createRoute({
    method: "get",
    path: "/equipment-rentals",
    tags: ["equipment"],
    summary: "List of all equipment types",
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              equipmentTypes: z.array(equipmentRentalTypeSchema),
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const foundEquipmentTypes: EquipmentRentalType[] = await db
      .select()
      .from(equipmentRentalType);
    return c.json({ equipmentTypes: foundEquipmentTypes }, HttpStatusCodes.OK);
  }
);

v1App.openapi(
  createRoute({
    method: "get",
    path: "/equipment-rentals/{equipmentTypeID}/equipment-items",
    tags: ["equipment"],
    summary: "List of all equipment items for a type",
    request: {
      params: z.object({
        equipmentTypeID: z.string(),
      }),
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              equipmentItems: z.array(equipmentItemSchema),
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const { equipmentTypeID } = c.req.valid("param");
    const foundEquipmentItems: EquipmentItem[] = await db
      .select()
      .from(equipmentItem)
      .where(eq(equipmentItem.equipmentType, parseInt(equipmentTypeID)));
    return c.json({ equipmentItems: foundEquipmentItems }, HttpStatusCodes.OK);
  }
);

v1App.openapi(
  createRoute({
    method: "get",
    path: "/equipment-rentals/equipment-item/{equipmentItemID}/rental-history",
    tags: ["equipment"],
    summary: "Lists rental history for an equipment item",
    request: {
      params: z.object({
        equipmentItemID: z.string(),
      }),
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              rentalHistory: z.array(equipmentRentalSchema),
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const { equipmentItemID } = c.req.valid("param");
    const rentalHistory: EquipmentRental[] = await db
      .select()
      .from(equipmentRentals)
      .where(eq(equipmentRentals.itemId, parseInt(equipmentItemID)));
    return c.json({ rentalHistory }, HttpStatusCodes.OK);
  }
);

// Majors
const majorSchema = createSelectSchema(majors);

v1App.openapi(
  createRoute({
    method: "get",
    path: "/majors",
    tags: ["majors"],
    summary: "List all majors",
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              majors: z.array(majorSchema),
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const foundMajors: Major[] = await db.select().from(majors);
    return c.json({ majors: foundMajors }, HttpStatusCodes.OK);
  }
);

v1App.openapi(
  createRoute({
    method: "get",
    path: "/majors/{majorName}/users",
    tags: ["majors"],
    summary: "List of all users in a major",
    middleware: [authMiddleWare("user")],
    request: {
      params: z.object({
        majorName: z.string(),
      }),
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              majorUsers: z.array(userSchema),
            }),
          },
        },
        description: "Successful response",
      },
    },
  }),
  async (c) => {
    const { majorName } = c.req.valid("param");
    const majorUsers: User[] = await db
      .select()
      .from(users)
      .where(eq(users.major, majorName));
    const formattedMajorUsers = majorUsers.map((user) => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    }));
    return c.json({ majorUsers: formattedMajorUsers }, HttpStatusCodes.OK);
  }
);

const updateUserSchema = z.object({
  name: z.string().optional(),
  major: z.string().optional(),
  gradDate: z.coerce.date().optional(),
  interests: z.array(z.enum(csFieldsEnum.enumValues)).optional(),
  education_level: z.enum(educationLevelEnum.enumValues).optional(),
  profilePic: z.string().optional(),
});

// GET /users/my endpoint
v1App.openapi(
  createRoute({
    method: "get",
    path: "/users/my",
    tags: ["users"],
    summary: "Get current user",
    middleware: [authMiddleWare("user")],
    responses: {
      [HttpStatusCodes.OK]: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: userSchema,
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const session = c.get("session");
    if (!session) {
      return c.json({ error: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
    }
    const user: User = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .then((res) => res[0]);

    return c.json(
      {
        ...user,
        createdAt: user.createdAt.toISOString(),
        gradDate: user.gradDate,
      },
      HttpStatusCodes.OK
    );
  }
);

// PUT /users/my endpoint
v1App.openapi(
  createRoute({
    method: "put",
    path: "/users/my",
    tags: ["users"],
    summary: "Update current user",
    middleware: [authMiddleWare("user")],
    request: {
      body: {
        content: {
          "application/json": {
            schema: updateUserSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: "Successfully updated user",
        content: {
          "application/json": {
            schema: userSchema,
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const session = c.get("session");
    const body = await c.req.json();
    const updateData = updateUserSchema.parse(body);
    if (!session) {
      return c.json({ error: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
    }

    const updatedUser = await db
      .update(users)
      .set({
        ...updateData,
        gradDate: updateData.gradDate?.toISOString(),
      })
      .where(eq(users.id, session.userId))
      .returning();

    const user = updatedUser[0];
    return c.json(
      {
        ...user,
        createdAt: user.createdAt.toISOString(),
        gradDate: user.gradDate,
      },
      HttpStatusCodes.OK
    );
  }
);

// Admin user management endpoints
const userIdSchema = z.object({
  userId: z.string(),
});

// GET /users/rental-history
v1App.openapi(
  createRoute({
    method: "get",
    path: "/users/rental-history",
    tags: ["users"],
    summary: "Get current user's equipment rental history",
    middleware: [authMiddleWare("user")],
    responses: {
      [HttpStatusCodes.OK]: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: z.object({
              rentals: z.array(
                z.object({
                  itemId: z.number(),
                  dateBorrowed: z.string(),
                  returnDate: z.string(),
                  price: z.number(),
                  condition: z.enum(equipmentConditionEnum.enumValues),
                  equipmentType: z.object({
                    name: z.string(),
                    description: z.string().nullable(),
                  }),
                })
              ),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const session = c.get("session");
    if (!session) {
      return c.json({ error: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
    }

    const rentals = await db
      .select({
        itemId: equipmentRentals.itemId,
        dateBorrowed: equipmentRentals.dateBorrowed,
        returnDate: equipmentRentals.returnDate,
        price: equipmentRentals.price,
        condition: equipmentRentals.condition,
        equipmentType: {
          name: equipmentRentalType.name,
          description: equipmentRentalType.description,
        },
      })
      .from(equipmentRentals)
      .innerJoin(equipmentItem, eq(equipmentRentals.itemId, equipmentItem.id))
      .innerJoin(
        equipmentRentalType,
        eq(equipmentItem.equipmentType, equipmentRentalType.id)
      )
      .where(eq(equipmentRentals.userId, session.userId));
    return c.json(
      {
        rentals: rentals.map((rental) => ({
          ...rental,
          price: Number(rental.price),
          dateBorrowed: rental.dateBorrowed,
          returnDate: rental.returnDate,
        })),
      },
      HttpStatusCodes.OK
    );
  }
);

const bookmarkSchema = createSelectSchema(bookmarkedEvents);

// GET /users/bookmarks
v1App.openapi(
  createRoute({
    method: "get",
    path: "/users/bookmarks",
    tags: ["users"],
    summary: "Get current user's bookmarks",
    middleware: [authMiddleWare("user")],
    responses: {
      [HttpStatusCodes.OK]: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: z.object({
              bookmarks: z.array(bookmarkSchema),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const session = c.get("session");
    if (!session) {
      return c.json({ error: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
    }
    const bookmarks = await db
      .select()
      .from(bookmarkedEvents)
      .where(eq(bookmarkedEvents.userId, session.userId));

    return c.json({ bookmarks }, HttpStatusCodes.OK);
  }
);

// GET /users/subscriptions
v1App.openapi(
  createRoute({
    method: "get",
    path: "/users/subscriptions",
    tags: ["users"],
    summary: "Get current user's subscriptions",
    middleware: [authMiddleWare("user")],
    responses: {
      [HttpStatusCodes.OK]: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: z.object({
              companies: z.array(companySchema),
              events: z.array(eventSchema),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const session = c.get("session");
    if (!session) {
      return c.json({ error: "Unauthorized" }, HttpStatusCodes.UNAUTHORIZED);
    }

    // Get subscribed companies
    const foundSubscribedCompanies: Company[] = await db
      .select(getTableColumns(companies))
      .from(subscribedCompanies)
      .innerJoin(companies, eq(companies.id, subscribedCompanies.companyId))
      .where(eq(subscribedCompanies.userId, session.userId));

    // Get subscribed events
    const foundSubscribedEvents: Event[] = await db
      .select(getTableColumns(events))
      .from(subscribedEvents)
      .innerJoin(events, eq(events.id, subscribedEvents.eventId))
      .where(eq(subscribedEvents.userId, session.userId));

    // Format events to match schema
    const formattedEvents = foundSubscribedEvents.map((event) => ({
      ...event,
      createdAt: event.createdAt.toISOString(),
    }));

    return c.json(
      {
        companies: foundSubscribedCompanies,
        events: formattedEvents,
      },
      HttpStatusCodes.OK
    );
  }
);

// GET /users/{userId}
v1App.openapi(
  createRoute({
    method: "get",
    path: "/users/{userId}",
    tags: ["users"],
    summary: "Admin Get a user by ID",
    middleware: [authMiddleWare("admin")],
    request: {
      params: userIdSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: userSchema,
          },
        },
      },
      [HttpStatusCodes.NOT_FOUND]: {
        description: "User not found",
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const { userId } = c.req.valid("param");
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((res) => res[0]);

    if (!user) {
      return c.json({ error: "User not found" }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json(
      {
        ...user,
        createdAt: user.createdAt.toISOString(),
        gradDate: user.gradDate,
      },
      HttpStatusCodes.OK
    );
  }
);

// PUT /users/{userId}
v1App.openapi(
  createRoute({
    method: "put",
    path: "/users/{userId}",
    tags: ["users"],
    summary: "Admin Update a user",
    middleware: [authMiddleWare("admin")],
    request: {
      params: userIdSchema,
      body: {
        content: {
          "application/json": {
            schema: updateUserSchema.extend({
              role: z.enum(userRoleEnum.enumValues).optional(),
            }),
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: "Successfully updated user",
        content: {
          "application/json": {
            schema: userSchema,
          },
        },
      },
      [HttpStatusCodes.NOT_FOUND]: {
        description: "User not found",
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const { userId } = c.req.valid("param");
    const body = await c.req.json();
    const updateData = updateUserSchema
      .extend({
        role: z.enum(userRoleEnum.enumValues).optional(),
      })
      .parse(body);

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((res) => res[0]);

    if (!existingUser) {
      return c.json({ error: "User not found" }, HttpStatusCodes.NOT_FOUND);
    }

    const updatedUser = await db
      .update(users)
      .set({
        ...updateData,
        gradDate: updateData.gradDate?.toISOString(),
      })
      .where(eq(users.id, userId))
      .returning();

    const user = updatedUser[0];
    return c.json(
      {
        ...user,
        createdAt: user.createdAt.toISOString(),
        gradDate: user.gradDate,
      },
      HttpStatusCodes.OK
    );
  }
);

// DELETE /users/{userId}
v1App.openapi(
  createRoute({
    method: "delete",
    path: "/users/{userId}",
    tags: ["users"],
    summary: "Admin Delete a user",
    middleware: [authMiddleWare("admin")],
    request: {
      params: userIdSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        description: "Successfully deleted user",
        content: {
          "application/json": {
            schema: z.object({
              success: z.boolean(),
            }),
          },
        },
      },
      [HttpStatusCodes.NOT_FOUND]: {
        description: "User not found",
        content: {
          "application/json": {
            schema: z.object({
              error: z.string(),
            }),
          },
        },
      },
      ...unauthorizedRequest,
    },
  }),
  async (c) => {
    const { userId } = c.req.valid("param");

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .then((res) => res[0]);

    if (!existingUser) {
      return c.json({ error: "User not found" }, HttpStatusCodes.NOT_FOUND);
    }

    await db.delete(users).where(eq(users.id, userId));

    return c.json({ success: true }, HttpStatusCodes.OK);
  }
);

export default v1App;
