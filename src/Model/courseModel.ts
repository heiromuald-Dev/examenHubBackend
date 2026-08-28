export interface CourseRecord {
  id: number;
  code: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}
