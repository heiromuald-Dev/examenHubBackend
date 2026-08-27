import { PublicUser, UserRecord } from '../types/userTypes';

export const toPublicUser = (user: UserRecord): PublicUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.is_active
});
