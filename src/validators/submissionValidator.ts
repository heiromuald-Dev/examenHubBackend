import { Request } from 'express';
import { AppError } from '../errors/appError';
import { positiveInteger } from '../utils/validationUtils';

export const submissionValidator = {
  submit(request: Request): void {
    const answers = request.body?.answers;
    if (!Array.isArray(answers)) throw new AppError('answers doit être un tableau', 400);
    const questionIds = new Set<number>();
    for (const answer of answers) {
      const questionId = positiveInteger(answer?.questionId, 'questionId');
      if (questionIds.has(questionId)) throw new AppError('Une question ne peut apparaître qu’une seule fois', 400);
      questionIds.add(questionId);
      if (answer?.choiceId !== undefined && answer?.choiceId !== null) positiveInteger(answer.choiceId, 'choiceId');
    }
  }
};
