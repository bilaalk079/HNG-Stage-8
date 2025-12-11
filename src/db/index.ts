import * as schema from './schema'
import { drizzle } from 'drizzle-orm/node-postgres';
import * as dotenv from 'dotenv'

dotenv.config()
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new    Error("Internal Server Error");
}

export const db = drizzle(DATABASE_URL, {
  schema: schema
});