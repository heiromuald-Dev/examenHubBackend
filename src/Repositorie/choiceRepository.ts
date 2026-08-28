import { query, QueryExecutor } from '../configuration/database';
import { ChoiceRecord } from '../types/examTypes';

const executor = (client?: QueryExecutor): QueryExecutor => client ?? { query };

type ChoiceInput = {
  label: string;
  isCorrect: boolean;
  position: number;
};

export const choiceRepository = {
  async listByQuestion(questionId: number, client?: QueryExecutor): Promise<ChoiceRecord[]> {
    const result = await executor(client).query<ChoiceRecord>(
      'SELECT * FROM choices WHERE question_id=$1 ORDER BY position',
      [questionId]
    );
    return result.rows;
  },

  async listByQuestionIds(questionIds: number[], client?: QueryExecutor): Promise<ChoiceRecord[]> {
    if (questionIds.length === 0) return [];

    const result = await executor(client).query<ChoiceRecord>(
      'SELECT * FROM choices WHERE question_id = ANY($1::bigint[]) ORDER BY question_id, position',
      [questionIds]
    );
    return result.rows;
  },

  async create(
    questionId: number,
    input: ChoiceInput,
    client?: QueryExecutor
  ): Promise<ChoiceRecord> {
    const result = await executor(client).query<ChoiceRecord>(
      'INSERT INTO choices(question_id,label,is_correct,position) VALUES($1,$2,$3,$4) RETURNING *',
      [questionId, input.label, input.isCorrect, input.position]
    );
    return result.rows[0];
  },

  async createMany(
    questionId: number,
    choices: ChoiceInput[],
    client?: QueryExecutor
  ): Promise<ChoiceRecord[]> {
    const created: ChoiceRecord[] = [];

    for (const choice of choices) {
      created.push(await this.create(questionId, choice, client));
    }

    return created;
  },

  async deleteByQuestion(questionId: number, client?: QueryExecutor): Promise<void> {
    await executor(client).query(
      'DELETE FROM choices WHERE question_id=$1',
      [questionId]
    );
  }
};
