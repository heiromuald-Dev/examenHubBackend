import { Request, Response } from 'express';
import { courseService } from '../Service/courseService';
import { parseId } from '../utils/validationUtils';
import { asyncHandler } from '../utils/asyncHandler';
export const courseController={list:asyncHandler(async(_req:Request,res:Response)=>res.json({data:await courseService.list()})),create:asyncHandler(async(req:Request,res:Response)=>res.status(201).json({data:await courseService.create({code:req.body.code,name:req.body.name,description:req.body.description??null})})),update:asyncHandler(async(req:Request,res:Response)=>res.json({data:await courseService.update(parseId(req.params.id),{code:req.body.code,name:req.body.name,description:req.body.description??null})})),remove:asyncHandler(async(req:Request,res:Response)=>{await courseService.remove(parseId(req.params.id));res.status(204).send();})};
