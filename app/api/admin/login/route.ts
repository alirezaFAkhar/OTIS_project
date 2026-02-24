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

    // Check if admin exists for this tenant
    const [admins] = await connection.query(
      'SELECT * FROM tenant_admins WHERE username = ? AND tenant_id = ? AND is_active = TRUE',
      [username, tenantId]
    ) as any[];

    if (admins.length === 0) {
      connection.release();
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    const admin = admins[0];

    // Verify password
    const isPasswordValid = await comparePassword(password, admin.password);

    if (!isPasswordValid) {
      connection.release();
      return NextResponse.json(
        { error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // Generate token with admin role
    const token = generateToken({
      userId: admin.id,
      username: admin.username,
      phone: admin.phone || '',
      role: 'admin',
      tenantId: tenantId,
    });

    connection.release();

    const response = NextResponse.json({
      message: 'ورود موفقیت‌آمیز',
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
      },
      token,
    });

    // Set cookie
    response.cookies.set('admin_token', token, {
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
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'خطا در ورود' },
      { status: 500 }
    );
  }
}


