import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { z } from 'zod';
import { hashPassword } from '@/lib/auth';

const createTenantSchema = z.object({
  name: z.string().min(1, 'نام مشتری الزامی است'),
  subdomain: z.string().min(1, 'زیردامنه الزامی است').regex(/^[a-z0-9-]+$/, 'زیردامنه نامعتبر است'),
  domain: z.string().optional(),
  admin_username: z.string().min(3, 'نام کاربری ادمین باید حداقل 3 کاراکتر باشد'),
  admin_password: z.string().min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد'),
  admin_email: z.string().email().optional(),
  admin_phone: z.string().optional(),
});

// Create new tenant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createTenantSchema.parse(body);

    const connection = await pool.getConnection();

    // Check if subdomain already exists
    const [existingTenants] = await connection.query(
      'SELECT id FROM tenants WHERE subdomain = ? OR domain = ?',
      [data.subdomain, data.domain || '']
    ) as any[];

    if (existingTenants.length > 0) {
      connection.release();
      return NextResponse.json(
        { error: 'زیردامنه یا دامنه قبلاً استفاده شده است' },
        { status: 400 }
      );
    }

    // Create tenant
    const [result] = await connection.query(
      'INSERT INTO tenants (name, subdomain, domain) VALUES (?, ?, ?)',
      [data.name, data.subdomain, data.domain || null]
    ) as any;

    const tenantId = result.insertId;

    // Create admin user
    const hashedPassword = await hashPassword(data.admin_password);
    await connection.query(
      `INSERT INTO tenant_admins (tenant_id, username, password, email, phone) 
       VALUES (?, ?, ?, ?, ?)`,
      [tenantId, data.admin_username, hashedPassword, data.admin_email || null, data.admin_phone || null]
    );

    connection.release();

    return NextResponse.json({
      message: 'مشتری با موفقیت ایجاد شد',
      tenant: {
        id: tenantId,
        name: data.name,
        subdomain: data.subdomain,
        domain: data.domain,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error creating tenant:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد مشتری' },
      { status: 500 }
    );
  }
}

// Get all tenants
export async function GET(request: NextRequest) {
  try {
    const connection = await pool.getConnection();
    const [tenants] = await connection.query(
      'SELECT id, name, subdomain, domain, is_active, created_at FROM tenants ORDER BY created_at DESC'
    ) as any[];
    connection.release();

    return NextResponse.json({ tenants });
  } catch (error: any) {
    console.error('Error getting tenants:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت لیست مشتری‌ها' },
      { status: 500 }
    );
  }
}





