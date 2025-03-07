import { z, ZodError } from 'zod';

const EnvSchema = z.object({
	NODE_ENV: z
		.enum(['development', 'production', 'test'])
		.default('development'),
	PORT: z.string().default('5001'),
	POSTGRES_HOST: z.string().default('localhost'),
	POSTGRES_PORT: z.string().transform(Number).default('5432'),
	POSTGRES_USER: z.string().default('postgres'),
	POSTGRES_PASSWORD: z.string().default('postgres'),
	POSTGRES_DB: z.string().default('acm_website'),
	GOOGLE_CLIENT_ID: z.string().default(''),
	GOOGLE_CLIENT_SECRET: z.string().default(''),
	GOOGLE_REDIRECT_URI: z.string().default(''),
	ACCESS_KEY_ID: z.string().default(''),
	SECRET_ACCESS_KEY: z.string().default(''),
	BUCKET_NAME: z.string().default('acmwebsite-dev-588738592350-us-west-2'),
	REGION: z.string().default('us-west-2'),
	ROLE_ARM: z.string().default('arn:aws:iam::588738592350:role/AcmApplicationServerRoleForLocal'),
});

export type Env = z.infer<typeof EnvSchema>;
let env: Env;

try {
	env = EnvSchema.parse(process.env);
} catch (e) {
	const error = e as ZodError;
	console.error('Invalid environment variables:', error);
	console.error(error.flatten().fieldErrors);
	process.exit(1);
}

export { env };
