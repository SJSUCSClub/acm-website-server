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
	S3_BUCKET_NAME: z.string().default(''),
  S3_DEFAULT_IMAGE_PLACEHOLDER: z.string().default(''),
	S3_BUCKET_URL: z.string().default(''),
	REGION: z.string().default('us-west-2'),
	ROLE_ARN: z.string().default(''),
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
