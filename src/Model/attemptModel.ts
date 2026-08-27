export interface AttemptRecord {
  id: number;
  exam_id: number;
  student_id: number;
  started_at: Date;
  submitted_at: Date | null;
  score: number | null;
  max_score: number | null;
  percentage: number | null;
}
