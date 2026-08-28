import { hashPassword } from '../src/Security/passwordUtils';
import { env } from '../src/configuration/env';
import { query, closePool } from '../src/configuration/database';
const main=async()=>{if(!env.adminEmail||!env.adminPassword)throw new Error('ADMIN_EMAIL et ADMIN_PASSWORD sont obligatoires');const passwordHash=await hashPassword(env.adminPassword);await query(`INSERT INTO users(name,email,password_hash,role) VALUES($1,$2,$3,'admin') ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,password_hash=EXCLUDED.password_hash,role='admin',is_active=TRUE`,[env.adminName,env.adminEmail.toLowerCase(),passwordHash]);process.stdout.write('Administrateur initial créé ou mis à jour\n');};
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await closePool();});
