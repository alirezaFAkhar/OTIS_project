import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function parseTenantId(value: string | undefined | null): string | null {
  if (!value) return null;
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return String(Math.trunc(numeric));
}

function parseTenantMap(rawValue: string | undefined): Record<string, string> {
  if (!rawValue) return {};
  try {
    const parsed = JSON.parse(rawValue) as Record<string, string | number>;
    const result: Record<string, string> = {};
    Object.entries(parsed).forEach(([key, value]) => {
      const parsedValue = parseTenantId(String(value));
      if (parsedValue) {
        result[key.toLowerCase()] = parsedValue;
      }
    });
    return result;
  } catch {
    return {};
  }
}

function resolveTenantId(host: string, currentHeaderTenantId: string | null): string | null {
  const explicitTenantId = parseTenantId(currentHeaderTenantId);
  if (explicitTenantId) return explicitTenantId;

  const hostWithoutPort = host.split(':')[0].toLowerCase();
  const parts = hostWithoutPort.split('.');
  const subdomain = parts.length >= 3 ? parts[0] : null;

  const domainMap = parseTenantMap(process.env.TENANT_DOMAIN_MAP);
  const subdomainMap = parseTenantMap(process.env.TENANT_SUBDOMAIN_MAP);

  if (subdomain && subdomainMap[subdomain]) {
    return subdomainMap[subdomain];
  }
  if (domainMap[hostWithoutPort]) {
    return domainMap[hostWithoutPort];
  }

  return parseTenantId(process.env.DEFAULT_TENANT_ID) || '1';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore requests for non-existent assets (Android icons, etc.)
  // These are often auto-requested by browsers or bookmarks
  if (
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/images/icon/') ||
    pathname.includes('/mipmap-') ||
    pathname.includes('ic_launcher')
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const host = request.headers.get('host') || '';
  const hostWithoutPort = host.split(':')[0];
  const requestHeaders = new Headers(request.headers);

  // Always pass host-derived tenant hints to API handlers.
  requestHeaders.set('x-tenant-domain', hostWithoutPort);
  const parts = hostWithoutPort.split('.');
  if (parts.length >= 3) {
    requestHeaders.set('x-tenant-subdomain', parts[0]);
  }

  // Tenant resolution is automatic from host mappings + default fallback.
  const resolvedTenantId = resolveTenantId(host, request.headers.get('x-tenant-id'));
  if (resolvedTenantId) {
    requestHeaders.set('x-tenant-id', resolvedTenantId);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
  ],
};

