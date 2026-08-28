import { AppError } from '../errors/appError';
import { groupRepository } from '../Repositorie/groupRepository';
export const groupService={list:()=>groupRepository.list(),create:(input:{code:string;name:string})=>groupRepository.create(input),update:async(id:number,input:{code:string;name:string})=>{const result=await groupRepository.update(id,input);if(!result)throw new AppError('Groupe introuvable',404);return result;},remove:async(id:number)=>{const result=await groupRepository.findById(id);if(!result)throw new AppError('Groupe introuvable',404);await groupRepository.remove(id);}};
