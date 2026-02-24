import { NextRequest } from 'next/server';
import { getTenantBySubdomain, getTenantByDomain } from './tenant';

type TenantResolveMethod = 'header' | 'subdomain' | 'domain' | 'default';

function parseTenantId(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getDefaultTenantId(): number {
  return (
    parseTenantId(process.env.DEFAULT_TENANT_ID) ||
    parseTenantId(process.env.NEXT_PUBLIC_DEFAULT_TENANT_ID) ||
    1
  );
}

function getTenantMode() {
  return (process.env.TENANT_RESOLUTION_MODE || 'header').toLowerCase();
}

function parseMapFromEnv(value: string | undefined): Record<string, number> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, number | string>;
    const normalized: Record<string, number> = {};
    Object.entries(parsed).forEach(([key, raw]) => {
      const id = parseTenantId(String(raw));
      if (id) {
        normalized[key.toLowerCase()] = id;
      }
    });
    return normalized;
  } catch {
    return {};
  }
}

function resolveTenantIdFromHostData(subdomain?: string | null, domain?: string | null): number {
  const subdomainMap = parseMapFromEnv(process.env.TENANT_SUBDOMAIN_MAP);
  const domainMap = parseMapFromEnv(process.env.TENANT_DOMAIN_MAP);

  if (subdomain) {
    const mapped = subdomainMap[subdomain.toLowerCase()];
    if (mapped) return mapped;
  }

  if (domain) {
    const mapped = domainMap[domain.toLowerCase()];
    if (mapped) return mapped;
  }

  return getDefaultTenantId();
}

/**
 * Get tenant from request headers (set by middleware)
 * This function should be called in API routes, not in middleware
 */
export async function getTenantFromHeaders(request: NextRequest) {
  // First, check if tenant ID is already in headers (from middleware or direct header)
  const tenantId = parseTenantId(request.headers.get('x-tenant-id'));
  if (tenantId) {
    return { tenantId, method: 'header' as TenantResolveMethod };
  }

  const mode = getTenantMode();

  // Header-only mode allows multi-tenant separation without requiring a tenants table.
  if (mode === 'header') {
    const subdomain = request.headers.get('x-tenant-subdomain');
    const domain = request.headers.get('x-tenant-domain') || request.headers.get('host');
    const resolvedTenantId = resolveTenantIdFromHostData(subdomain, domain);
    return { tenantId: resolvedTenantId, method: 'default' as TenantResolveMethod };
  }

  // Try to get from subdomain
  const subdomain = request.headers.get('x-tenant-subdomain');
  if (subdomain) {
    const tenant = await getTenantBySubdomain(subdomain);
    if (tenant) {
      return { tenantId: tenant.id, method: 'subdomain' as TenantResolveMethod, tenant };
    }
  }

  // Try to get from domain
  const domain = request.headers.get('x-tenant-domain');
  if (domain) {
    const tenant = await getTenantByDomain(domain);
    if (tenant) {
      return { tenantId: tenant.id, method: 'domain' as TenantResolveMethod, tenant };
    }
  }

  // Try to get from host header directly
  const host = request.headers.get('host') || '';
  if (host && !host.includes('localhost') && !host.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    const parts = host.split('.');
    
    // Try subdomain first
    if (parts.length >= 3) {
      const subdomainFromHost = parts[0];
      const tenant = await getTenantBySubdomain(subdomainFromHost);
      if (tenant) {
        return { tenantId: tenant.id, method: 'subdomain' as TenantResolveMethod, tenant };
      }
    }
    
    // Try full domain
    const tenant = await getTenantByDomain(host);
    if (tenant) {
      return { tenantId: tenant.id, method: 'domain' as TenantResolveMethod, tenant };
    }
  }

  return null;
}


