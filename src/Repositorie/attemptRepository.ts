import { query, QueryExecutor } from '../configuration/database';
import { AttemptRecord } from '../Model/attemptModel';

const executor = (client?: QueryExecutor): QueryExecutor => client ?? { query };

export const attemptRepository = {
  async findForStudent(examId: number, studentId: number, client?: QueryExecutor): Promise<AttemptRecord | null> {
    const result = await executor(client).query<AttemptRecord>(
      'SELECT * FROM attempts WHERE exam_id=$1 AND student_id=$2 LIMIT 1',
      [examId, studentId]
    );
    return result.rows[0] ?? null;
  },
  async create(examId: number, studentId: number, client?: QueryExecutor): Promise<AttemptRecord> {
    const result = await executor(client).query<AttemptRecord>(
      'INSERT INTO attempts(exam_id,student_id) VALUES($1,$2) RETURNING *',
      [examId, studentId]
    );
    return result.rows[0];
  },
  async submit(id: number, score: number, maxScore: number, percentage: number, client?: QueryExecutor): Promise<AttemptRecord> {
    const result = await executor(client).query<AttemptRecord>(
      'UPDATE attempts SET submitted_at=NOW(),score=$1,max_score=$2,percentage=$3 WHERE id=$4 AND submitted_at IS NULL RETURNING *',
      [score, maxScore, percentage, id]
    );
    return result.rows[0];
  },
  async findById(id: number, client?: QueryExecutor): Promise<AttemptRecord | null> {
    const result = await executor(client).query<AttemptRecord>('SELECT * FROM attempts WHERE id=$1 LIMIT 1', [id]);
    return result.rows[0] ?? null;
  },
  async listByStudent(studentId: number, client?: QueryExecutor): Promise<AttemptRecord[]> {
    const result = await executor(client).query<AttemptRecord>(
      'SELECT * FROM attempts WHERE student_id=$1 ORDER BY submitted_at DESC NULLS LAST, started_at DESC',
      [studentId]
    );
    return result.rows;
  }
};
