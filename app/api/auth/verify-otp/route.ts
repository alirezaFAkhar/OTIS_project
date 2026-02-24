import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateToken } from '@/lib/auth';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';
import { z } from 'zod';
import sql from 'mssql';

const verifySchema = z.object({
  phone: z.string(),
  code: z.string().length(6, 'کد تایید باید 6 رقم باشد'),
});

function safeColumnName(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value) ? value : fallback;
}

export async function POST(request: NextRequest) {
  let connection: any = null;
  try {
    const body = await request.json();
    const { phone, code } = verifySchema.parse(body);

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

    // Find valid OTP
    let otps: any[];

    if (dbClient === 'mssql') {
      try {
        if (!pool.connected) {
          await pool.connect();
        }
        const otpResult = await pool.request()
          .input('tenant_id', sql.Int, tenantId)
          .input('phone', sql.NVarChar, phone)
          .input('code', sql.NVarChar, code)
          .query(`SELECT * FROM otp_codes 
                  WHERE tenant_id = @tenant_id AND phone = @phone AND code = @code 
                  AND used = 0 AND expires_at > GETDATE()
                  ORDER BY created_at DESC`);
        otps = otpResult.recordset;
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
        const [mysqlOtps] = await connection.query(
          `SELECT * FROM otp_codes 
           WHERE tenant_id = ? AND phone = ? AND code = ? AND used = FALSE AND expires_at > NOW()
           ORDER BY created_at DESC LIMIT 1`,
          [tenantId, phone, code]
        ) as any[];
        otps = mysqlOtps;
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
      return NextResponse.json(
        { error: 'کد تایید نامعتبر یا منقضی شده است' },
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

    // Get member from Members table
    const tableName = safeColumnName(process.env.MEMBERS_TABLE, 'Members');
    const idColumn = safeColumnName(process.env.MEMBERS_ID_COLUMN, 'Id');
    const usernameColumn = safeColumnName(process.env.MEMBERS_USERNAME_COLUMN, 'Username');
    const phoneColumn = safeColumnName(process.env.MEMBERS_PHONE_COLUMN, 'PhoneNo');
    let members: any[];

    if (dbClient === 'mssql') {
      const memberResult = await pool.request()
        .input('phone', sql.NVarChar, phone)
        .query(`SELECT * FROM ${tableName} WHERE ${phoneColumn} = @phone`);
      members = memberResult.recordset;
    } else {
      if (!connection) {
        connection = await pool.getConnection();
      }
      const [mysqlMembers] = await connection.query(
        `SELECT * FROM ${tableName} WHERE ${phoneColumn} = ?`,
        [phone]
      ) as any[];
      members = mysqlMembers;
    }

    if (members.length === 0) {
      if (connection && typeof connection.release === 'function') {
        connection.release();
      }
      return NextResponse.json(
        { error: 'کاربر در سیستم یافت نشد' },
        { status: 404 }
      );
    }

    const member = members[0];
    const memberId = Number(member[idColumn]);
    const username = String(member[usernameColumn] ?? '');

    // Check if user exists in users table, if not create it (for register flow)
    let user: any;

    if (dbClient === 'mssql') {
      const userResult = await pool.request()
        .input('tenant_id', sql.Int, tenantId)
        .input('phone', sql.NVarChar, phone)
        .query(`SELECT * FROM users WHERE tenant_id = @tenant_id AND phone = @phone`);
      
      if (userResult.recordset.length === 0) {
        // Create user in users table for register flow
        await pool.request()
          .input('tenant_id', sql.Int, tenantId)
          .input('username', sql.NVarChar, username)
          .input('phone', sql.NVarChar, phone)
          .query(`INSERT INTO users (tenant_id, username, phone) VALUES (@tenant_id, @username, @phone)`);
        
        const newUserResult = await pool.request()
          .input('tenant_id', sql.Int, tenantId)
          .input('phone', sql.NVarChar, phone)
          .query(`SELECT * FROM users WHERE tenant_id = @tenant_id AND phone = @phone`);
        user = newUserResult.recordset[0];
      } else {
        user = userResult.recordset[0];
      }
    } else {
      if (!connection) {
        connection = await pool.getConnection();
      }
      const [existingUsers] = await connection.query(
        'SELECT * FROM users WHERE tenant_id = ? AND phone = ?',
        [tenantId, phone]
      ) as any[];

      if (existingUsers.length === 0) {
        // Create user in users table for register flow
        await connection.query(
          'INSERT INTO users (tenant_id, username, phone) VALUES (?, ?, ?)',
          [tenantId, username, phone]
        );
        const [newUsers] = await connection.query(
          'SELECT * FROM users WHERE tenant_id = ? AND phone = ?',
          [tenantId, phone]
        ) as any[];
        user = newUsers[0];
      } else {
        user = existingUsers[0];
      }
      connection.release();
    }

    // Generate token
    const token = generateToken({
      userId: Number.isFinite(memberId) ? memberId : user.id,
      username: username || user.username,
      phone: phone,
    });

    const response = NextResponse.json({
      message: 'ورود موفقیت‌آمیز',
      user: {
        id: user.id,
        username: username || user.username,
        phone: phone,
      },
    });

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
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

    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'خطا در تایید کد' },
      { status: 500 }
    );
  }
}



