import { query, QueryExecutor } from '../configuration/database';
import { CourseRecord } from '../Model/courseModel';
const executor = (client?: QueryExecutor): QueryExecutor => client ?? { query };
export const courseRepository = {
  async list(client?: QueryExecutor): Promise<CourseRecord[]> { return (await executor(client).query<CourseRecord>('SELECT * FROM courses ORDER BY code')).rows; },
  async findById(id: number, client?: QueryExecutor): Promise<CourseRecord | null> { return (await executor(client).query<CourseRecord>('SELECT * FROM courses WHERE id=$1', [id])).rows[0] ?? null; },
  async create(input: { code: string; name: string; description: string | null }, client?: QueryExecutor): Promise<CourseRecord> { return (await executor(client).query<CourseRecord>('INSERT INTO courses(code,name,description) VALUES($1,$2,$3) RETURNING *', [input.code,input.name,input.description])).rows[0]; },
  async update(id: number, input: { code: string; name: string; description: string | null }, client?: QueryExecutor): Promise<CourseRecord | null> { return (await executor(client).query<CourseRecord>('UPDATE courses SET code=$1,name=$2,description=$3 WHERE id=$4 RETURNING *', [input.code,input.name,input.description,id])).rows[0] ?? null; },
  async remove(id: number, client?: QueryExecutor): Promise<void> { await executor(client).query('DELETE FROM courses WHERE id=$1', [id]); }
};
