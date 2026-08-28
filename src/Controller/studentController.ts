import { Request, Response } from 'express';
import { parseId, arrayOfPositiveIntegers } from '../utils/validationUtils';
import { studentService } from '../Service/studentService';
import { asyncHandler } from '../utils/asyncHandler';
export const studentController={
  list:asyncHandler(async(_req:Request,res:Response)=>res.json({data:await studentService.list()})),
  detail:asyncHandler(async(req:Request,res:Response)=>res.json({data:await studentService.getDetail(parseId(req.params.id))})),
  create:asyncHandler(async(req:Request,res:Response)=>res.status(201).json({data:await studentService.create({name:req.body.name,email:req.body.email,password:req.body.password,groupIds:arrayOfPositiveIntegers(req.body.groupIds??[],'groupIds')})})),
  update:asyncHandler(async(req:Request,res:Response)=>res.json({data:await studentService.update(parseId(req.params.id),{name:req.body.name,email:req.body.email,groupIds:arrayOfPositiveIntegers(req.body.groupIds??[],'groupIds')})})),
  deactivate:asyncHandler(async(req:Request,res:Response)=>res.json({data:await studentService.deactivate(parseId(req.params.id))}))
};
