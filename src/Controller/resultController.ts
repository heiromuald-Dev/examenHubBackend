import { Request, Response } from 'express';
import { resultService } from '../Service/resultService';
import { parseId } from '../utils/validationUtils';
import { asyncHandler } from '../utils/asyncHandler';
export const resultController={adminSummary:asyncHandler(async(req:Request,res:Response)=>res.json({data:await resultService.adminSummary(parseId(req.params.examId,'examId'))})),studentResults:asyncHandler(async(req:Request,res:Response)=>res.json({data:await resultService.listForStudent(req.user!.id)})),correction:asyncHandler(async(req:Request,res:Response)=>res.json({data:await resultService.correction(parseId(req.params.attemptId,'attemptId'),req.user!.id)}))};
