import { NextFunction, Request, Response } from 'express';

export type RequestValidator = (request: Request) => void;
export const validationMiddleware = (validator: RequestValidator) => (request: Request, _response: Response, next: NextFunction): void => {
  try { validator(request); next(); } catch (error) { next(error); }
};
