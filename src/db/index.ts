import * as schema from './schema'
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'Stage9',
  user: 'postgres',
  password: '', 
});

export const db = drizzle(pool, { schema: schema });