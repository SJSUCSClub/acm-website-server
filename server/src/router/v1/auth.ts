import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { setCookie, getCookie } from 'hono/cookie';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import * as HttpStatusCodes from 'stoker/http-status-codes';
import {
	generateCodeVerifier,
	generateState,
	//GoogleRefreshedTokens,
	type GoogleTokens,
} from 'arctic';

import type { Context } from '@/lib/context';
import { googleAuth, lucia } from '@/lib/auth';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import type { User } from '@/db/schema';
import { env } from '@/env';
import { authMiddleWare } from '@/middlewares/auth-middleware';

const authRouter = new OpenAPIHono<Context>();

const codeVerifier = generateCodeVerifier();

interface GoogleUser {
	email: string;
	picture: string;
	name: string;
	given_name?: string;
	family_name?: string;
	email_verified: boolean;
	hd?: string;
	sub: string;
}

authRouter.openapi(
	createRoute({
		method: 'get',
		path: '/login',
		tags: ['auth'],
		summary: 'Initiate Google OAuth login',
		responses: {
			[HttpStatusCodes.MOVED_PERMANENTLY]: {
				description: 'Redirect to Google OAuth',
			},
			[HttpStatusCodes.BAD_REQUEST]: {
				description: 'Google OAuth not configured',
			},
		},
	}),
	async c => {
		if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
			return c.json({ error: 'Google OAuth is not configured' }, HttpStatusCodes.BAD_REQUEST);
		}

		const state = generateState();
		const url: URL = await googleAuth.createAuthorizationURL(
			state,
			codeVerifier,
			{
				scopes: ['openid', 'email', 'profile'],
			},
		);
		setCookie(c, 'google_state', state, {
			path: '/',
			secure: env.NODE_ENV === 'production',
			httpOnly: true,
			maxAge: 60 * 60 * 24 * 30, // 30 days
		});
		return c.redirect(url.toString());
	},
);

authRouter.openapi(
	createRoute({
		method: 'get',
		path: '/callback',
		tags: ['auth'],
		summary: 'Handle Google OAuth callback',
		parameters: [
			{
				name: 'code',
				in: 'query',
				required: true,
				schema: { type: 'string' },
			},
			{
				name: 'state',
				in: 'query',
				required: true,
				schema: { type: 'string' },
			},
		],
		responses: {
			[HttpStatusCodes.MOVED_PERMANENTLY]: {
				description: 'Redirect after successful login',
			},
			[HttpStatusCodes.BAD_REQUEST]: {
				description: 'Missing code or state',
				content: {
					'application/json': {
						schema: z.object({
							error: z.string(),
						}),
					},
				},
			},
			[HttpStatusCodes.INTERNAL_SERVER_ERROR]: {
				description: 'Failed to validate authorization code',
				content: {
					'application/json': {
						schema: z.object({
							error: z.string(),
						}),
					},
				},
			},
		},
	}),
	async c => {
		const { code, state } = c.req.query();
		const storedState = getCookie(c, 'google_state');

		if (!code || !state || state !== storedState) {
			return c.json({ error: 'Missing code or state' }, HttpStatusCodes.BAD_REQUEST);
		}

		try {
			const tokens: GoogleTokens = await googleAuth.validateAuthorizationCode(
				code,
				codeVerifier,
			);
			const { accessToken } = tokens;
			const response = await fetch(
				'https://openidconnect.googleapis.com/v1/userinfo',
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			);
			const {
				email,
				name,
				picture,
				sub: userId,
			}: GoogleUser = await response.json();
			const existingUser: User = (
				await db.select().from(users).where(eq(users.email, email))
			)?.[0];
			let user = existingUser;
      let redirectPath = '/'
			if (!existingUser) {
				const newUser = await db
					.insert(users)
					.values({
						id: userId,
						createdAt: new Date(),
						name,
						email,
						major: 'Undeclared',
						gradDate: new Date().toISOString(),
						interests: [],
						profilePic: picture,
						education_level: 'undergraduate',
					})
					.returning();

				user = newUser[0];
        redirectPath = '/onboarding'
			}
			const session = await lucia.createSession(user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id).serialize();
			c.header('Set-Cookie', sessionCookie, { append: true });

			return c.redirect(redirectPath);
		} catch (error) {
			console.error(error);
			return c.json(
				{ error: 'Failed to validate authorization code' },
				HttpStatusCodes.INTERNAL_SERVER_ERROR,
			);
		}
	},
);

// TODO: refresh token

authRouter.openapi(
	createRoute({
		method: 'get',
		path: '/logout',
		tags: ['auth'],
		summary: 'Logout user',
		middleware: [authMiddleWare('user')],
		responses: {
			[HttpStatusCodes.MOVED_PERMANENTLY]: {
				description: 'Redirect after logout',
			},
		},
	}),
	async c => {
		const session = c.get('session');
		if (!session) {
		return c.redirect('/');
		}
		lucia.invalidateSession(session.id);
		return c.redirect('/');
	},
);

export default authRouter;
