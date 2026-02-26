import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';

/**
 * Initialize default admin for a tenant
 * This endpoint creates a default admin if one doesn't exist
 */
export async function POST(request: NextRequest) {
  try {
    const tenantInfo = await getTenantFromHeaders(request);
    if (!tenantInfo) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    const tenantId = tenantInfo.tenantId;
    const body = await request.json();
    const username = body.username || 'admin';
    const password = body.password || 'admin123';

    const connection = await pool.getConnection();

    // Check if admin already exists
    const [existingAdmins] = await connection.query(
      'SELECT * FROM tenant_admins WHERE username = ? AND tenant_id = ?',
      [username, tenantId]
    ) as any[];

    if (existingAdmins.length > 0) {
      connection.release();
      return NextResponse.json(
        { error: 'Admin user already exists', exists: true },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin
    await connection.query(
      `INSERT INTO tenant_admins (tenant_id, username, password, email, is_active) 
       VALUES (?, ?, ?, ?, ?)`,
      [tenantId, username, hashedPassword, body.email || null, true]
    );

    connection.release();

    return NextResponse.json({
      message: 'Admin created successfully',
      username,
    });
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد ادمین' },
      { status: 500 }
    );
  }
}





