import { Request, Response } from 'express';
import { groupService } from '../Service/groupService';
import { parseId } from '../utils/validationUtils';
import { asyncHandler } from '../utils/asyncHandler';
export const groupController={list:asyncHandler(async(_req:Request,res:Response)=>res.json({data:await groupService.list()})),create:asyncHandler(async(req:Request,res:Response)=>res.status(201).json({data:await groupService.create({code:req.body.code,name:req.body.name})})),update:asyncHandler(async(req:Request,res:Response)=>res.json({data:await groupService.update(parseId(req.params.id),{code:req.body.code,name:req.body.name})})),remove:asyncHandler(async(req:Request,res:Response)=>{await groupService.remove(parseId(req.params.id));res.status(204).send();})};
