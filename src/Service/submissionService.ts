import { AppError } from '../errors/appError';
import { withTransaction } from '../configuration/transaction';
import { answerRepository } from '../Repositorie/answerRepository';
import { attemptRepository } from '../Repositorie/attemptRepository';
import { examRepository } from '../Repositorie/examRepository';
import { questionRepository } from '../Repositorie/questionRepository';
import { resultRepository } from '../Repositorie/resultRepository';
import { AnswerInput } from '../types/examTypes';
import { calculatePercentage } from '../utils/scoreUtils';

export const submissionService = {
  async start(examId: number, studentId: number) {
    try {
      return await withTransaction(async client => {
        const exam = await examRepository.findAvailableForStudent(examId, studentId, client);
        if (!exam) throw new AppError('Examen indisponible ou non attribué à cet étudiant', 404);
        const questions = await questionRepository.listByExam(examId, client);
        if (questions.length === 0) throw new AppError('Cet examen ne contient aucune question', 409);
        const existing = await attemptRepository.findForStudent(examId, studentId, client);
        if (existing) throw new AppError('Cet examen a déjà été commencé ou soumis', 409);
        const attempt = await attemptRepository.create(examId, studentId, client);
        const deadline = new Date(Math.min(Date.now() + exam.duration_minutes * 60 * 1000, new Date(exam.ends_at).getTime()));
        return {
          attemptId: attempt.id,
          examId: exam.id,
          startedAt: attempt.started_at,
          deadline,
          exam,
          questions: questions.map(question => ({
            id: question.id,
            prompt: question.prompt,
            points: Number(question.points),
            position: question.position,
            choices: question.choices.map(choice => ({ id: choice.id, label: choice.label, position: choice.position }))
          }))
        };
      });
    } catch (error: any) {
      if (error?.code === '23505') throw new AppError('Cet examen a déjà été commencé ou soumis', 409);
      throw error;
    }
  },
  async submit(attemptId: number, studentId: number, answers: AnswerInput[]) {
    return withTransaction(async client => {
      const attempt = await attemptRepository.findById(attemptId, client);
      if (!attempt || attempt.student_id !== studentId) throw new AppError('Tentative introuvable', 404);
      if (attempt.submitted_at) throw new AppError('Cet examen a déjà été soumis', 409);
      const exam = await examRepository.findById(attempt.exam_id, client);
      if (!exam) throw new AppError('Examen introuvable', 404);
      const questions = await questionRepository.listByExam(attempt.exam_id, client);
      const questionMap = new Map(questions.map(question => [question.id, question]));
      const answerMap = new Map(answers.map(answer => [answer.questionId, answer.choiceId ?? null]));
      for (const answer of answers) {
        const question = questionMap.get(answer.questionId);
        if (!question) throw new AppError('Une réponse concerne une question invalide', 400);
        if (answer.choiceId !== undefined && answer.choiceId !== null && !question.choices.some(choice => choice.id === answer.choiceId)) {
          throw new AppError('Une réponse concerne un choix invalide', 400);
        }
      }
      const deadline = new Date(Math.min(new Date(attempt.started_at).getTime() + exam.duration_minutes * 60 * 1000, new Date(exam.ends_at).getTime()));
      if (new Date() > deadline) throw new AppError('Le temps de cet examen est écoulé', 409);
      let earned = 0;
      let total = 0;
      for (const question of questions) {
        total += Number(question.points);
        const choiceId = answerMap.get(question.id) ?? null;
        const selectedChoice = question.choices.find(choice => choice.id === choiceId);
        if (selectedChoice?.is_correct) earned += Number(question.points);
        await answerRepository.create(attempt.id, question.id, choiceId, client);
      }
      const percentage = calculatePercentage(earned, total);
      const submitted = await attemptRepository.submit(attempt.id, earned, total, percentage, client);
      if (!submitted) throw new AppError('La tentative a déjà été soumise', 409);
      return { attempt: submitted, correction: await resultRepository.correction(attempt.id, client) };
    });
  }
};
