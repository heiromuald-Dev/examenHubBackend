import { Request } from 'express';
import { optionalString, requiredString } from '../utils/validationUtils';

export const courseValidator = {
  createOrUpdate(request: Request): void {
    requiredString(request.body?.code, 'code', 30);
    requiredString(request.body?.name, 'name', 160);
    optionalString(request.body?.description, 'description', 2000);
  }
};
