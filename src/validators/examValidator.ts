import { Request } from 'express';
import { AppError } from '../errors/appError';
import { arrayOfPositiveIntegers, optionalString, positiveInteger, requiredString } from '../utils/validationUtils';

const dateValue = (value: unknown, fieldName: string): Date => {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
    throw new AppError(`${fieldName} doit être une date ISO valide`, 400);
  }
  return new Date(value);
};

const validate = (request: Request): void => {
  requiredString(request.body?.title, 'title', 180);
  optionalString(request.body?.description, 'description', 4000);
  positiveInteger(request.body?.courseId, 'courseId');
  const duration = positiveInteger(request.body?.durationMinutes, 'durationMinutes');
  if (duration > 480) throw new AppError('durationMinutes ne peut pas dépasser 480 minutes', 400);
  const startsAt = dateValue(request.body?.startsAt, 'startsAt');
  const endsAt = dateValue(request.body?.endsAt, 'endsAt');
  if (startsAt >= endsAt) throw new AppError('startsAt doit être antérieure à endsAt', 400);
  const groups = arrayOfPositiveIntegers(request.body?.groupIds, 'groupIds');
  if (groups.length === 0) throw new AppError('groupIds doit contenir au moins un groupe', 400);
};

export const examValidator = {
  create: validate,
  update: validate
};
