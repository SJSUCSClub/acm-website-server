import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
	dialect: 'postgresql',
	schema: './src/db/schema.ts',
	out: './drizzle',
	dbCredentials: {
		host: process.env.POSTGRES_HOST || 'localhost',
		port: Number(process.env.POSTGRES_PORT) || 5432,
		user: process.env.POSTGRES_USER || 'postgres',
		password: process.env.POSTGRES_PASSWORD || 'postgres',
		database: process.env.POSTGRES_DB || 'acm_website',
		ssl: 'allow',
	},
	verbose: true,
});
