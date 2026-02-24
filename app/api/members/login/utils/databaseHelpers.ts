import { NextResponse } from 'next/server';
import pool from '@/lib/db';
// @ts-ignore - mssql types may not be available
import sql from 'mssql';

/**
 * Get safe column name from environment variable
 * Validates that the column name is safe for SQL injection
 */
export function safeColumnName(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value) ? value : fallback;
}

/**
 * Get database client type
 */
export function getDbClient(): 'mysql' | 'mssql' {
  return (process.env.DB_CLIENT || 'mysql').toLowerCase() as 'mysql' | 'mssql';
}

/**
 * Get member by username from MSSQL database
 */
export async function getMemberMSSQL(
  tableName: string,
  usernameColumn: string,
  username: string
): Promise<any[]> {
  // Ensure pool is connected
  if (!pool.connected) {
    await pool.connect();
  }

  const result = await pool
    .request()
    .input('username', sql.NVarChar, username)
    .query(`SELECT * FROM ${tableName} WHERE ${usernameColumn} = @username`);

  return result.recordset;
}

/**
 * Get member by username from MySQL database
 */
export async function getMemberMySQL(
  tableName: string,
  usernameColumn: string,
  username: string
): Promise<any[]> {
  const connection = await pool.getConnection();
  try {
    const [rows] = (await connection.query(
      `SELECT * FROM ${tableName} WHERE ${usernameColumn} = ?`,
      [username]
    )) as any[];
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * Handle database connection errors
 */
export function handleDatabaseError(error: any): NextResponse | null {
  if (
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT' ||
    error.code === 'ENOTFOUND'
  ) {
    return NextResponse.json(
      { error: 'خطا در اتصال به دیتابیس. لطفا تنظیمات دیتابیس را بررسی کنید.' },
      { status: 503 }
    );
  }
  return null;
}

