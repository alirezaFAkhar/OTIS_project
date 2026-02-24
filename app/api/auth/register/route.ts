import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateOTP } from '@/lib/auth';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';
import { z } from 'zod';
import sql from 'mssql';

const registerSchema = z.object({
  username: z.string().min(3, 'نام کاربری باید حداقل 3 کاراکتر باشد'),
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
    const { username, phone } = registerSchema.parse(body);
    
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

    // Get database client type
    const dbClient = (process.env.DB_CLIENT || 'mysql').toLowerCase();
    let rows: any[];

    if (dbClient === 'mssql') {
      // MSSQL query - check if member exists
      try {
        if (!pool.connected) {
          await pool.connect();
        }
        const result = await pool.request()
          .input('username', sql.NVarChar, username)
          .input('phone', sql.NVarChar, phone)
          .query(`SELECT * FROM ${tableName} WHERE ${usernameColumn} = @username AND ${phoneColumn} = @phone`);
        rows = result.recordset;
      } catch (connError: any) {
        console.error('MSSQL connection error:', connError);
        if (connError.code === 'ECONNREFUSED' || connError.code === 'ETIMEDOUT' || connError.code === 'ENOTFOUND') {
          return NextResponse.json(
            { error: 'خطا در اتصال به دیتابیس. لطفا تنظیمات دیتابیس را بررسی کنید.' },
            { status: 503 }
          );
        }
        throw connError;
      }
    } else {
      // MySQL query - check if member exists
      try {
        connection = await pool.getConnection();
        const [mysqlRows] = await connection.query(
          `SELECT * FROM ${tableName} WHERE ${usernameColumn} = ? AND ${phoneColumn} = ?`,
          [username, phone]
        ) as any[];
        rows = mysqlRows;
        connection.release();
      } catch (connError: any) {
        console.error('MySQL connection error:', connError);
        if (connection && typeof connection.release === 'function') {
          connection.release();
        }
        return NextResponse.json(
          { error: 'خطا در اتصال به دیتابیس. لطفا تنظیمات دیتابیس را بررسی کنید.' },
          { status: 503 }
        );
      }
    }

    // Check if member exists in Members table
    if (!rows.length) {
      return NextResponse.json(
        { error: 'اطلاعات شما در سیستم ثبت نشده است. لطفا ابتدا اطلاعات خود را در دیتابیس ثبت کنید.' },
        { status: 404 }
      );
    }

    // Check if user already registered in users table
    if (dbClient === 'mssql') {
      const userResult = await pool.request()
        .input('tenant_id', sql.Int, tenantId)
        .input('phone', sql.NVarChar, phone)
        .query(`SELECT id FROM users WHERE tenant_id = @tenant_id AND phone = @phone`);
      
      if (userResult.recordset.length > 0) {
        return NextResponse.json(
          { error: 'این شماره تلفن قبلا ثبت نام شده است' },
          { status: 400 }
        );
      }
    } else {
      if (!connection) {
        connection = await pool.getConnection();
      }
      const [existingUsers] = await connection.query(
        'SELECT id FROM users WHERE tenant_id = ? AND phone = ?',
        [tenantId, phone]
      ) as any[];

      if (existingUsers.length > 0) {
        connection.release();
        return NextResponse.json(
          { error: 'این شماره تلفن قبلا ثبت نام شده است' },
          { status: 400 }
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to otp_codes table
    if (dbClient === 'mssql') {
      await pool.request()
        .input('tenant_id', sql.Int, tenantId)
        .input('phone', sql.NVarChar, phone)
        .input('code', sql.NVarChar, otp)
        .input('expires_at', sql.DateTime2, expiresAt)
        .query(`INSERT INTO otp_codes (tenant_id, phone, code, expires_at) VALUES (@tenant_id, @phone, @code, @expires_at)`);
    } else {
      if (!connection) {
        connection = await pool.getConnection();
      }
      await connection.query(
        'INSERT INTO otp_codes (tenant_id, phone, code, expires_at) VALUES (?, ?, ?, ?)',
        [tenantId, phone, otp, expiresAt]
      );
      connection.release();
    }

    // In production, send OTP via SMS service
    console.log(`OTP for registration ${phone}: ${otp}`);

    return NextResponse.json({
      message: 'کد تایید ارسال شد',
      phone: phone,
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

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت نام' },
      { status: 500 }
    );
  }
}



