import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token not found' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { valid: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (payload.role !== 'admin') {
      return NextResponse.json(
        { valid: false, error: 'Not an admin token' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      valid: true,
      admin: {
        id: payload.userId,
        username: payload.username,
        phone: payload.phone,
        role: payload.role,
        tenantId: payload.tenantId,
      },
    });
  } catch (error: any) {
    console.error('Admin token verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'خطا در بررسی توکن' },
      { status: 500 }
    );
  }
}





