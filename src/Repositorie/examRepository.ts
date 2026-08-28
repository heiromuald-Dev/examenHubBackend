import { AppError } from '../errors/appError';
import { withTransaction } from '../configuration/transaction';
import { courseRepository } from '../Repositorie/courseRepository';
import { examRepository } from '../Repositorie/examRepository';
import { groupRepository } from '../Repositorie/groupRepository';
import { ExamInput } from '../types/examTypes';
export const examService = {
  list: () => examRepository.list(),
  get: async (id: number) => {
    const exam = await examRepository.findById(id);
    if (!exam) throw new AppError('Examen introuvable', 404);
    return {
      ...exam, groupIds:
        await groupRepository.groupIdsForExam(id)
    };
  },
  create: async (input: ExamInput, createdBy: number) => withTransaction(async client => {
    if (!(await courseRepository.findById(input.courseId, client)))
      throw new AppError('UE introuvable', 404);
    if (input.groupIds.length === 0)
      throw new AppError('Au moins un groupe est obligatoire', 400);
    const exam = await examRepository.create({
      courseId: input.courseId, title: input.title, description: input.description ?? null, durationMinutes: input.durationMinutes, startsAt:
        new Date(input.startsAt), endsAt:
        new Date(input.endsAt), createdBy
    }, client);
    await groupRepository.replaceExamGroups(exam.id, input.groupIds, client);
    return exam;
  }),
  update: async (id: number, input: ExamInput) => withTransaction(async client => {
    const exam = await examRepository.findById(id, client);
    if (!exam) throw new AppError('Examen introuvable', 404);
    if (!(await courseRepository.findById(input.courseId, client)))
      throw new AppError('UE introuvable', 404);
    const updated = await examRepository.update(id, {
      courseId: input.courseId, title: input.title, description: input.description ?? null, durationMinutes: input.durationMinutes, startsAt:
        new Date(input.startsAt), endsAt:
        new Date(input.endsAt)
    }, client);
    if (!updated) throw new AppError('Examen introuvable', 404);
    await groupRepository.replaceExamGroups(id, input.groupIds, client);
    return updated;
  }),
  remove: async (id: number) => {
    if (!(await examRepository.findById(id)))
      throw new AppError('Examen introuvable', 404);
    await examRepository.remove(id);
  },
  availableForStudent:(studentId:number)=>examRepository.listAvailableForStudent(studentId),
  availableOneForStudent: async (examId: number, studentId: number) => {
    const exam = await examRepository.findAvailableForStudent(examId, studentId);
    if (!exam) throw new AppError('Examen indisponible ou non attribué à cet étudiant', 404);
    return exam;
  }
};
