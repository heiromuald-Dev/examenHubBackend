export type UserRole = 'admin' | 'student';

export interface UserRecord {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}
