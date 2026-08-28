import { Request } from 'express';
import { AppError } from '../errors/appError';
import { arrayOfPositiveIntegers, emailValue, requiredString } from '../utils/validationUtils';

const passwordValue = (value: unknown): string => {
  const password = requiredString(value, 'password', 200);
  if (password.length < 8) throw new AppError('password doit contenir au moins 8 caractères', 400);
  return password;
};

export const studentValidator = {
  create(request: Request): void {
    requiredString(request.body?.name, 'name', 120);
    emailValue(request.body?.email);
    passwordValue(request.body?.password);
    arrayOfPositiveIntegers(request.body?.groupIds ?? [], 'groupIds');
  },
  update(request: Request): void {
    requiredString(request.body?.name, 'name', 120);
    emailValue(request.body?.email);
    arrayOfPositiveIntegers(request.body?.groupIds ?? [], 'groupIds');
  }
};
