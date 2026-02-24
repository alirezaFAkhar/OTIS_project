import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateOTP } from '@/lib/auth';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';
import { z } from 'zod';
import sql from 'mssql';

const forgotPasswordSchema = z.object({
  username: z.string().min(1, 'نام کاربری الزامی است'),
  phone: z.string().regex(/^09\d{9}$/, 'شماره تلفن معتبر نیست'),
});

function safeColumnName(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value) ? value : fallback;
}

export async function POST(request: NextRequest) {
  let connection: any = null;
  try {
    const body = await request.json();
    const { username, phone } = forgotPasswordSchema.parse(body);

    // Convert username to string in case it's a number
    const usernameStr = String(username).trim();
    const phoneStr = String(phone).trim();

    const tenantInfo = await getTenantFromHeaders(request);
    if (!tenantInfo) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }
    
    const tenantId = tenantInfo.tenantId;

    // Get column names from environment variables
    const tableName = safeColumnName(process.env.MEMBERS_TABLE, 'Members');
    const usernameColumn = safeColumnName(process.env.MEMBERS_USERNAME_COLUMN, 'Username');
    const phoneColumn = safeColumnName(process.env.MEMBERS_PHONE_COLUMN, 'PhoneNo');

    console.log('Forgot password request:', {
      username: usernameStr,
      phone: phoneStr,
      tableName,
      usernameColumn,
      phoneColumn,
      tenantId,
    });

    // Get database client type
    const dbClient = (process.env.DB_CLIENT || 'mysql').toLowerCase();
    let rows: any[];

    if (dbClient === 'mssql') {
      // MSSQL query
      try {
        if (!pool.connected) {
          await pool.connect();
        }
        const query = `SELECT * FROM ${tableName} WHERE ${usernameColumn} = @username AND ${phoneColumn} = @phone`;
        console.log('MSSQL Query:', query);
        console.log('Query params:', { username: usernameStr, phone: phoneStr });
        
        const result = await pool.request()
          .input('username', sql.NVarChar, usernameStr)
          .input('phone', sql.NVarChar, phoneStr)
          .query(query);
        rows = result.recordset;
        console.log('MSSQL Query result:', { rowCount: rows.length, firstRow: rows[0] });
      } catch (connError: any) {
        console.error('MSSQL connection/query error:', {
          message: connError.message,
          code: connError.code,
          number: connError.number,
          originalError: connError.originalError,
          stack: connError.stack,
        });
        if (connError.code === 'ECONNREFUSED' || connError.code === 'ETIMEDOUT' || connError.code === 'ENOTFOUND') {
          return NextResponse.json(
            { error: 'خطا در اتصال به دیتابیس. لطفا تنظیمات دیتابیس را بررسی کنید.' },
            { status: 503 }
          );
        }
        throw connError;
      }
    } else {
      // MySQL query
      try {
        connection = await pool.getConnection();
        const query = `SELECT * FROM ${tableName} WHERE ${usernameColumn} = ? AND ${phoneColumn} = ?`;
        console.log('MySQL Query:', query);
        console.log('Query params:', [usernameStr, phoneStr]);
        
        const [mysqlRows] = await connection.query(query, [usernameStr, phoneStr]) as any[];
        rows = mysqlRows;
        console.log('MySQL Query result:', { rowCount: rows.length, firstRow: rows[0] });
        connection.release();
      } catch (connError: any) {
        console.error('MySQL connection/query error:', {
          message: connError.message,
          code: connError.code,
          errno: connError.errno,
          sqlState: connError.sqlState,
          sqlMessage: connError.sqlMessage,
          stack: connError.stack,
        });
        if (connection && typeof connection.release === 'function') {
          connection.release();
        }
        if (connError.code === 'ECONNREFUSED' || connError.code === 'ETIMEDOUT' || connError.code === 'ENOTFOUND') {
          return NextResponse.json(
            { error: 'خطا در اتصال به دیتابیس. لطفا تنظیمات دیتابیس را بررسی کنید.' },
            { status: 503 }
          );
        }
        throw connError;
      }
    }

    // Check if member exists
    if (!rows.length) {
      return NextResponse.json(
        { error: 'نام کاربری یا شماره تلفن اشتباه است' },
        { status: 404 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to otp_codes table
    try {
      if (dbClient === 'mssql') {
        await pool.request()
          .input('tenant_id', sql.Int, tenantId)
          .input('phone', sql.NVarChar, phoneStr)
          .input('code', sql.NVarChar, otp)
          .input('expires_at', sql.DateTime2, expiresAt)
          .query(`INSERT INTO otp_codes (tenant_id, phone, code, expires_at) VALUES (@tenant_id, @phone, @code, @expires_at)`);
        console.log('OTP saved to database (MSSQL)');
      } else {
        if (!connection) {
          connection = await pool.getConnection();
        }
        await connection.query(
          'INSERT INTO otp_codes (tenant_id, phone, code, expires_at) VALUES (?, ?, ?, ?)',
          [tenantId, phoneStr, otp, expiresAt]
        );
        console.log('OTP saved to database (MySQL)');
        connection.release();
      }
    } catch (otpError: any) {
      console.error('Error saving OTP:', {
        message: otpError.message,
        code: otpError.code,
        errno: otpError.errno,
        sqlState: otpError.sqlState,
        sqlMessage: otpError.sqlMessage,
      });
      if (connection && typeof connection.release === 'function') {
        connection.release();
      }
      // If OTP table doesn't exist or has issues, we can still proceed
      // but log the error for debugging
      console.warn('Could not save OTP to database, but continuing...', otpError.message);
    }

    // In production, send OTP via SMS service
    console.log(`OTP for password reset ${phoneStr}: ${otp}`);

    return NextResponse.json({
      message: 'کد تایید ارسال شد',
      phone: phoneStr,
    });
  } catch (error: any) {
    // Release connection if it was acquired
    if (connection && typeof connection.release === 'function') {
      connection.release();
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      console.error('Database connection error:', error.message);
      return NextResponse.json(
        { error: 'خطا در اتصال به دیتابیس. لطفا تنظیمات دیتابیس را بررسی کنید.' },
        { status: 503 }
      );
    }

    // Log the full error for debugging
    console.error('Forgot password error:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      number: error.number,
      originalError: error.originalError || error,
    });

    // Return more detailed error message in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `خطا در بازیابی رمز عبور: ${error.message || 'خطای نامشخص'}`
      : 'خطا در بازیابی رمز عبور';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}



