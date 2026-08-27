import { AppError } from '../errors/appError';

export const requiredString = (value: unknown, fieldName: string, maxLength = 10000): string => {
  if (typeof value !== 'string' || value.trim().length === 0) throw new AppError(`${fieldName} est obligatoire`, 400);
  const result = value.trim();
  if (result.length > maxLength) throw new AppError(`${fieldName} est trop long`, 400);
  return result;
};

export const optionalString = (value: unknown, fieldName: string, maxLength = 10000): string | null => {
  if (value === undefined || value === null || value === '') return null;
  return requiredString(value, fieldName, maxLength);
};

export const positiveInteger = (value: unknown, fieldName: string): number => {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) throw new AppError(`${fieldName} doit être un entier positif`, 400);
  return number;
};

export const parseId = (value: unknown, fieldName = 'id'): number => positiveInteger(value, fieldName);

export const emailValue = (value: unknown): string => {
  const email = requiredString(value, 'email', 320).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError('Email invalide', 400);
  return email;
};

export const arrayOfPositiveIntegers = (value: unknown, fieldName: string): number[] => {
  if (!Array.isArray(value)) throw new AppError(`${fieldName} doit être un tableau`, 400);
  const ids = value.map(item => positiveInteger(item, `${fieldName} contient un identifiant invalide`));
  return [...new Set(ids)];
};
