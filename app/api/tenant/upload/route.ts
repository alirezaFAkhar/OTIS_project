import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import pool from '@/lib/db';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';
import { verifyToken } from '@/lib/auth';

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
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'background' or 'logo'

    if (!file) {
      return NextResponse.json(
        { error: 'فایل ارسال نشده است' },
        { status: 400 }
      );
    }

    if (!type || !['background', 'logo'].includes(type)) {
      return NextResponse.json(
        { error: 'نوع فایل نامعتبر است' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'نوع فایل مجاز نیست. فقط تصاویر JPEG, PNG, WebP مجاز است' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'حجم فایل نباید بیشتر از 5 مگابایت باشد' },
        { status: 400 }
      );
    }

    // Create tenant directory if it doesn't exist
    const tenantDir = join(process.cwd(), 'public', 'uploads', `tenant-${tenantId}`);
    if (!existsSync(tenantDir)) {
      await mkdir(tenantDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${type}-${timestamp}.${extension}`;
    const filepath = join(tenantDir, filename);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Generate URL
    const url = `/uploads/tenant-${tenantId}/${filename}`;

    // Update tenant record
    const connection = await pool.getConnection();
    const fieldName = type === 'background' ? 'background_image_url' : 'logo_url';
    await connection.query(
      `UPDATE tenants SET ${fieldName} = ? WHERE id = ?`,
      [url, tenantId]
    );
    connection.release();

    return NextResponse.json({
      message: 'فایل با موفقیت آپلود شد',
      url,
      type,
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'خطا در آپلود فایل' },
      { status: 500 }
    );
  }
}

