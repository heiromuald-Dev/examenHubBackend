import { describe, expect, it } from 'vitest';
import { hashPassword, comparePassword } from '../src/Security/passwordUtils';
import { generateToken, verifyToken } from '../src/Security/jwtUtils';
describe('security',()=>{it('hashes and verifies a password',async()=>{const hash=await hashPassword('Password123!');expect(await comparePassword('Password123!',hash)).toBe(true);expect(await comparePassword('wrong',hash)).toBe(false);});it('creates and verifies a JWT',()=>{const payload={sub:'1',email:'admin@test.local',role:'admin' as const};expect(verifyToken(generateToken(payload))).toMatchObject(payload);});});
