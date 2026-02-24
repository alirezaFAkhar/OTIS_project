import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateToken, comparePassword } from '@/lib/auth';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, 'نام کاربری الزامی است'),
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = loginSchema.parse(body);
    
    const tenantInfo = await getTenantFromHeaders(request);
    if (!tenantInfo) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }
    
    const tenantId = tenantInfo.tenantId;

    const connection = await pool.getConnection();

    // Check if user exists for this tenant
    const [users] = await connection.query(
      'SELECT * FROM users WHERE username = ? AND tenant_id = ?',
      [username, tenantId]
    ) as any[];

    if (users.length === 0) {
      connection.release();
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Check if user has a password set
    if (!user.password) {
      connection.release();
      return NextResponse.json(
        { error: 'لطفا ابتدا رمز عبور خود را تنظیم کنید' },
        { status: 400 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      connection.release();
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      username: user.username,
      phone: user.phone,
    });

    connection.release();

    const response = NextResponse.json({
      message: 'ورود موفقیت‌آمیز',
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
      },
      token,
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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'خطا در ورود' },
      { status: 500 }
    );
  }
}



