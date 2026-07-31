import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  ENTRY_COOKIE_NAME,
  evaluateReferrerGate,
  readReferrerGateConfigFromEnv,
  shouldSkipReferrerGatePath,
} from '@/lib/referrer-gate';

function isLocalDevHost(host: string): boolean {
  const hostname = host.split(':')[0].toLowerCase();
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local');
}

function shouldBypassReferrerGate(request: NextRequest): boolean {
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.REFERRER_GATE_BYPASS_IN_DEV?.trim().toLowerCase() === 'true'
  ) {
    return true;
  }
  if (process.env.REFERRER_GATE_BYPASS_LOCALHOST?.trim().toLowerCase() !== 'true') {
    return false;
  }
  return isLocalDevHost(request.headers.get('host') || '');
}

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

  if (
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/images/icon/') ||
    pathname.includes('/mipmap-') ||
    pathname.includes('ic_launcher')
  ) {
    return new NextResponse(null, { status: 404 });
  }

  const gateConfig = readReferrerGateConfigFromEnv();

  if (!shouldBypassReferrerGate(request)) {
    const decision = evaluateReferrerGate({
      pathname,
      requestOrigin: request.nextUrl.origin,
      method: request.method,
      headers: request.headers,
      cookies: request.cookies,
      config: gateConfig,
    });

    if (decision.action === 'block') {
      if (decision.redirectUrl) {
        return NextResponse.redirect(decision.redirectUrl);
      }
      return new NextResponse('Forbidden', { status: 403 });
    }

    const host = request.headers.get('host') || '';
    const hostWithoutPort = host.split(':')[0];
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-domain', hostWithoutPort);
    const parts = hostWithoutPort.split('.');
    if (parts.length >= 3) {
      requestHeaders.set('x-tenant-subdomain', parts[0]);
    }

    const resolvedTenantId = resolveTenantId(host, request.headers.get('x-tenant-id'));
    if (resolvedTenantId) {
      requestHeaders.set('x-tenant-id', resolvedTenantId);
    }

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    if (decision.action === 'allow' && 'setEntryCookie' in decision && decision.setEntryCookie) {
      response.cookies.set(ENTRY_COOKIE_NAME, '1', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: gateConfig.cookieMaxAge,
      });
    }

    return response;
  }

  const host = request.headers.get('host') || '';
  const hostWithoutPort = host.split(':')[0];
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-domain', hostWithoutPort);
  const parts = hostWithoutPort.split('.');
  if (parts.length >= 3) {
    requestHeaders.set('x-tenant-subdomain', parts[0]);
  }

  const resolvedTenantId = resolveTenantId(host, request.headers.get('x-tenant-id'));
  if (resolvedTenantId) {
    requestHeaders.set('x-tenant-id', resolvedTenantId);
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
  ],
};
