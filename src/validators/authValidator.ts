import { Request } from 'express';
import { AppError } from '../errors/appError';
import { emailValue, requiredString } from '../utils/validationUtils';

const passwordValue = (value: unknown, fieldName: string): string => {
  const password = requiredString(value, fieldName, 200);
  if (password.length < 8) throw new AppError(`${fieldName} doit contenir au moins 8 caractères`, 400);
  return password;
};

export const authValidator = {
  login(request: Request): void {
    emailValue(request.body?.email);
    requiredString(request.body?.password, 'password', 200);
  },
  profile(request: Request): void {
    requiredString(request.body?.name, 'name', 120);
    emailValue(request.body?.email);
  },
  password(request: Request): void {
    requiredString(request.body?.currentPassword, 'currentPassword', 200);
    passwordValue(request.body?.newPassword, 'newPassword');
  }
};
