import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import { getCookie } from 'hono/cookie';
import { count, desc, eq, like, type SQL } from 'drizzle-orm';

import type { Context } from '@/lib/context';
import { lucia } from '@/lib/auth';
import { db } from '@/db/db';
import { blogPosts, files, users } from '@/db/schema';
import {
  authMiddleWare,
  unauthorizedRequest,
  forbiddenRequest,
} from '@/middlewares/auth-middleware';
import {
  blogListQuerySchema,
  blogPostIDSchema,
  blogPostSchema,
  blogPostSummarySchema,
  errorSchema,
  newBlogPostSchema,
} from '@/util/zod';
import { deleteFile, generateObjectUrl, getPresignedUrlPutObj } from '@/lib/aws/s3';

const blogRouter = new OpenAPIHono<Context>();

const EXCERPT_LENGTH = 200;

const generatePrefix = (postId: string | number): string => `blog/${postId}/`;
const generateCoverKey = (postId: string | number): string => `${generatePrefix(postId)}cover`;
const generateImageKey = (postId: string | number, filename: string): string =>
  `${generatePrefix(postId)}images/${filename}`;

const errorResponse = (description: string) => ({
  content: { 'application/json': { schema: errorSchema } },
  description,
});

const postColumns = {
  id: blogPosts.id,
  title: blogPosts.title,
  content: blogPosts.content,
  coverImage: blogPosts.coverImage,
  published: blogPosts.published,
  publishedAt: blogPosts.publishedAt,
  createdAt: blogPosts.createdAt,
  updatedAt: blogPosts.updatedAt,
  authorId: users.id,
  authorName: users.name,
};
type PostRow = {
  id: number;
  title: string;
  content: string;
  coverImage: string | null;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: string | null;
  authorName: string | null;
};

const toExcerpt = (markdown: string): string => {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> link text
    .replace(/<[^>]*>/g, '') // html tags
    .replace(/^[\s|:-]+$/gm, '') // table separator rows
    .replace(/\[[ xX]\]/g, '') // task list markers
    .replace(/[#>*_`~|-]+/g, ' ') // markdown punctuation
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH).trimEnd()}…` : text;
};

const toSummary = (row: PostRow) => ({
  id: row.id,
  title: row.title,
  excerpt: toExcerpt(row.content),
  coverImageUrl: row.coverImage ? generateObjectUrl(row.coverImage) : null,
  author: row.authorId && row.authorName ? { id: row.authorId, name: row.authorName } : null,
  published: row.published,
  publishedAt: row.publishedAt?.toISOString() ?? null,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

const toPost = (row: PostRow) => {
  const { id, title, coverImageUrl, author, published, publishedAt, createdAt, updatedAt } =
    toSummary(row);
  return {
    id,
    title,
    content: row.content,
    coverImageUrl,
    author,
    published,
    publishedAt,
    createdAt,
    updatedAt,
  };
};

// Public routes can still show drafts to an admin who happens to be logged in.
const isAdminRequest = async (c: Parameters<typeof getCookie>[0]): Promise<boolean> => {
  const sessionId = getCookie(c, lucia.sessionCookieName);
  if (!sessionId) {
    return false;
  }
  const { user } = await lucia.validateSession(sessionId);
  return user?.role === 'admin';
};

const listPosts = async (where: SQL | undefined, page: number, limit: number) => {
  const rows: PostRow[] = await db
    .select(postColumns)
    .from(blogPosts)
    .leftJoin(users, eq(users.id, blogPosts.authorId))
    .where(where)
    // NULL published_at (drafts) sorts first on DESC, so admins see drafts at the top
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt), desc(blogPosts.id))
    .limit(limit)
    .offset((page - 1) * limit);
  const [{ total }] = await db.select({ total: count() }).from(blogPosts).where(where);
  return { posts: rows.map(toSummary), total };
};

const getPost = async (id: number): Promise<PostRow | undefined> => {
  const rows: PostRow[] = await db
    .select(postColumns)
    .from(blogPosts)
    .leftJoin(users, eq(users.id, blogPosts.authorId))
    .where(eq(blogPosts.id, id));
  return rows[0];
};

const listResponseSchema = z.object({
  posts: z.array(blogPostSummarySchema),
  total: z.number(),
});

blogRouter.openapi(
  createRoute({
    method: 'get',
    path: '/',
    tags: ['blog'],
    summary: 'List published blog posts, newest first',
    request: { query: blogListQuerySchema },
    responses: {
      [HttpStatusCodes.OK]: {
        content: { 'application/json': { schema: listResponseSchema } },
        description: 'Successful response',
      },
    },
  }),
  async (c) => {
    const { page, limit } = c.req.valid('query');
    return c.json(await listPosts(eq(blogPosts.published, true), page, limit), HttpStatusCodes.OK);
  },
);

// Registered before '/{postID}' so 'admin' is not parsed as an id.
blogRouter.openapi(
  createRoute({
    method: 'get',
    path: '/admin',
    tags: ['blog'],
    summary: 'List all blog posts including drafts',
    middleware: [authMiddleWare('admin')],
    request: { query: blogListQuerySchema },
    responses: {
      [HttpStatusCodes.OK]: {
        content: { 'application/json': { schema: listResponseSchema } },
        description: 'Successful response',
      },
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { page, limit } = c.req.valid('query');
    return c.json(await listPosts(undefined, page, limit), HttpStatusCodes.OK);
  },
);

blogRouter.openapi(
  createRoute({
    method: 'get',
    path: '/{postID}',
    tags: ['blog'],
    summary: 'Get a blog post by ID (drafts are visible to admins only)',
    request: { params: blogPostIDSchema },
    responses: {
      [HttpStatusCodes.OK]: {
        content: { 'application/json': { schema: z.object({ post: blogPostSchema }) } },
        description: 'Successful response',
      },
      [HttpStatusCodes.NOT_FOUND]: errorResponse('Post not found'),
    },
  }),
  async (c) => {
    const { postID } = c.req.valid('param');
    const post = await getPost(parseInt(postID));
    if (!post || (!post.published && !(await isAdminRequest(c)))) {
      return c.json({ error: 'Post not found' }, HttpStatusCodes.NOT_FOUND);
    }
    return c.json({ post: toPost(post) }, HttpStatusCodes.OK);
  },
);

blogRouter.openapi(
  createRoute({
    method: 'post',
    path: '/',
    tags: ['blog'],
    summary: 'Create a blog post',
    middleware: [authMiddleWare('admin')],
    request: {
      body: { content: { 'application/json': { schema: newBlogPostSchema } } },
    },
    responses: {
      [HttpStatusCodes.CREATED]: {
        content: { 'application/json': { schema: z.object({ post: blogPostSchema }) } },
        description: 'Successful response',
      },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: errorResponse('Failed to create post'),
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const body = c.req.valid('json');
    const user = c.get('user');
    try {
      const [created] = await db
        .insert(blogPosts)
        .values({
          ...body,
          authorId: user?.id ?? null,
          publishedAt: body.published ? new Date() : null,
        })
        .returning();
      const post = await getPost(created.id);
      if (!post) {
        throw new Error('post missing after insert');
      }
      return c.json({ post: toPost(post) }, HttpStatusCodes.CREATED);
    } catch (error) {
      return c.json(
        { error: `Failed to create post: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

blogRouter.openapi(
  createRoute({
    method: 'put',
    path: '/{postID}',
    tags: ['blog'],
    summary: 'Update a blog post',
    middleware: [authMiddleWare('admin')],
    request: {
      params: blogPostIDSchema,
      body: { content: { 'application/json': { schema: newBlogPostSchema } } },
    },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: { description: 'Successful response' },
      [HttpStatusCodes.NOT_FOUND]: errorResponse('Post not found'),
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: errorResponse('Failed to update post'),
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { postID } = c.req.valid('param');
    const body = c.req.valid('json');
    try {
      const existing = await getPost(parseInt(postID));
      if (!existing) {
        return c.json({ error: 'Post not found' }, HttpStatusCodes.NOT_FOUND);
      }
      await db
        .update(blogPosts)
        .set({
          ...body,
          // keep the original date across unpublish/republish
          publishedAt: existing.publishedAt ?? (body.published ? new Date() : null),
          updatedAt: new Date(),
        })
        .where(eq(blogPosts.id, existing.id));
      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json(
        { error: `Failed to update post: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

blogRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{postID}',
    tags: ['blog'],
    summary: 'Delete a blog post and its images',
    middleware: [authMiddleWare('admin')],
    request: { params: blogPostIDSchema },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: { description: 'Successful response' },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: errorResponse('Failed to delete post'),
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { postID } = c.req.valid('param');
    try {
      await db.delete(blogPosts).where(eq(blogPosts.id, parseInt(postID)));
      const postFiles = await db
        .select({ key: files.key })
        .from(files)
        .where(like(files.key, `${generatePrefix(postID)}%`));
      // The post is already gone, so S3 cleanup is best-effort: a failure leaves the
      // `files` row in place (so the object stays discoverable) but doesn't fail the request.
      for (const { key } of postFiles) {
        try {
          await deleteFile(key);
          await db.delete(files).where(eq(files.key, key));
        } catch (error) {
          c.var.logger.warn({ key, error: String(error) }, 'failed to delete blog file');
        }
      }
      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json(
        { error: `Failed to delete post: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

const presignedResponse = {
  [HttpStatusCodes.CREATED]: {
    content: {
      'application/json': {
        schema: z.object({ presigned_url: z.string(), url: z.string() }),
      },
    },
    description: 'Presigned upload URL, and the public URL the file will be served from',
  },
  [HttpStatusCodes.NOT_FOUND]: errorResponse('Post not found'),
  [HttpStatusCodes.INTERNAL_SERVER_ERROR]: errorResponse('Failed to generate presigned url'),
  ...unauthorizedRequest,
  ...forbiddenRequest,
};

blogRouter.openapi(
  createRoute({
    method: 'post',
    path: '/{postID}/cover',
    tags: ['blog'],
    summary: 'Set the cover image of a post',
    middleware: [authMiddleWare('admin')],
    request: { params: blogPostIDSchema },
    responses: presignedResponse,
  }),
  async (c) => {
    const { postID } = c.req.valid('param');
    const key = generateCoverKey(postID);
    try {
      if (!(await getPost(parseInt(postID)))) {
        return c.json({ error: 'Post not found' }, HttpStatusCodes.NOT_FOUND);
      }
      // Presign before touching the DB so a failure doesn't leave a cover pointing at nothing.
      const presigned_url = await getPresignedUrlPutObj(key);
      await db.insert(files).values({ key, name: 'cover' }).onConflictDoNothing();
      await db
        .update(blogPosts)
        .set({ coverImage: key, updatedAt: new Date() })
        .where(eq(blogPosts.id, parseInt(postID)));
      return c.json({ presigned_url, url: generateObjectUrl(key) }, HttpStatusCodes.CREATED);
    } catch (error) {
      return c.json(
        { error: `Failed to generate presigned url: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

blogRouter.openapi(
  createRoute({
    method: 'delete',
    path: '/{postID}/cover',
    tags: ['blog'],
    summary: 'Remove the cover image of a post',
    middleware: [authMiddleWare('admin')],
    request: { params: blogPostIDSchema },
    responses: {
      [HttpStatusCodes.NO_CONTENT]: { description: 'Successful response' },
      [HttpStatusCodes.INTERNAL_SERVER_ERROR]: errorResponse('Failed to delete cover image'),
      ...unauthorizedRequest,
      ...forbiddenRequest,
    },
  }),
  async (c) => {
    const { postID } = c.req.valid('param');
    const key = generateCoverKey(postID);
    try {
      await db
        .update(blogPosts)
        .set({ coverImage: null, updatedAt: new Date() })
        .where(eq(blogPosts.id, parseInt(postID)));
      await db.delete(files).where(eq(files.key, key));
      await deleteFile(key);
      return c.text('', HttpStatusCodes.NO_CONTENT);
    } catch (error) {
      return c.json(
        { error: `Failed to delete cover image: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

blogRouter.openapi(
  createRoute({
    method: 'post',
    path: '/{postID}/images/{filename}',
    tags: ['blog'],
    summary: 'Get a presigned url to upload an image for use inside the post body',
    middleware: [authMiddleWare('admin')],
    request: {
      params: z.object({
        postID: blogPostIDSchema.shape.postID,
        filename: z.string().min(1),
      }),
    },
    responses: presignedResponse,
  }),
  async (c) => {
    const { postID, filename } = c.req.valid('param');
    const key = generateImageKey(postID, filename);
    try {
      const post = await getPost(parseInt(postID));
      if (!post) {
        return c.json({ error: 'Post not found' }, HttpStatusCodes.NOT_FOUND);
      }
      const presigned_url = await getPresignedUrlPutObj(key);
      await db.insert(files).values({ key, name: filename }).onConflictDoNothing();
      return c.json(
        {
          presigned_url,
          // S3 decodes the path, so the raw key above is served at this encoded url
          url: generateObjectUrl(generateImageKey(postID, encodeURIComponent(filename))),
        },
        HttpStatusCodes.CREATED,
      );
    } catch (error) {
      return c.json(
        { error: `Failed to generate presigned url: ${error}` },
        HttpStatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  },
);

export default blogRouter;
