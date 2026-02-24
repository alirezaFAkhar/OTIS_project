import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import sql from 'mssql';

/**
 * Get safe column name from environment variable
 */
export function safeColumnName(value: string | undefined, fallback: string): string {
  return value && value.trim() ? value.trim() : fallback;
}

/**
 * Get database client type
 */
export function getDbClient(): 'mysql' | 'mssql' {
  return (process.env.DB_CLIENT || 'mysql').toLowerCase() as 'mysql' | 'mssql';
}

/**
 * Get column names from environment variables
 */
export function getColumnNames() {
  const membersIdColumn = safeColumnName(process.env.MEMBERS_ID_COLUMN, 'Id');
  
  return {
    membersTable: safeColumnName(process.env.MEMBERS_TABLE, 'Members'),
    membersIdColumn,
    membersComplexIdColumn: safeColumnName(process.env.MEMBERS_COMPLEX_ID_COLUMN, 'ComplexId'),
    complexesTable: safeColumnName(process.env.COMPLEXES_TABLE, 'Complexes'),
    complexesIdColumn: safeColumnName(process.env.COMPLEXES_ID_COLUMN, 'Id'),
    complexesNameColumn: safeColumnName(process.env.COMPLEXES_NAME_COLUMN, 'Name'),
    paymentsTable: safeColumnName(process.env.PAYMENTS_TABLE, 'Payments'),
    paymentsMemberIdColumn: safeColumnName(process.env.PAYMENTS_MEMBER_ID_COLUMN, membersIdColumn),
    paymentsAmountColumn: safeColumnName(process.env.PAYMENTS_AMOUNT_COLUMN, 'Amount'),
    paymentsDateColumn: safeColumnName(process.env.PAYMENTS_DATE_COLUMN, 'Date'),
    paymentsBalanceColumn: safeColumnName(process.env.PAYMENTS_BALANCE_COLUMN, 'BalanceAfterCharge'),
  };
}

/**
 * Get member by ID from MSSQL database
 */
export async function getMemberMSSQL(
  tableName: string,
  idColumn: string,
  userId: number
): Promise<any> {
  if (!pool.connected) {
    await pool.connect();
  }

  const result = await pool
    .request()
    .input('userId', sql.Int, userId)
    .query(`SELECT * FROM ${tableName} WHERE ${idColumn} = @userId`);

  if (result.recordset.length === 0) {
    return null;
  }

  return result.recordset[0];
}

/**
 * Get member by ID from MySQL database
 */
export async function getMemberMySQL(
  tableName: string,
  idColumn: string,
  userId: number
): Promise<any> {
  const connection = await pool.getConnection();
  try {
    const [members] = (await connection.query(
      `SELECT * FROM ${tableName} WHERE ${idColumn} = ?`,
      [userId]
    )) as any[];

    if (members.length === 0) {
      return null;
    }

    return members[0];
  } finally {
    connection.release();
  }
}

/**
 * Get complex by ID from MSSQL database
 */
export async function getComplexMSSQL(
  tableName: string,
  idColumn: string,
  nameColumn: string,
  complexId: number
): Promise<any> {
  if (!pool.connected) {
    await pool.connect();
  }

  const result = await pool
    .request()
    .input('complexId', sql.Int, complexId)
    .query(`SELECT ${idColumn}, ${nameColumn} FROM ${tableName} WHERE ${idColumn} = @complexId`);

  if (result.recordset.length === 0) {
    return null;
  }

  return result.recordset[0];
}

/**
 * Get complex by ID from MySQL database
 */
export async function getComplexMySQL(
  tableName: string,
  idColumn: string,
  nameColumn: string,
  complexId: number
): Promise<any> {
  const connection = await pool.getConnection();
  try {
    const [complexes] = (await connection.query(
      `SELECT ${idColumn}, ${nameColumn} FROM ${tableName} WHERE ${idColumn} = ?`,
      [complexId]
    )) as any[];

    if (complexes.length === 0) {
      return null;
    }

    return complexes[0];
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

