import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/appError';
import { UserRole } from '../types/userTypes';

export const roleMiddleware = (...roles: UserRole[]) => (request: Request, _response: Response, next: NextFunction): void => {
  if (!request.user) return next(new AppError('Authentification requise', 401));
  if (!roles.includes(request.user.role)) return next(new AppError('Accès interdit pour ce rôle', 403));
  next();
};
