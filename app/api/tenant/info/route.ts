import { NextRequest, NextResponse } from 'next/server';
import { getTenantFromHeaders } from '@/lib/tenant-middleware';

export async function GET(request: NextRequest) {
  try {
    const tenantInfo = await getTenantFromHeaders(request);

    if (!tenantInfo) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // If tenant object is already available, use it
    if (tenantInfo.tenant) {
      return NextResponse.json({ tenant: tenantInfo.tenant });
    }

    // In header mode we do not rely on a tenants table.
    if ((process.env.TENANT_RESOLUTION_MODE || 'header').toLowerCase() === 'header') {
      return NextResponse.json({
        tenant: {
          id: tenantInfo.tenantId,
          name: `Tenant ${tenantInfo.tenantId}`,
          subdomain: request.headers.get('x-tenant-subdomain'),
          domain: request.headers.get('x-tenant-domain') || request.headers.get('host'),
          background_image_url: null,
          logo_url: null,
          is_active: true,
        },
      });
    }

    // Otherwise, get tenant by ID
    const { getTenantById } = await import('@/lib/tenant');
    const tenant = await getTenantById(tenantInfo.tenantId);

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tenant });
  } catch (error: any) {
    console.error('Error getting tenant info:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات مشتری' },
      { status: 500 }
    );
  }
}

