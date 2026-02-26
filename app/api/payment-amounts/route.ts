import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import sql from 'mssql';

/**
 * Get safe column name from environment variable
 */
function safeColumnName(value: string | undefined, fallback: string): string {
  return value && value.trim() ? value.trim() : fallback;
}

/**
 * Get database client type
 */
function getDbClient(): 'mysql' | 'mssql' {
  return (process.env.DB_CLIENT || 'mysql').toLowerCase() as 'mysql' | 'mssql';
}

/**
 * Get PaymentAmounts table name from environment variable
 */
function getPaymentAmountsTableName(): string {
  return safeColumnName(process.env.PAYMENT_AMOUNTS_TABLE, 'PaymentAmounts');
}

/**
 * Get PaymentAmounts from MSSQL database
 */
async function getPaymentAmountsMSSQL(tableName: string): Promise<any[]> {
  if (!pool.connected) {
    await pool.connect();
  }

  const result = await pool
    .request()
    .query(`SELECT PaymentAmountsID, Title, PaymentAmounts, IsActive 
            FROM ${tableName} 
            WHERE IsActive = 1 
            ORDER BY PaymentAmounts ASC`);

  return result.recordset || [];
}

/**
 * Get PaymentAmounts from MySQL database
 */
async function getPaymentAmountsMySQL(tableName: string): Promise<any[]> {
  const connection = await pool.getConnection();
  try {
    const [rows] = (await connection.query(
      `SELECT PaymentAmountsID, Title, PaymentAmounts, IsActive 
       FROM ${tableName} 
       WHERE IsActive = 1 
       ORDER BY PaymentAmounts ASC`
    )) as any[];

    return rows || [];
  } finally {
    connection.release();
  }
}

/**
 * Handle database connection errors
 */
function handleDatabaseError(error: any): NextResponse | null {
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

/**
 * Format amount to Persian number string
 */
function formatAmount(amount: any): string {
  if (!amount) return '0';
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(numAmount)) return '0';
  return Math.round(numAmount).toString();
}

/**
 * Format amount label for display
 */
function formatAmountLabel(amount: string): string {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return amount;
  return numAmount.toLocaleString('fa-IR') + ' تومان';
}

/**
 * GET /api/payment-amounts
 * 
 * Get active payment amounts from PaymentAmounts table
 * 
 * Response:
 * - 200: Array of payment amount packages
 * - 503: Database connection error
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    const tableName = getPaymentAmountsTableName();
    const dbClient = getDbClient();

    let paymentAmounts: any[];

    if (dbClient === 'mssql') {
      try {
        paymentAmounts = await getPaymentAmountsMSSQL(tableName);
      } catch (connError: any) {
        console.error('MSSQL connection error:', connError);
        const dbError = handleDatabaseError(connError);
        if (dbError) {
          return dbError;
        }
        throw connError;
      }
    } else {
      // MySQL
      try {
        paymentAmounts = await getPaymentAmountsMySQL(tableName);
      } catch (connError: any) {
        console.error('MySQL connection error:', connError);
        const dbError = handleDatabaseError(connError);
        if (dbError) {
          return dbError;
        }
        throw connError;
      }
    }

    // Transform to Package format
    const packages = paymentAmounts.map((item) => {
      const amount = formatAmount(item.PaymentAmounts);
      return {
        id: String(item.PaymentAmountsID),
        amount: amount,
        label: item.Title || formatAmountLabel(amount),
      };
    });

    return NextResponse.json(packages);
  } catch (error: any) {
    // Handle database connection errors
    const dbError = handleDatabaseError(error);
    if (dbError) {
      return dbError;
    }

    // Handle other errors
    console.error('Payment amounts API error:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت بسته‌های شارژ' },
      { status: 500 }
    );
  }
}

