export interface ExamRecord {
  id: number;
  course_id: number;
  course_code?: string;
  course_name?: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  starts_at: Date;
  ends_at: Date;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface QuestionRecord {
  id: number;
  exam_id: number;
  prompt: string;
  points: number;
  position: number;
}

export interface ChoiceRecord {
  id: number;
  question_id: number;
  label: string;
  is_correct: boolean;
  position: number;
}

export interface PublicChoice {
  id: number;
  label: string;
  position: number;
}

export interface PublicQuestion {
  id: number;
  prompt: string;
  points: number;
  position: number;
  choices: PublicChoice[];
}

export interface AnswerInput {
  questionId: number;
  choiceId?: number | null;
}

export interface ExamInput {
  courseId: number;
  title: string;
  description?: string | null;
  durationMinutes: number;
  startsAt: string;
  endsAt: string;
  groupIds: number[];
}

export interface QuestionInput {
  prompt: string;
  points: number;
  position: number;
  choices: Array<{ label: string; isCorrect: boolean; position: number }>;
}
