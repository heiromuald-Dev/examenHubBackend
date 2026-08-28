import { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/appError';
import { errorMessage } from '../utils/errorUtils';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next): void => {
  if (error?.type === 'entity.parse.failed') {
    response.status(400).json({ message: 'Corps JSON invalide' });
    return;
  }
  if (error?.code === '23505') {
    response.status(409).json({ message: 'Cette ressource existe déjà ou cette opération est déjà réalisée' });
    return;
  }
  if (error?.code === '23503') {
    response.status(409).json({ message: 'Cette ressource est encore utilisée ou référence une ressource inexistante' });
    return;
  }
  if (error?.code === 'P0001') {
    response.status(409).json({ message: errorMessage(error) });
    return;
  }
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  response.status(statusCode).json({ message: statusCode === 500 ? 'Erreur interne du serveur' : errorMessage(error) });
};
