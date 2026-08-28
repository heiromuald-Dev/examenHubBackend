import { query, QueryExecutor } from '../configuration/database';
import type { UserRecord } from '../types/userTypes';

const executor = (client?: QueryExecutor): QueryExecutor => client ?? { query };

export const studentRepository = {
  async list(client?: QueryExecutor): Promise<UserRecord[]> {
    const result = await executor(client).query<UserRecord>(
      `SELECT *
       FROM users
       WHERE role = 'student'
       ORDER BY name, id`
    );

    return result.rows;
  },

  async findById(id: number, client?: QueryExecutor): Promise<UserRecord | null> {
    const result = await executor(client).query<UserRecord>(
      `SELECT *
       FROM users
       WHERE id = $1
         AND role = 'student'
       LIMIT 1`,
      [id]
    );

    return result.rows[0] ?? null;
  },

  async create(
    input: { name: string; email: string; passwordHash: string },
    client?: QueryExecutor
  ): Promise<UserRecord> {
    const result = await executor(client).query<UserRecord>(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'student')
       RETURNING *`,
      [input.name, input.email, input.passwordHash]
    );

    return result.rows[0];
  },

  async update(
    id: number,
    input: { name: string; email: string },
    client?: QueryExecutor
  ): Promise<UserRecord | null> {
    const result = await executor(client).query<UserRecord>(
      `UPDATE users
       SET name = $1,
           email = $2,
           updated_at = NOW()
       WHERE id = $3
         AND role = 'student'
       RETURNING *`,
      [input.name, input.email, id]
    );

    return result.rows[0] ?? null;
  },

  async deactivate(id: number, client?: QueryExecutor): Promise<UserRecord | null> {
    const result = await executor(client).query<UserRecord>(
      `UPDATE users
       SET is_active = FALSE,
           updated_at = NOW()
       WHERE id = $1
         AND role = 'student'
       RETURNING *`,
      [id]
    );

    return result.rows[0] ?? null;
  }
};
