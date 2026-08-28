import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { query, closePool } from '../src/configuration/database';
const main=async()=>{const sql=await readFile(resolve(process.cwd(),'database/migrations/createInitialDatabaseSchema.sql'),'utf8');await query(sql);process.stdout.write('Schéma PostgreSQL appliqué\n');};
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await closePool();});
