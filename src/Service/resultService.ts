import { AppError } from '../errors/appError';
import { attemptRepository } from '../Repositorie/attemptRepository';
import { resultRepository } from '../Repositorie/resultRepository';
export const resultService={
  listForStudent:(studentId:number)=>resultRepository.listByStudent(studentId),
  adminSummary:async(examId:number)=>{const result=await resultRepository.adminSummary(examId);if(!result)throw new AppError('Examen introuvable',404);return {...result,students:await resultRepository.adminResults(examId)};},
  correction:async(attemptId:number,studentId:number)=>{const attempt=await attemptRepository.findById(attemptId);if(!attempt||attempt.student_id!==studentId||!attempt.submitted_at)throw new AppError('Résultat introuvable',404);return {attempt,correction:await resultRepository.correction(attemptId)};}
};
