import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';
import { z } from 'zod';
import sql from 'mssql';

const resetPasswordSchema = z.object({
  phone: z.string(),
  code: z.string().length(6, 'کد تایید باید 6 رقم باشد'),
  password: z.string().min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد'),
});

function safeColumnName(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value) ? value : fallback;
}

export async function POST(request: NextRequest) {
  let connection: any = null;
  try {
    const body = await request.json();
    const { phone, code, password } = resetPasswordSchema.parse(body);

    const tenantInfo = await getTenantFromHeaders(request);
    if (!tenantInfo) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }
    
    const tenantId = tenantInfo.tenantId;

    // Get database client type
    const dbClient = (process.env.DB_CLIENT || 'mysql').toLowerCase();

    // Normalize phone number (remove spaces, ensure format)
    const phoneStr = String(phone).trim();
    const codeStr = String(code).trim();

    console.log('Reset password request:', {
      phone: phoneStr,
      code: codeStr,
      tenantId,
      codeLength: codeStr.length,
    });

    // Find valid OTP
    let otps: any[];

    if (dbClient === 'mssql') {
      try {
        if (!pool.connected) {
          await pool.connect();
        }
        const query = `SELECT * FROM otp_codes 
                      WHERE tenant_id = @tenant_id AND phone = @phone AND code = @code 
                      AND used = 0 AND expires_at > GETDATE()
                      ORDER BY created_at DESC`;
        console.log('MSSQL OTP Query:', query);
        console.log('MSSQL OTP Params:', { tenant_id: tenantId, phone: phoneStr, code: codeStr });
        
        const otpResult = await pool.request()
          .input('tenant_id', sql.Int, tenantId)
          .input('phone', sql.NVarChar, phoneStr)
          .input('code', sql.NVarChar, codeStr)
          .query(query);
        otps = otpResult.recordset;
        console.log('MSSQL OTP Result:', { count: otps.length, otps: otps });
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
      try {
        connection = await pool.getConnection();
        const query = `SELECT * FROM otp_codes 
                      WHERE tenant_id = ? AND phone = ? AND code = ? AND used = FALSE AND expires_at > NOW()
                      ORDER BY created_at DESC LIMIT 1`;
        console.log('MySQL OTP Query:', query);
        console.log('MySQL OTP Params:', [tenantId, phoneStr, codeStr]);
        
        const [mysqlOtps] = await connection.query(query, [tenantId, phoneStr, codeStr]) as any[];
        otps = mysqlOtps;
        console.log('MySQL OTP Result:', { count: otps.length, otps: otps });
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

    if (otps.length === 0) {
      // Check if OTP exists but is used or expired
      let checkOtps: any[] = [];
      if (dbClient === 'mssql') {
        const checkResult = await pool.request()
          .input('tenant_id', sql.Int, tenantId)
          .input('phone', sql.NVarChar, phoneStr)
          .input('code', sql.NVarChar, codeStr)
          .query(`SELECT *, 
                  CASE WHEN used = 1 THEN 'used' 
                       WHEN expires_at <= GETDATE() THEN 'expired'
                       ELSE 'valid' END as status
                  FROM otp_codes 
                  WHERE tenant_id = @tenant_id AND phone = @phone AND code = @code
                  ORDER BY created_at DESC`);
        checkOtps = checkResult.recordset;
      } else {
        if (!connection) {
          connection = await pool.getConnection();
        }
        const [checkResult] = await connection.query(
          `SELECT *, 
           CASE WHEN used = TRUE THEN 'used' 
                WHEN expires_at <= NOW() THEN 'expired'
                ELSE 'valid' END as status
           FROM otp_codes 
           WHERE tenant_id = ? AND phone = ? AND code = ?
           ORDER BY created_at DESC LIMIT 1`,
          [tenantId, phoneStr, codeStr]
        ) as any[];
        checkOtps = checkResult;
        connection.release();
      }
      
      console.log('OTP check result:', checkOtps);
      
      if (checkOtps.length > 0) {
        const status = checkOtps[0].status;
        if (status === 'used') {
          return NextResponse.json(
            { error: 'این کد تایید قبلاً استفاده شده است' },
            { status: 400 }
          );
        } else if (status === 'expired') {
          return NextResponse.json(
            { error: 'کد تایید منقضی شده است. لطفا کد جدید درخواست کنید' },
            { status: 400 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'کد تایید نامعتبر است. لطفا کد صحیح را وارد کنید' },
        { status: 400 }
      );
    }

    // Mark OTP as used
    if (dbClient === 'mssql') {
      await pool.request()
        .input('id', sql.Int, otps[0].id)
        .query(`UPDATE otp_codes SET used = 1 WHERE id = @id`);
    } else {
      if (!connection) {
        connection = await pool.getConnection();
      }
      await connection.query(
        'UPDATE otp_codes SET used = TRUE WHERE id = ?',
        [otps[0].id]
      );
    }

    // Get column names for Members table
    const tableName = safeColumnName(process.env.MEMBERS_TABLE, 'Members');
    const idColumn = safeColumnName(process.env.MEMBERS_ID_COLUMN, 'Id');
    const passwordColumn = safeColumnName(process.env.MEMBERS_PASSWORD_COLUMN, 'Password');
    const phoneColumn = safeColumnName(process.env.MEMBERS_PHONE_COLUMN, 'PhoneNo');

    // Update password in Members table
    const hashedPassword = await hashPassword(password);
    
    console.log('Updating password for:', {
      tableName,
      phoneColumn,
      passwordColumn,
      phone: phoneStr,
    });
    
    if (dbClient === 'mssql') {
      const updateResult = await pool.request()
        .input('password', sql.NVarChar, hashedPassword)
        .input('phone', sql.NVarChar, phoneStr)
        .query(`UPDATE ${tableName} SET ${passwordColumn} = @password WHERE ${phoneColumn} = @phone`);
      console.log('MSSQL Update result:', updateResult.rowsAffected);
    } else {
      if (!connection) {
        connection = await pool.getConnection();
      }
      const [updateResult] = await connection.query(
        `UPDATE ${tableName} SET ${passwordColumn} = ? WHERE ${phoneColumn} = ?`,
        [hashedPassword, phoneStr]
      ) as any[];
      console.log('MySQL Update result:', updateResult);
      connection.release();
    }

    return NextResponse.json({
      message: 'رمز عبور با موفقیت تغییر یافت',
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

    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'خطا در تغییر رمز عبور' },
      { status: 500 }
    );
  }
}



