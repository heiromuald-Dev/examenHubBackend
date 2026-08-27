import { Request, Response } from 'express';
import { examService } from '../Service/examService';
import { parseId, arrayOfPositiveIntegers } from '../utils/validationUtils';
import { asyncHandler } from '../utils/asyncHandler';
const input=(body:any)=>({courseId:parseId(body.courseId,'courseId'),title:body.title,description:body.description??null,durationMinutes:parseId(body.durationMinutes,'durationMinutes'),startsAt:body.startsAt,endsAt:body.endsAt,groupIds:arrayOfPositiveIntegers(body.groupIds??[],'groupIds')});
export const examController={list:asyncHandler(async(_req:Request,res:Response)=>res.json({data:await examService.list()})),get:asyncHandler(async(req:Request,res:Response)=>res.json({data:await examService.get(parseId(req.params.id))})),create:asyncHandler(async(req:Request,res:Response)=>res.status(201).json({data:await examService.create(input(req.body),req.user!.id)})),update:asyncHandler(async(req:Request,res:Response)=>res.json({data:await examService.update(parseId(req.params.id),input(req.body))})),remove:asyncHandler(async(req:Request,res:Response)=>{await examService.remove(parseId(req.params.id));res.status(204).send();})};
