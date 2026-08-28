import type { AuthUser, JwtPayload } from '../types/authTypes';
import type { UserRole } from '../types/userTypes';

export type SecurityRole = UserRole;

export type SecurityTokenPayload = JwtPayload;

export type AuthenticatedUser = Pick<AuthUser, 'id' | 'email' | 'role'>;

export interface BearerTokenRequest {
  token: string;
}
