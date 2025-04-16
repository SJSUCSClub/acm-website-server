import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import * as HttpStatusCodes from "stoker/http-status-codes";

import type { Context } from "@/lib/context";
import { db } from "@/db/db";
import {
  users,
  projects,
  files,
  interestedInProjects,
  projectsFiles,
} from "@/db/schema";
import { and, eq, getTableColumns } from "drizzle-orm";
import type { User, Project, File as FileSchema } from "@/db/schema"; // naming conflict with File and schema File type
import {
  authMiddleWare,
  unauthorizedRequest,
  forbiddenRequest,
} from "@/middlewares/auth-middleware";
import {
  projectIDSchema,
  userSchema,
  fileSchema,
  projectSchema,
  errorSchema,
  newProjectSchema,
} from "@/util/zod";
import {
  uploadFile,
  deleteFile,
  generateObjectUrl,
  getPresignedUrlPutObj,
} from "@/lib/aws/s3";

const projectRouter = new OpenAPIHono<Context>();

const generateFileKey = (projectId: string | number, filename: string) => {
  return `projects/${projectId}/files/${filename}`;
};

projectRouter.openapi(
  createRoute({
    method: "post",
    path: "/{projectID}/files/{filename}",
    tags: ["projects"],
    summary: "Upload a file to a project",
    middleware: [authMiddleWare("admin")],
    request: {
      params: z.object({
        projectID: projectIDSchema.shape.projectID,
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
        description: "Successful",
      },
      [HttpStatusCodes.BAD_REQUEST]: {
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
        description: "Bad request",
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
    const projectId = c.req.param("projectID");
    const filename = c.req.param("filename");
    if (!projectId || !filename) {
      return c.json(
        { status: "error occured uploading file" },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    const key = generateFileKey(projectId, filename);

    try {
      await db.insert(files).values({ key, name: filename });
      await db
        .insert(projectsFiles)
        .values({ projectId: parseInt(projectId), fileKey: key });

      const res = await getPresignedUrlPutObj(key);
      if (res) {
        return c.json({ presigned_url: res }, HttpStatusCodes.OK);
      }
    } catch (error) {
      return c.json(
        { error: "error generating presigned url" },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

projectRouter.openapi(
  createRoute({
    method: "delete",
    path: "/{projectID}/files/{fileName}",
    tags: ["projects"],
    summary: "Delete a file from a project",
    middleware: [authMiddleWare("admin")],
    request: {
      params: z.object({
        projectID: projectIDSchema.shape.projectID,
        fileName: z.string(),
      }),
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: {
        description: "Successful response",
      },
      [HttpStatusCodes.BAD_REQUEST]: {
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
        description: "Bad request",
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
    const fileName = c.req.param("fileName");
    const projectId = c.req.param("projectID");

    if (!fileName || !projectId) {
      return c.json(
        { status: "Not valid parameters" },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    try {
      const fileKey = generateFileKey(projectId, fileName);
      await db
        .delete(projectsFiles)
        .where(
          and(
            eq(projectsFiles.fileKey, fileKey),
            eq(projectsFiles.projectId, parseInt(projectId)),
          ),
        );
      await db.delete(files).where(eq(files.key, fileKey));
      const res = await deleteFile(fileKey);
      if (!res) {
        throw new Error("Failed to delete file");
      }
      return c.text("", HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json(
        { status: `error occured deleting file: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

projectRouter.openapi(
  createRoute({
    method: "get",
    path: "/",
    tags: ["projects"],
    summary: "List all projects",
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
  },
);

projectRouter.openapi(
  createRoute({
    method: "get",
    path: "/{projectID}",
    tags: ["projects"],
    summary: "Get a project by ID",
    request: {
      params: projectIDSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          "application/json": {
            schema: z.object({
              project: projectSchema,
            }),
          },
        },
        description: "Successful response",
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
        description: "Project not found",
      },
    },
  }),
  async (c) => {
    const { projectID } = c.req.valid("param");
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, parseInt(projectID)));

    if (!project.length) {
      return c.json({ error: "Project not found" }, HttpStatusCodes.NOT_FOUND);
    }

    return c.json({ project: project[0] }, HttpStatusCodes.OK);
  },
);

projectRouter.openapi(
  createRoute({
    method: "get",
    path: "/{projectID}/interested",
    tags: ["projects"],
    summary: "List all interested users for a project",
    middleware: [authMiddleWare("admin")],
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
      HttpStatusCodes.OK,
    );
  },
);

projectRouter.openapi(
  createRoute({
    method: "get",
    path: "/{projectID}/files",
    tags: ["projects"],
    summary: "List all files for a project",
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
    const projectFiles: FileSchema[] = await db
      .select(getTableColumns(files))
      .from(projectsFiles)
      .innerJoin(files, eq(files.key, projectsFiles.fileKey))
      .where(eq(projectsFiles.projectId, parseInt(projectID)));

    const mappedProjectFiles = projectFiles.map((file) => ({
      ...file,
      url: generateObjectUrl(file.key),
    }));

    return c.json({ projectFiles: mappedProjectFiles }, HttpStatusCodes.OK);
  },
);

projectRouter.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["projects"],
    summary: "Creates a new project",
    middleware: [authMiddleWare("admin")],
    request: {
      body: {
        content: {
          "application/json": {
            schema: newProjectSchema,
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
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
        description: "Failed to create project",
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const newProject = await db.insert(projects).values(body).returning();
    if (newProject.length === 0) {
      return c.json(
        { error: "Failed to create project" },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
    return c.json({ project: newProject[0] }, HttpStatusCodes.CREATED);
  },
);

projectRouter.openapi(
  createRoute({
    method: "put",
    path: "/{projectID}",
    tags: ["projects"],
    summary: "Update project",
    middleware: [authMiddleWare("admin")],
    request: {
      params: projectIDSchema,
      body: {
        content: {
          "application/json": {
            schema: newProjectSchema,
          },
        },
      },
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
        description: "Failed to create project",
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          "application/json": {
            schema: errorSchema,
          },
        },
        description: "Failed to update project",
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const body = c.req.valid("json");
    const projectID = c.req.param("projectID");

    if (!projectID) {
      return c.json(
        { error: "Project ID is required" },
        HttpStatusCodes.BAD_REQUEST,
      );
    }

    try {
      const newProject = await db
        .update(projects)
        .set(body)
        .where(eq(projects.id, parseInt(projectID)))
        .returning();
      if (newProject.length === 0) {
        return c.json(
          { error: "Project not found" },
          HttpStatusCodes.NOT_FOUND,
        );
      }
      return c.text("", HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json(
        { error: `Failed to update project: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

export default projectRouter;
