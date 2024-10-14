import { Lucia } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '@/db/db';
import { sessions, User, users } from '@/db/schema';
import { Google } from 'arctic';
const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);
import { env } from '@/env';

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: env.NODE_ENV === 'production',
		},
	},
	getUserAttributes: (attributes: User): User => ({
		id: attributes.id,
		createdAt: attributes.createdAt,
		name: attributes.name,
		email: attributes.email,
		major: attributes.major,
		gradDate: attributes.gradDate,
		interests: attributes.interests,
		profilePic: attributes.profilePic,
		role: attributes.role,
	}),
});

export const googleAuth = new Google(
	env.GOOGLE_CLIENT_ID,
	env.GOOGLE_CLIENT_SECRET,
	env.GOOGLE_REDIRECT_URI,
);

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: User;
	}
}
