import { Pool, QueryResult, QueryResultRow } from 'pg';
import { env } from './env';

export type QueryExecutor = { query: <T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]) => Promise<QueryResult<T>> };

let pool: Pool | undefined;

export const getPool = (): Pool => {
  if (!env.databaseUrl) throw new Error('DATABASE_URL est obligatoire pour accéder à PostgreSQL');
  if (!pool) pool = new Pool({ connectionString: env.databaseUrl, max: 10, idleTimeoutMillis: 30000 });
  return pool;
};

export const query = <T extends QueryResultRow = QueryResultRow>(text: string, values: unknown[] = []): Promise<QueryResult<T>> => getPool().query<T>(text, values);

export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
};
