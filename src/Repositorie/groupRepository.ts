import { query, QueryExecutor } from '../configuration/database';
import { GroupRecord } from '../Model/groupModel';
const executor = (client?: QueryExecutor): QueryExecutor => client ?? { query };
export const groupRepository = {
  async list(client?: QueryExecutor): Promise<GroupRecord[]> { return (await executor(client).query<GroupRecord>('SELECT * FROM groups ORDER BY code')).rows; },
  async findById(id: number, client?: QueryExecutor): Promise<GroupRecord | null> { return (await executor(client).query<GroupRecord>('SELECT * FROM groups WHERE id=$1', [id])).rows[0] ?? null; },
  async create(input: { code: string; name: string }, client?: QueryExecutor): Promise<GroupRecord> { return (await executor(client).query<GroupRecord>('INSERT INTO groups(code,name) VALUES($1,$2) RETURNING *', [input.code,input.name])).rows[0]; },
  async update(id: number, input: { code: string; name: string }, client?: QueryExecutor): Promise<GroupRecord | null> { return (await executor(client).query<GroupRecord>('UPDATE groups SET code=$1,name=$2 WHERE id=$3 RETURNING *', [input.code,input.name,id])).rows[0] ?? null; },
  async remove(id: number, client?: QueryExecutor): Promise<void> { await executor(client).query('DELETE FROM groups WHERE id=$1', [id]); },
  async replaceStudentGroups(studentId: number, groupIds: number[], client?: QueryExecutor): Promise<void> {
    const db = executor(client);
    await db.query('DELETE FROM student_groups WHERE student_id=$1', [studentId]);
    for (const groupId of groupIds) await db.query('INSERT INTO student_groups(student_id,group_id) VALUES($1,$2)', [studentId, groupId]);
  },
  async replaceExamGroups(examId: number, groupIds: number[], client?: QueryExecutor): Promise<void> {
    const db = executor(client);
    await db.query('DELETE FROM exam_groups WHERE exam_id=$1', [examId]);
    for (const groupId of groupIds) await db.query('INSERT INTO exam_groups(exam_id,group_id) VALUES($1,$2)', [examId, groupId]);
  },
  async groupIdsForStudent(studentId: number, client?: QueryExecutor): Promise<number[]> { return (await executor(client).query<{group_id:number}>('SELECT group_id FROM student_groups WHERE student_id=$1',[studentId])).rows.map(row => row.group_id); },
  async groupIdsForExam(examId: number, client?: QueryExecutor): Promise<number[]> { return (await executor(client).query<{group_id:number}>('SELECT group_id FROM exam_groups WHERE exam_id=$1',[examId])).rows.map(row => row.group_id); }
};
