import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { hashPassword } from '@/lib/auth';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';
import pool from '@/lib/db';
import { z } from 'zod';
import sql from 'mssql';

const changePasswordSchema = z.object({
  password: z.string().min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد'),
  confirmPassword: z.string().min(6, 'تکرار رمز عبور باید حداقل 6 کاراکتر باشد'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'رمزهای عبور یکسان نیستند',
  path: ['confirmPassword'],
});

function safeColumnName(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value) ? value : fallback;
}

/**
 * POST /api/auth/change-password
 * Change password for authenticated user
 */
export async function POST(request: NextRequest) {
  let connection: any = null;
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'لطفا ابتدا وارد حساب کاربری خود شوید' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'توکن نامعتبر یا منقضی شده است' },
        { status: 401 }
      );
    }

    // Get tenant info
    const tenantInfo = await getTenantFromHeaders(request);
    if (!tenantInfo) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const tenantId = tenantInfo.tenantId;
    const userId = payload.userId;
    const userPhone = payload.phone;

    // Parse and validate request body
    const body = await request.json();
    const validatedData = changePasswordSchema.parse(body);

    // Get database client type
    const dbClient = (process.env.DB_CLIENT || 'mysql').toLowerCase();

    // Get column names for Members table
    const tableName = safeColumnName(process.env.MEMBERS_TABLE, 'Members');
    const idColumn = safeColumnName(process.env.MEMBERS_ID_COLUMN, 'Id');
    const passwordColumn = safeColumnName(process.env.MEMBERS_PASSWORD_COLUMN, 'Password');
    const phoneColumn = safeColumnName(process.env.MEMBERS_PHONE_COLUMN, 'PhoneNo');

    // Hash the new password
    const hashedPassword = await hashPassword(validatedData.password);

    console.log('Changing password for user:', {
      userId,
      userPhone,
      tenantId,
      tableName,
      phoneColumn,
      passwordColumn,
    });

    // Update password in Members table
    if (dbClient === 'mssql') {
      try {
        if (!pool.connected) {
          await pool.connect();
        }

        const updateResult = await pool.request()
          .input('password', sql.NVarChar, hashedPassword)
          .input('phone', sql.NVarChar, userPhone)
          .query(`UPDATE ${tableName} SET ${passwordColumn} = @password WHERE ${phoneColumn} = @phone`);
        
        console.log('MSSQL Update result:', updateResult.rowsAffected);

        if (updateResult.rowsAffected[0] === 0) {
          return NextResponse.json(
            { error: 'کاربر یافت نشد' },
            { status: 404 }
          );
        }
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
      // MySQL
      try {
        connection = await pool.getConnection();
        
        const [updateResult] = await connection.query(
          `UPDATE ${tableName} SET ${passwordColumn} = ? WHERE ${phoneColumn} = ?`,
          [hashedPassword, userPhone]
        ) as any[];

        console.log('MySQL Update result:', updateResult);

        if (updateResult.affectedRows === 0) {
          connection.release();
          return NextResponse.json(
            { error: 'کاربر یافت نشد' },
            { status: 404 }
          );
        }

        connection.release();
      } catch (connError: any) {
        console.error('MySQL connection error:', connError);
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

    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'خطا در تغییر رمز عبور' },
      { status: 500 }
    );
  }
}


