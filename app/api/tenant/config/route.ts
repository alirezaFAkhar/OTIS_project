import { NextRequest, NextResponse } from 'next/server';
import { getTenantConfig, setTenantConfig, getAllTenantConfigs } from '@/lib/tenant';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';
import { verifyToken } from '@/lib/auth';
import { z } from 'zod';

const configSchema = z.object({
  key: z.string().min(1, 'کلید کانفیگ الزامی است'),
  value: z.string().optional(),
});

// Get tenant config
export async function GET(request: NextRequest) {
  try {
    const tenantInfo = await getTenantFromHeaders(request);
    if (!tenantInfo) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }
    
    const tenantId = tenantInfo.tenantId;
    const configKey = request.nextUrl.searchParams.get('key');

    if (configKey) {
      // Get specific config
      const value = await getTenantConfig(tenantId, configKey);
      return NextResponse.json({ key: configKey, value });
    } else {
      // Get all configs
      const configs = await getAllTenantConfigs(tenantId);
      return NextResponse.json({ configs });
    }
  } catch (error: any) {
    console.error('Error getting tenant config:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت کانفیگ' },
      { status: 500 }
    );
  }
}

// Set tenant config
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

    // Check if user is admin (you can add admin check here)
    const body = await request.json();
    const { key, value } = configSchema.parse(body);

    const success = await setTenantConfig(
      tenantId,
      key,
      value || ''
    );

    if (success) {
      return NextResponse.json({
        message: 'کانفیگ با موفقیت ذخیره شد',
        key,
        value,
      });
    } else {
      return NextResponse.json(
        { error: 'خطا در ذخیره کانفیگ' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Error setting tenant config:', error);
    return NextResponse.json(
      { error: 'خطا در ذخیره کانفیگ' },
      { status: 500 }
    );
  }
}

