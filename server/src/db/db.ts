import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
	user: process.env.POSTGRES_USER || 'postgres',
	host: process.env.POSTGRES_HOST || 'db',
	database: process.env.POSTGRES_DB || 'acm_website',
	password: process.env.POSTGRES_PASSWORD || 'postgres',
});

export const db = drizzle(pool);
