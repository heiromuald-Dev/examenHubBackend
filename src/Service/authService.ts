import { AppError } from '../errors/appError';
import { generateToken } from '../Security/jwtUtils';
import { comparePassword, hashPassword } from '../Security/passwordUtils';
import { toPublicUser } from '../Model/userModel';
import { userRepository } from '../Repositorie/userRepository';
import { AuthUser } from '../types/authTypes';

export const authService = {
  async login(email:string,password:string){
    const user=await userRepository.findByEmail(email); if(!user) throw new AppError('Identifiants invalides',401);
    if(!user.is_active) throw new AppError('Ce compte est désactivé',403);
    if(!(await comparePassword(password,user.password_hash))) throw new AppError('Identifiants invalides',401);
    const publicUser=toPublicUser(user); const token=generateToken({sub:String(user.id),email:user.email,role:user.role}); return {token,user:publicUser};
  },
  async me(userId:number):Promise<AuthUser>{const user=await userRepository.findById(userId);if(!user||!user.is_active)throw new AppError('Utilisateur introuvable',404);return toPublicUser(user);},
  async updateProfile(userId:number,name:string,email:string){const user=await userRepository.updateProfile(userId,name,email);if(!user)throw new AppError('Utilisateur introuvable',404);return toPublicUser(user);},
  async changePassword(userId:number,currentPassword:string,newPassword:string){const user=await userRepository.findById(userId);if(!user)throw new AppError('Utilisateur introuvable',404);if(!(await comparePassword(currentPassword,user.password_hash)))throw new AppError('Mot de passe actuel incorrect',400);await userRepository.updatePassword(userId,await hashPassword(newPassword));}
};
