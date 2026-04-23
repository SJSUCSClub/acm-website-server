import { Context } from '@/lib/context';
import {
  authMiddleWare,
  unauthorizedRequest,
  forbiddenRequest,
} from '@/middlewares/auth-middleware';
import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { z } from 'zod';

import {
  createEmailTemplate,
  getEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  listEmailTemplates,
} from '@/lib/aws/ses';
import { templateMetadataSchema, templateNameSchema, templateSchema } from '@/util/zod';
import {
  AlreadyExistsException,
  InvalidTemplateException,
  LimitExceededException,
  SESServiceException,
  TemplateDoesNotExistException,
} from '@aws-sdk/client-ses';

const emailRouter = new OpenAPIHono<Context>();

emailRouter.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['email'],
    summary: 'List all email templates',
    middleware: [authMiddleWare('admin')],
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              templates: z.array(templateMetadataSchema),
            }),
          },
        },
        description: 'List of all email templates',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Failed to get email templates',
      },
    },
    ...unauthorizedRequest,
    ...forbiddenRequest,
  }),
  async (c) => {
    try {
      const templates = await listEmailTemplates();

      const formattedTemplates = templates?.map((template) => ({
        name: template.Name || '',
        createdTimestamp: template.CreatedTimestamp || new Date(),
      }));

      return c.json({ templates: formattedTemplates }, HttpStatusCodes.OK);
    } catch (error) {
      if (error instanceof SESServiceException) {
        return c.json(
          { error: `AWS SES service error: ${error.message}` },
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }
      return c.json(
        { error: `Failed to get email templates: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

emailRouter.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['email'],
    summary: 'Create a new email template',
    middleware: [authMiddleWare('admin')],
    request: {
      body: {
        content: {
          'application/json': {
            schema: templateSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
            }),
          },
        },
        description: 'Email template created successfully',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Failed to create email template',
      },
      [HttpStatusCodes.CONFLICT]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Template already exists',
      },
      [HttpStatusCodes.BAD_REQUEST]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Invalid template',
      },
      [HttpStatusCodes.TOO_MANY_REQUESTS]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Limit exceeded',
      },
    },
    ...unauthorizedRequest,
    ...forbiddenRequest,
  }),
  async (c) => {
    try {
      const { name, html, subject, text } = c.req.valid('json');

      await createEmailTemplate({
        TemplateName: name,
        HtmlPart: html,
        SubjectPart: subject,
        TextPart: text,
      });

      return c.json({ success: true }, HttpStatusCodes.CREATED);
    } catch (error) {
      if (error instanceof AlreadyExistsException) {
        return c.json({ error: 'Template already exists' }, HttpStatusCodes.CONFLICT);
      }
      if (error instanceof InvalidTemplateException) {
        return c.json({ error: 'Invalid template' }, HttpStatusCodes.BAD_REQUEST);
      }
      if (error instanceof LimitExceededException) {
        return c.json({ error: 'Limit exceeded' }, HttpStatusCodes.TOO_MANY_REQUESTS);
      }
      if (error instanceof SESServiceException) {
        return c.json(
          { error: `AWS SES service error: ${error.message}` },
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }
      return c.json(
        { error: `Failed to create email template: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

emailRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{templateName}',
    tags: ['email'],
    summary: 'Get an email template by name',
    middleware: [authMiddleWare('admin')],
    request: {
      params: templateNameSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: templateSchema,
          },
        },
        description: 'Email template details',
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Template not found',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Failed to get email template',
      },
    },
    ...unauthorizedRequest,
    ...forbiddenRequest,
  }),
  async (c) => {
    try {
      const { templateName } = c.req.valid('param');

      const template = await getEmailTemplate(templateName);

      return c.json(
        {
          name: template.TemplateName || templateName,
          html: template.HtmlPart || '',
          subject: template.SubjectPart || '',
          text: template.TextPart || '',
        },
        HttpStatusCodes.OK,
      );
    } catch (error) {
      if (error instanceof TemplateDoesNotExistException) {
        return c.json({ error: 'Template not found' }, HttpStatusCodes.NOT_FOUND);
      }
      if (error instanceof SESServiceException) {
        return c.json(
          { error: `AWS SES service error: ${error.message}` },
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }
      return c.json(
        { error: `Failed to get email template: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

emailRouter.openapi(
  createRoute({
    method: 'put',
    path: '/{templateName}',
    tags: ['email'],
    summary: 'Update an email template',
    middleware: [authMiddleWare('admin')],
    request: {
      params: templateNameSchema,
      body: {
        content: {
          'application/json': {
            schema: templateSchema,
          },
        },
      },
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
            }),
          },
        },
        description: 'Email template updated successfully',
      },
      [HttpStatusCodes.NOT_FOUND]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Template not found',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Failed to update email template',
      },
      [HttpStatusCodes.BAD_REQUEST]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Invalid template',
      },
    },
    ...unauthorizedRequest,
    ...forbiddenRequest,
  }),
  async (c) => {
    try {
      const { templateName } = c.req.valid('param');
      const { subject, html, text } = c.req.valid('json');

      await updateEmailTemplate({
        TemplateName: templateName,
        SubjectPart: subject,
        HtmlPart: html,
        TextPart: text,
      });

      return c.json({ success: true }, HttpStatusCodes.OK);
    } catch (error) {
      if (error instanceof InvalidTemplateException) {
        return c.json({ error: 'Invalid template' }, HttpStatusCodes.BAD_REQUEST);
      }
      if (error instanceof TemplateDoesNotExistException) {
        return c.json({ error: 'Template not found' }, HttpStatusCodes.NOT_FOUND);
      }
      if (error instanceof SESServiceException) {
        return c.json(
          { error: `AWS SES service error: ${error.message}` },
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }
      return c.json(
        { error: `Failed to update email template: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

emailRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{templateName}',
    tags: ['email'],
    summary: 'Delete an email template',
    middleware: [authMiddleWare('admin')],
    request: {
      params: templateNameSchema,
    },
    responses: {
      [HttpStatusCodes.OK]: {
        content: {
          'application/json': {
            schema: z.object({
              success: z.boolean(),
            }),
          },
        },
        description: 'Email template deleted successfully',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
        content: {
          'application/json': {
            schema: z.object({ error: z.string() }),
          },
        },
        description: 'Failed to delete email template',
      },
    },
    ...unauthorizedRequest,
    ...forbiddenRequest,
  }),
  async (c) => {
    try {
      const { templateName } = c.req.valid('param');

      await deleteEmailTemplate(templateName);

      return c.json({ success: true }, HttpStatusCodes.OK);
    } catch (error) {
      if (error instanceof SESServiceException) {
        return c.json(
          { error: `AWS SES service error: ${error.message}` },
          HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
      }
      return c.json(
        { error: `Failed to delete email template: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

export default emailRouter;
