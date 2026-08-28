import { AppError } from '../errors/appError';
import { hashPassword } from '../Security/passwordUtils';
import { toPublicUser } from '../Model/userModel';
import { userRepository } from '../Repositorie/userRepository';
import { groupRepository } from '../Repositorie/groupRepository';
import { resultRepository } from '../Repositorie/resultRepository';
import { withTransaction } from '../configuration/transaction';

export const studentService = {
  async list(){return (await userRepository.listStudents()).map(toPublicUser);},
  async getDetail(id:number){const user=await userRepository.findById(id);if(!user||user.role!=='student')throw new AppError('Étudiant introuvable',404);return {user:toPublicUser(user),groupIds:await groupRepository.groupIdsForStudent(id),results:await resultRepository.studentProfileResults(id)};},
  async create(input:{name:string;email:string;password:string;groupIds:number[]}){return withTransaction(async client=>{const user=await userRepository.createStudent({name:input.name,email:input.email,passwordHash:await hashPassword(input.password)},client);await groupRepository.replaceStudentGroups(user.id,input.groupIds,client);return toPublicUser(user);});},
  async update(id:number,input:{name:string;email:string;groupIds:number[]}){return withTransaction(async client=>{const user=await userRepository.updateStudent(id,{name:input.name,email:input.email},client);if(!user)throw new AppError('Étudiant introuvable',404);await groupRepository.replaceStudentGroups(id,input.groupIds,client);return toPublicUser(user);});},
  async deactivate(id:number){const user=await userRepository.deactivateStudent(id);if(!user)throw new AppError('Étudiant introuvable',404);return toPublicUser(user);}
};
