import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();
// Also attempt to load from root .env if in subfolder
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('5000'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgres@localhost:5432/campus360_db?schema=public'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16).default('super-secret-jwt-key-for-campus360-dev-at-least-32-chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SUPABASE_URL: z.string().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let validatedEnv: EnvConfig;

try {
  validatedEnv = envSchema.parse(process.env);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('❌ Environment validation failed:');
    error.errors.forEach((err) => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  } else {
    console.error('❌ Failed to parse environment variables:', error);
  }
  // In development, provide safe fallbacks
  validatedEnv = envSchema.parse({
    NODE_ENV: 'development',
    PORT: '5000',
    DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/campus360_db?schema=public',
    FRONTEND_URL: 'http://localhost:5173',
    JWT_SECRET: 'super-secret-jwt-key-for-campus360-dev-at-least-32-chars',
    JWT_EXPIRES_IN: '7d',
    LOG_LEVEL: 'info',
  });
}

export const env = validatedEnv;
