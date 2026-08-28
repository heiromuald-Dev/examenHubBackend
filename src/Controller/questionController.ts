import { Request, Response } from 'express';
import { questionService } from '../Service/questionService';
import { parseId } from '../utils/validationUtils';
import { asyncHandler } from '../utils/asyncHandler';
const input = (body: any) => ({
  prompt: body.prompt, points: Number(body.points), position: parseId(body.position, 'position'), choices: body.choices
});
export const questionController = {
  list: asyncHandler(
    async (req: Request, res: Response) => res.json({
      data: await questionService.list(parseId(req.params.examId, 'examId'))
    })),
  create: asyncHandler(async (req: Request, res: Response) =>
    res.status(201).json({
      data: await questionService.create(parseId(req.params.examId, 'examId'), input(req.body))
    })),
  update: asyncHandler(async (req: Request, res: Response) => res.json({
    data: await questionService.update(parseId(req.params.id), input(req.body))
  })),
  remove: asyncHandler(async (req: Request, res: Response) => {
    await questionService.remove(parseId(req.params.id)); res.status(204).send();
  })
};
