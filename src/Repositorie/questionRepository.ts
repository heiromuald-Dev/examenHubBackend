import { query, QueryExecutor } from '../configuration/database';
import { ChoiceRecord, QuestionRecord } from '../types/examTypes';
const executor = (client?: QueryExecutor): QueryExecutor => client ?? { query };
export const questionRepository = {
  async listByExam(examId:number, client?:QueryExecutor):Promise<Array<QuestionRecord & { choices: ChoiceRecord[] }>> {
    const questions = (
      await executor(client).query<QuestionRecord>('SELECT * FROM questions WHERE exam_id=$1 ORDER BY position', [examId])).rows;
    const choices = (
      await executor(client).query<ChoiceRecord>('SELECT * FROM choices WHERE question_id = ANY($1::bigint[]) ORDER BY question_id,position',
        [questions.map(q => q.id)])).rows;
    return questions.map(q=>({...q,choices:choices.filter(c=>c.question_id===q.id)}));
  },
  async findById(id: number, client?: QueryExecutor): Promise<QuestionRecord | null>{
    return (await executor(client).query<QuestionRecord>(
      'SELECT * FROM questions WHERE id=$1',
      [id])).rows[0] ?? null;
  },
  async create(examId: number, input: {
    prompt: string; points: number; position: number; choices: Array<{
      label: string; isCorrect: boolean; position: number
    }>
  }, client?: QueryExecutor): Promise<QuestionRecord>{
    const db = executor(client);
    const question = (
      await db.query<QuestionRecord>(
        'INSERT INTO questions(exam_id,prompt,points,position) VALUES($1,$2,$3,$4) RETURNING *',
        [examId, input.prompt, input.points, input.position])).rows[0];
    for (const choice of input.choices)
      await db.query(
        'INSERT INTO choices(question_id,label,is_correct,position) VALUES($1,$2,$3,$4)',
        [question.id, choice.label, choice.isCorrect, choice.position]);
    return question;
  },
  async update(id: number, input: {
    prompt: string; points: number; position: number; choices: Array<{
      label: string; isCorrect: boolean; position: number
    }>
  }, client?: QueryExecutor): Promise<QuestionRecord | null>{
    const db = executor(client);
    const question = (
      await db.query<QuestionRecord>(
        'UPDATE questions SET prompt=$1,points=$2,position=$3 WHERE id=$4 RETURNING *',
        [input.prompt, input.points, input.position, id])).rows[0] ?? null;
    if (!question)
      return null;
    await db.query(
      'DELETE FROM choices WHERE question_id=$1', [id]);
    for (const choice of input.choices)
      await db.query(
        'INSERT INTO choices(question_id,label,is_correct,position) VALUES($1,$2,$3,$4)',
        [id, choice.label, choice.isCorrect, choice.position]);
    return question;
  },
  async remove(id: number, client?: QueryExecutor): Promise<void>{
    await executor(client).query('DELETE FROM questions WHERE id=$1', [id]);
  }
};