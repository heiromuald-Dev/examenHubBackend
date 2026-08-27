export interface AnswerRecord {
  id: number;
  attempt_id: number;
  question_id: number;
  choice_id: number | null;
  selected_at: Date;
}
