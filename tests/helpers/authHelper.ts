import { generateToken } from '../../src/Security/jwtUtils';
export const adminToken=()=>generateToken({sub:'1',email:'admin@test.local',role:'admin'});
export const studentToken=()=>generateToken({sub:'2',email:'student@test.local',role:'student'});
