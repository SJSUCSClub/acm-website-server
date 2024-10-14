import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

import { env } from './src/env';

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/db/schema.ts',
	out: './drizzle',
	dbCredentials: {
		host: env.POSTGRES_HOST || 'localhost',
		port: env.POSTGRES_PORT || 5432,
		user: env.POSTGRES_USER || 'postgres',
		password: env.POSTGRES_PASSWORD || 'postgres',
		database: env.POSTGRES_DB || 'acm_website',
		ssl: 'allow',
	},
	verbose: true,
});
