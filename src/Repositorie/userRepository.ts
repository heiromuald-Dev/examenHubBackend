import { query, QueryExecutor } from '../configuration/database';
import { UserRecord } from '../types/userTypes';

const executor = (client?: QueryExecutor): QueryExecutor => client ?? { query };

export const userRepository = {
  async findByEmail(email: string, client?: QueryExecutor): Promise<UserRecord | null> {
    const result = await executor(client).query<UserRecord>('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
    return result.rows[0] ?? null;
  },
  async findById(id: number, client?: QueryExecutor): Promise<UserRecord | null> {
    const result = await executor(client).query<UserRecord>('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    return result.rows[0] ?? null;
  },
  async listStudents(client?: QueryExecutor): Promise<UserRecord[]> {
    const result = await executor(client).query<UserRecord>(`SELECT * FROM users WHERE role = 'student' ORDER BY name, id`);
    return result.rows;
  },
  async createStudent(input: { name: string; email: string; passwordHash: string }, client?: QueryExecutor): Promise<UserRecord> {
    const result = await executor(client).query<UserRecord>(`INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,'student') RETURNING *`, [input.name, input.email, input.passwordHash]);
    return result.rows[0];
  },
  async updateStudent(id: number, input: { name: string; email: string }, client?: QueryExecutor): Promise<UserRecord | null> {
    const result = await executor(client).query<UserRecord>(`UPDATE users SET name=$1,email=$2 WHERE id=$3 AND role='student' RETURNING *`, [input.name, input.email, id]);
    return result.rows[0] ?? null;
  },
  async deactivateStudent(id: number, client?: QueryExecutor): Promise<UserRecord | null> {
    const result = await executor(client).query<UserRecord>(`UPDATE users SET is_active=FALSE WHERE id=$1 AND role='student' RETURNING *`, [id]);
    return result.rows[0] ?? null;
  },
  async updateProfile(id: number, name: string, email: string, client?: QueryExecutor): Promise<UserRecord | null> {
    const result = await executor(client).query<UserRecord>('UPDATE users SET name=$1,email=$2 WHERE id=$3 RETURNING *', [name, email, id]);
    return result.rows[0] ?? null;
  },
  async updatePassword(id: number, passwordHash: string, client?: QueryExecutor): Promise<void> {
    await executor(client).query('UPDATE users SET password_hash=$1 WHERE id=$2', [passwordHash, id]);
  }
};
