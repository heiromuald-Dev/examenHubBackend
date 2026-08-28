import { AppError } from '../errors/appError';
import { withTransaction } from '../configuration/transaction';
import { examRepository } from '../Repositorie/examRepository';
import { questionRepository } from '../Repositorie/questionRepository';
import { PublicQuestion, QuestionInput } from '../types/examTypes';

const validateQuestion = (input: QuestionInput): void => {
  if (input.choices.length < 2 || input.choices.length > 6) {
    throw new AppError('Une question doit avoir entre 2 et 6 choix', 400);
  }
  if (input.choices.filter(choice => choice.isCorrect).length !== 1) {
    throw new AppError('Une question doit avoir exactement un choix correct', 400);
  }
  if (!Number.isFinite(input.points) || input.points <= 0) {
    throw new AppError('Les points doivent être positifs', 400);
  }
};

const withoutCorrectAnswers = (questions: Awaited<ReturnType<typeof questionRepository.listByExam>>): PublicQuestion[] => questions.map(question => ({
  id: question.id,
  prompt: question.prompt,
  points: Number(question.points),
  position: question.position,
  choices: question.choices.map(choice => ({ id: choice.id, label: choice.label, position: choice.position }))
}));

export const questionService = {
  async list(examId: number) {
    if (!(await examRepository.findById(examId))) throw new AppError('Examen introuvable', 404);
    return questionRepository.listByExam(examId);
  },
  async listPublic(examId: number) {
    return withoutCorrectAnswers(await questionRepository.listByExam(examId));
  },
  async create(examId: number, input: QuestionInput) {
    validateQuestion(input);
    return withTransaction(async client => {
      if (!(await examRepository.findById(examId, client))) throw new AppError('Examen introuvable', 404);
      return questionRepository.create(examId, input, client);
    });
  },
  async update(id: number, input: QuestionInput) {
    validateQuestion(input);
    return withTransaction(async client => {
      const question = await questionRepository.findById(id, client);
      if (!question) throw new AppError('Question introuvable', 404);
      return questionRepository.update(id, input, client);
    });
  },
  async remove(id: number) {
    if (!(await questionRepository.findById(id))) throw new AppError('Question introuvable', 404);
    await questionRepository.remove(id);
  }
};
