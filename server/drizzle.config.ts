import { defineConfig } from 'drizzle-kit';

import { env } from './src/env';

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/db/schema.ts',
	out: './drizzle',
	dbCredentials: {
		host: env.POSTGRES_HOST,
		port: env.POSTGRES_PORT,
		user: env.POSTGRES_USER,
		password: env.POSTGRES_PASSWORD,
		database: env.POSTGRES_DB,
		ssl: 'allow',
	},
	verbose: true,
});
