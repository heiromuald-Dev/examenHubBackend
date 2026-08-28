import { Request } from 'express';
import { AppError } from '../errors/appError';
import { positiveInteger, requiredString } from '../utils/validationUtils';

const validate = (request: Request): void => {
  requiredString(request.body?.prompt, 'prompt', 5000);
  const points = Number(request.body?.points);
  if (!Number.isFinite(points) || points <= 0 || points > 1000) throw new AppError('points doit être un nombre positif inférieur ou égal à 1000', 400);
  positiveInteger(request.body?.position, 'position');
  const choices = request.body?.choices;
  if (!Array.isArray(choices) || choices.length < 2 || choices.length > 6) throw new AppError('choices doit contenir entre 2 et 6 éléments', 400);
  if (choices.filter((choice: any) => choice?.isCorrect === true).length !== 1) throw new AppError('choices doit contenir exactement une bonne réponse', 400);
  const positions = new Set<number>();
  for (const choice of choices) {
    requiredString(choice?.label, 'label', 2000);
    const choicePosition = positiveInteger(choice?.position, 'choice.position');
    if (positions.has(choicePosition)) throw new AppError('Les positions des choix doivent être uniques', 400);
    positions.add(choicePosition);
  }
};

export const questionValidator = {
  create: validate,
  update: validate
};
