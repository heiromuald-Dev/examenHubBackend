import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../configuration/env';
import { AppError } from '../errors/appError';
import { JwtPayload } from '../types/authTypes';

export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  if (!env.jwtSecret || env.jwtSecret.length < 32) throw new AppError('JWT_SECRET mal configuré', 500);
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] });
};

export const verifyToken = (token: string): JwtPayload => {
  if (!env.jwtSecret || env.jwtSecret.length < 32) throw new AppError('JWT_SECRET mal configuré', 500);
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (typeof payload !== 'object' || !payload.sub || !payload.email || !payload.role) throw new Error('Payload invalide');
    if (payload.role !== 'admin' && payload.role !== 'student') throw new Error('Rôle invalide');
    return payload as JwtPayload;
  } catch {
    throw new AppError('Token invalide ou expiré', 401);
  }
};
