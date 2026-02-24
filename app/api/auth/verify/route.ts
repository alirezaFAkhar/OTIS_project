import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

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

    return NextResponse.json({
      valid: true,
      user: {
        id: payload.userId,
        username: payload.username,
        phone: payload.phone,
        email: payload.phone, // For compatibility
      },
      role: payload.role || 'user',
    });
  } catch (error: any) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'خطا در بررسی توکن' },
      { status: 500 }
    );
  }
}



