import { Request, Response } from 'express';
import { examService } from '../Service/examService';
import { questionService } from '../Service/questionService';
import { resultService } from '../Service/resultService';
import { submissionService } from '../Service/submissionService';
import { parseId } from '../utils/validationUtils';
import { asyncHandler } from '../utils/asyncHandler';

export const myController = {
  availableExams: asyncHandler(async (request: Request, response: Response) => {
    response.json({ data: await examService.availableForStudent(request.user!.id) });
  }),
  examDetail: asyncHandler(async (request: Request, response: Response) => {
    const examId = parseId(request.params.examId, 'examId');
    const exam = await examService.availableOneForStudent(examId, request.user!.id);
    response.json({ data: { ...exam, questions: await questionService.listPublic(examId) } });
  }),
  startExam: asyncHandler(async (request: Request, response: Response) => {
    response.status(201).json({ data: await submissionService.start(parseId(request.params.examId, 'examId'), request.user!.id) });
  }),
  submitExam: asyncHandler(async (request: Request, response: Response) => {
    response.json({ data: await submissionService.submit(parseId(request.params.attemptId, 'attemptId'), request.user!.id, request.body.answers ?? []) });
  }),
  results: asyncHandler(async (request: Request, response: Response) => {
    response.json({ data: await resultService.listForStudent(request.user!.id) });
  }),
  correction: asyncHandler(async (request: Request, response: Response) => {
    response.json({ data: await resultService.correction(parseId(request.params.attemptId, 'attemptId'), request.user!.id) });
  })
};
