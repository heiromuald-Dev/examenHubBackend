
import dotenv from 'dotenv';

dotenv.config();

const numberValue = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: numberValue(process.env.PORT, 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtSecret: process.env.JWT_SECRET ?? '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  adminName: process.env.ADMIN_NAME ?? 'Administrateur Exam Hub',
  adminEmail: process.env.ADMIN_EMAIL ?? '',
  adminPassword: process.env.ADMIN_PASSWORD ?? ''
};

export const assertRuntimeEnv = (): void => {
  const missing: string[] = [];
  if (!env.databaseUrl) missing.push('DATABASE_URL');
  if (!env.jwtSecret || env.jwtSecret.length < 32) missing.push('JWT_SECRET(minimum 32 caractères)');
  if (missing.length > 0) throw new Error(`Variables d'environnement manquantes ou invalides: ${missing.join(', ')}`);
};
