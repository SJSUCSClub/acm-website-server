import { OpenAPIHono } from '@hono/zod-openapi';
import { googleAuth } from '@/lib/auth';
import { getCookie, setCookie } from 'hono/cookie';
import { db } from '@/db/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { User } from '@/db/schema';
import { lucia } from '@/lib/auth';
import { env } from '@/env';
import { setUser, setSession } from '@/lib/context';

const authRouter = new OpenAPIHono();
import {
	generateCodeVerifier,
	generateState,
	GoogleRefreshedTokens,
	type GoogleTokens,
} from 'arctic';

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

authRouter.get('/login', async c => {
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
});

authRouter.get('/callback', async c => {
	const { code, state } = c.req.query();

	if (!code || !state) {
		return c.json({ error: 'Missing code or state' }, 400);
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
				})
				.returning();

			user = newUser[0];
		}
		setCookie(c, 'user', JSON.stringify(user), {
			path: '/',
		});
		setUser(c, user);

		const session = await lucia.createSession(user.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		setCookie(c, 'session', sessionCookie.value, {
			...sessionCookie.attributes,
			path: '/',
		});

		return c.redirect('/');
	} catch (error) {
		console.error(error);
		return c.json({ error: 'Failed to validate authorization code' }, 500);
	}
});

authRouter.post('/refresh', async c => {
	const { refreshToken } = c.req.query();
	if (!refreshToken) {
		return c.json({ error: 'Missing refresh token' }, 400);
	}

	try {
		const tokens: GoogleRefreshedTokens = await googleAuth.refreshAccessToken(
			refreshToken,
		);
		const { accessToken } = tokens;

		setCookie(c, 'access_token', accessToken, {
			path: '/',
		});
		return c.json({
			success: true,
		});
	} catch (error) {
		console.error(error);
		return c.json(
			{ success: false, error: 'Failed to refresh access token' },
			500,
		);
	}
});

authRouter.post('/logout', async c => {
	const sessionId = getCookie(c, 'session');
	if (!sessionId) {
		return c.json({ error: 'Missing session' }, 400);
	}
	await lucia.invalidateSession(sessionId);
	return c.json({ success: true });
});

export default authRouter;
