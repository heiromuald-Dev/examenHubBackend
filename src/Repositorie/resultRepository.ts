import { query, QueryExecutor } from '../configuration/database';

const executor = (client?: QueryExecutor): QueryExecutor => client ?? { query };

export const resultRepository = {
  async listByStudent(studentId: number, client?: QueryExecutor) {
    const result = await executor(client).query(
      `SELECT a.id AS attempt_id,
              a.exam_id,
              e.title,
              a.started_at,
              a.submitted_at,
              a.score,
              a.max_score,
              a.percentage
       FROM attempts a
       JOIN exams e ON e.id = a.exam_id
       WHERE a.student_id=$1
       ORDER BY a.submitted_at DESC NULLS LAST, a.started_at DESC`,
      [studentId]
    );
    return result.rows;
  },
  async correction(attemptId: number, client?: QueryExecutor) {
    const result = await executor(client).query(
      `SELECT q.id AS question_id,
              q.prompt,
              q.points,
              c.id AS correct_choice_id,
              c.label AS correct_choice_label,
              sa.choice_id AS selected_choice_id,
              sc.label AS selected_choice_label,
              CASE WHEN sa.choice_id IS NOT NULL AND sa.choice_id=c.id THEN TRUE ELSE FALSE END AS is_correct
       FROM attempts a
       JOIN questions q ON q.exam_id=a.exam_id
       LEFT JOIN choices c ON c.question_id=q.id AND c.is_correct=TRUE
       LEFT JOIN answers sa ON sa.attempt_id=a.id AND sa.question_id=q.id
       LEFT JOIN choices sc ON sc.id=sa.choice_id
       WHERE a.id=$1
       ORDER BY q.position`,
      [attemptId]
    );
    return result.rows;
  },
  async adminSummary(examId: number, client?: QueryExecutor) {
    const result = await executor(client).query(
      `SELECT e.id AS exam_id,
              e.title,
              COUNT(a.id)::INTEGER AS attempt_count,
              COALESCE(ROUND(AVG(a.score),2),0) AS average_score,
              COALESCE(ROUND(AVG(a.percentage),2),0) AS average_percentage
       FROM exams e
       LEFT JOIN attempts a ON a.exam_id=e.id
       WHERE e.id=$1
       GROUP BY e.id,e.title`,
      [examId]
    );
    return result.rows[0] ?? null;
  },
  async adminResults(examId: number, client?: QueryExecutor) {
    const result = await executor(client).query(
      `SELECT a.id AS attempt_id,
              u.id AS student_id,
              u.name AS student_name,
              u.email AS student_email,
              a.started_at,
              a.submitted_at,
              a.score,
              a.max_score,
              a.percentage
       FROM attempts a
       JOIN users u ON u.id=a.student_id
       WHERE a.exam_id=$1
       ORDER BY u.name,a.submitted_at DESC NULLS LAST`,
      [examId]
    );
    return result.rows;
  },
  async studentProfileResults(studentId: number, client?: QueryExecutor) {
    const result = await executor(client).query(
      `SELECT a.id AS attempt_id,
              a.exam_id,
              e.title,
              a.submitted_at,
              a.score,
              a.max_score,
              a.percentage
       FROM attempts a
       JOIN exams e ON e.id=a.exam_id
       WHERE a.student_id=$1
       ORDER BY a.submitted_at DESC NULLS LAST, a.started_at DESC`,
      [studentId]
    );
    return result.rows;
  }
};
