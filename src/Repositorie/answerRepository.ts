import { query, QueryExecutor } from '../configuration/database';
import { AnswerRecord } from '../Model/answerModel';
const executor = (client?: QueryExecutor): QueryExecutor => client ?? { query };
export const answerRepository = {
  async create(attemptId:number,questionId:number,choiceId:number|null,client?:QueryExecutor):Promise<AnswerRecord>{return (await executor(client).query<AnswerRecord>('INSERT INTO answers(attempt_id,question_id,choice_id) VALUES($1,$2,$3) RETURNING *',[attemptId,questionId,choiceId])).rows[0];},
  async listByAttempt(attemptId:number,client?:QueryExecutor):Promise<AnswerRecord[]>{return (await executor(client).query<AnswerRecord>('SELECT * FROM answers WHERE attempt_id=$1 ORDER BY question_id',[attemptId])).rows;}
};
