import { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/appError';
import { verifyToken } from '../Security/jwtUtils';
import { userRepository } from '../Repositorie/userRepository';
import { toPublicUser } from '../Model/userModel';

export const authMiddleware = async (request: Request, _response: Response, next: NextFunction): Promise<void> => {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new AppError('Authentification requise', 401));
  try {
    const payload = verifyToken(header.slice(7));
    const user = await userRepository.findById(Number(payload.sub));
    if (!user || !user.is_active) return next(new AppError('Compte désactivé ou introuvable', 403));
    request.user = toPublicUser(user) as Express.Request['user'];
    next();
  } catch (error) {
    next(error);
  }
};
