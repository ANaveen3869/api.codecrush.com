import { drizzle } from 'drizzle-orm/node-postgres';
import fs from "fs";
import pg from "pg";
import { dbConfig } from '../config/dbConfig.js';
const { Pool } = pg;
const pool = new Pool({
    connectionString: dbConfig.db_url,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(`${process.cwd()}/ca.pem`).toString()
    }
});
const db = drizzle(pool);
export default db;
