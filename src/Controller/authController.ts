import { Request, Response } from 'express';
import { authService } from '../Service/authService';
import { asyncHandler } from '../utils/asyncHandler';
export const authController={
  login:asyncHandler(async(req:Request,res:Response)=>{res.status(200).json(await authService.login(req.body.email,req.body.password));}),
  me:asyncHandler(async(req:Request,res:Response)=>{res.json({user:await authService.me(req.user!.id)});}),
  updateProfile:asyncHandler(async(req:Request,res:Response)=>{res.json({user:await authService.updateProfile(req.user!.id,req.body.name,req.body.email)});}),
  changePassword:asyncHandler(async(req:Request,res:Response)=>{await authService.changePassword(req.user!.id,req.body.currentPassword,req.body.newPassword);res.json({message:'Mot de passe modifié avec succès'});})
};
