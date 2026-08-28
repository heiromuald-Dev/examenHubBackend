import { query, type QueryExecutor } from '../configuration/database';
import type { ExamRecord } from '../types/examTypes';

const executor = (client?: QueryExecutor): QueryExecutor => {
  return client ?? { query };
};

export const examRepository = {
  async list(client?: QueryExecutor): Promise<ExamRecord[]> {
    const result = await executor(client).query<ExamRecord>(
      `
        SELECT
          e.*,
          c.code AS course_code,
          c.name AS course_name
        FROM exams e
        INNER JOIN courses c ON c.id = e.course_id
        ORDER BY e.starts_at DESC
      `
    );

    return result.rows;
  },

  async findById(
    id: number,
    client?: QueryExecutor
  ): Promise<ExamRecord | null> {
    const result = await executor(client).query<ExamRecord>(
      `
        SELECT
          e.*,
          c.code AS course_code,
          c.name AS course_name
        FROM exams e
        INNER JOIN courses c ON c.id = e.course_id
        WHERE e.id = $1
        LIMIT 1
      `,
      [id]
    );

    return result.rows[0] ?? null;
  },

  async findAvailableForStudent(
    examId: number,
    studentId: number,
    client?: QueryExecutor
  ): Promise<ExamRecord | null> {
    const result = await executor(client).query<ExamRecord>(
      `
        SELECT DISTINCT
          e.*,
          c.code AS course_code,
          c.name AS course_name
        FROM exams e
        INNER JOIN courses c ON c.id = e.course_id
        INNER JOIN exam_groups eg ON eg.exam_id = e.id
        INNER JOIN student_groups sg ON sg.group_id = eg.group_id
        INNER JOIN users u
          ON u.id = sg.student_id
         AND u.is_active = TRUE
        WHERE e.id = $1
          AND sg.student_id = $2
          AND NOW() BETWEEN e.starts_at AND e.ends_at
        LIMIT 1
      `,
      [examId, studentId]
    );

    return result.rows[0] ?? null;
  },

  async listAvailableForStudent(
    studentId: number,
    client?: QueryExecutor
  ): Promise<ExamRecord[]> {
    const result = await executor(client).query<ExamRecord>(
      `
        SELECT DISTINCT
          e.*,
          c.code AS course_code,
          c.name AS course_name
        FROM exams e
        INNER JOIN courses c ON c.id = e.course_id
        INNER JOIN exam_groups eg ON eg.exam_id = e.id
        INNER JOIN student_groups sg ON sg.group_id = eg.group_id
        INNER JOIN users u
          ON u.id = sg.student_id
         AND u.is_active = TRUE
        WHERE sg.student_id = $1
          AND NOW() BETWEEN e.starts_at AND e.ends_at
        ORDER BY e.ends_at ASC
      `,
      [studentId]
    );

    return result.rows;
  },

  async create(
    input: {
      courseId: number;
      title: string;
      description: string | null;
      durationMinutes: number;
      startsAt: Date;
      endsAt: Date;
      createdBy: number;
    },
    client?: QueryExecutor
  ): Promise<ExamRecord> {
    const result = await executor(client).query<ExamRecord>(
      `
        INSERT INTO exams (
          course_id,
          title,
          description,
          duration_minutes,
          starts_at,
          ends_at,
          created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
      [
        input.courseId,
        input.title,
        input.description,
        input.durationMinutes,
        input.startsAt,
        input.endsAt,
        input.createdBy
      ]
    );

    const exam = result.rows[0];

    if (!exam) {
      throw new Error('La création de l’examen a échoué');
    }

    return exam;
  },

  async update(
    id: number,
    input: {
      courseId: number;
      title: string;
      description: string | null;
      durationMinutes: number;
      startsAt: Date;
      endsAt: Date;
    },
    client?: QueryExecutor
  ): Promise<ExamRecord | null> {
    const result = await executor(client).query<ExamRecord>(
      `
        UPDATE exams
        SET
          course_id = $1,
          title = $2,
          description = $3,
          duration_minutes = $4,
          starts_at = $5,
          ends_at = $6
        WHERE id = $7
        RETURNING *
      `,
      [
        input.courseId,
        input.title,
        input.description,
        input.durationMinutes,
        input.startsAt,
        input.endsAt,
        id
      ]
    );

    return result.rows[0] ?? null;
  },

  async remove(id: number, client?: QueryExecutor): Promise<void> {
    await executor(client).query(
      'DELETE FROM exams WHERE id = $1',
      [id]
    );
  }
};
