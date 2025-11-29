import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Check if we are in production (Render) or development (Local)
const isProduction = process.env.NODE_ENV === 'production';

// Render provides a single long "DATABASE_URL" string. 
// Locally, you might still use DB_HOST, DB_USER, etc.
const connectionString = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL 
  : `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`;

export const pool = new Pool({
  connectionString,
  //  Render requires SSL. We enable it only for production.
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});