export interface ApiErrorBody {
  message: string;
}

export interface ApiSuccess<T> {
  data: T;
}

export interface IdParams {
  id: string;
}

export interface ExamParams {
  examId: string;
}

export type Queryable = { query: (text: string, values?: unknown[]) => Promise<any> };
