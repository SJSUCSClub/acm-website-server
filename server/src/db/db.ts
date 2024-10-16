import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '@/env';

export const pool = new Pool({
	user: env.POSTGRES_USER,
	host: env.POSTGRES_HOST,
	database: env.POSTGRES_DB,
	password: env.POSTGRES_PASSWORD,
});

export const db = drizzle(pool);
