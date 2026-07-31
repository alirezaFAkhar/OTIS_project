export const ENTRY_COOKIE_NAME = 'otis_entry';

export type GateHeaderReader = {
  get(name: string): string | null | undefined;
};

export type GateCookieReader = {
  get(name: string): { value: string } | undefined;
};

export type ReferrerGateConfig = {
  enabled: boolean;
  allowedRules: string[];
  redirectUrl: string | null;
  allowDirectNavigation: boolean;
  cookieMaxAge: number;
};

export type ReferrerGateDecision =
  | { action: 'allow' }
  | { action: 'allow'; setEntryCookie: true }
  | { action: 'block'; redirectUrl: string | null };

export function parseAllowedReferrerRules(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isTruthyEnvFlag(value: string | undefined): boolean {
  const v = value?.trim().toLowerCase();
  return v === 'true' || v === '1' || v === 'yes';
}

export function parsePositiveIntEnv(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.trunc(parsed);
}

export function readReferrerGateConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): ReferrerGateConfig {
  return {
    enabled: isTruthyEnvFlag(env.REFERRER_GATE_ENABLED),
    allowedRules: parseAllowedReferrerRules(
      env.REFERRER_GATE_ALLOWED_URLS || env.REFERRER_GATE_ALLOWED_URL,
    ),
    redirectUrl: env.REFERRER_GATE_REDIRECT_URL?.trim() || null,
    allowDirectNavigation: isTruthyEnvFlag(env.REFERRER_GATE_ALLOW_DIRECT_NAVIGATION),
    cookieMaxAge: parsePositiveIntEnv(env.REFERRER_GATE_COOKIE_MAX_AGE, 86_400),
  };
}

export function isReferrerGateActive(config: ReferrerGateConfig): boolean {
  return config.enabled && config.allowedRules.length > 0;
}

function shouldAllowMissingReferrerForNavigation(
  method: string,
  secFetchMode: string | null | undefined,
  secFetchDest: string | null | undefined,
): boolean {
  if (method !== 'GET') return false;
  const mode = secFetchMode?.toLowerCase();
  const dest = secFetchDest?.toLowerCase();
  if (mode !== 'navigate') return false;
  return dest === 'document' || dest === 'empty' || !dest;
}

function normalizeReferrerPathname(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  const trimmed = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return trimmed || '/';
}

function normalizeHostname(hostname: string): string {
  const lower = hostname.trim().toLowerCase();
  return lower.startsWith('www.') ? lower.slice(4) : lower;
}

function tryParseUrl(raw: string | null | undefined): URL | null {
  if (!raw) return null;
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

function referrerMatchesAllowedRule(referrerUrl: URL, ruleTrim: string): boolean {
  const trimmedRule = ruleTrim.trim();
  if (!trimmedRule) return false;

  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmedRule);
  const ruleUrl = tryParseUrl(hasProtocol ? trimmedRule : `https://${trimmedRule}`);
  if (!ruleUrl) return false;

  const refHost = normalizeHostname(referrerUrl.hostname);
  const ruleHost = normalizeHostname(ruleUrl.hostname);
  if (refHost !== ruleHost) return false;

  if (hasProtocol && referrerUrl.protocol !== ruleUrl.protocol) return false;

  const rulePath = normalizeReferrerPathname(ruleUrl.pathname);
  if (rulePath === '/') return true;

  const refPath = normalizeReferrerPathname(referrerUrl.pathname);
  return refPath === rulePath || refPath.startsWith(`${rulePath}/`);
}

function getReferrerUrl(headers: GateHeaderReader): URL | null {
  const rawReferer = headers.get('referer');
  const rawOrigin = headers.get('origin');
  return tryParseUrl(rawReferer ?? null) ?? tryParseUrl(rawOrigin ?? null);
}

function hasValidEntryCookie(cookies: GateCookieReader): boolean {
  return cookies.get(ENTRY_COOKIE_NAME)?.value === '1';
}

function hasAllowedExternalReferrer(
  headers: GateHeaderReader,
  requestOrigin: string,
  allowedRules: string[],
): boolean {
  const referrerUrl = getReferrerUrl(headers);
  if (!referrerUrl) return false;

  if (referrerUrl.origin === requestOrigin) return true;

  return allowedRules.some((rule) => referrerMatchesAllowedRule(referrerUrl, rule));
}

function referrerGateAllowsRequest(
  headers: GateHeaderReader,
  cookies: GateCookieReader,
  requestOrigin: string,
  allowedRules: string[],
  allowDirectNavigation: boolean,
  method = 'GET',
): boolean {
  if (hasValidEntryCookie(cookies)) return true;

  const referrerUrl = getReferrerUrl(headers);
  if (!referrerUrl) {
    return (
      allowDirectNavigation &&
      shouldAllowMissingReferrerForNavigation(
        method,
        headers.get('sec-fetch-mode'),
        headers.get('sec-fetch-dest'),
      )
    );
  }

  if (referrerUrl.origin === requestOrigin) return true;

  return allowedRules.some((rule) => referrerMatchesAllowedRule(referrerUrl, rule));
}

export function shouldSkipReferrerGatePath(pathname: string): boolean {
  if (pathname.startsWith('/api')) return true;
  if (pathname.startsWith('/_next')) return true;
  if (pathname === '/favicon.ico') return true;
  return /\.(?:ico|png|jpe?g|gif|webp|svg|css|js|woff2?|ttf|eot)$/i.test(pathname);
}

function isSameHost(target: URL, requestOrigin: string): boolean {
  const requestHost = normalizeHostname(new URL(requestOrigin).hostname);
  const targetHost = normalizeHostname(target.hostname);
  return requestHost === targetHost;
}

function resolveBlockRedirectUrl(
  redirectRaw: string | null,
  requestOrigin: string,
): string | null {
  if (!redirectRaw) return null;
  try {
    const target =
      redirectRaw.startsWith('/') && !redirectRaw.startsWith('//')
        ? new URL(redirectRaw, requestOrigin)
        : new URL(redirectRaw);
    if (!isSameHost(target, requestOrigin)) {
      return target.toString();
    }
  } catch {
    // ignore
  }
  return null;
}

export function evaluateReferrerGate(input: {
  pathname: string;
  requestOrigin: string;
  method?: string;
  headers: GateHeaderReader;
  cookies: GateCookieReader;
  config: ReferrerGateConfig;
}): ReferrerGateDecision {
  const { pathname, requestOrigin, method = 'GET', headers, cookies, config } = input;

  if (!isReferrerGateActive(config) || shouldSkipReferrerGatePath(pathname)) {
    return { action: 'allow' };
  }

  const allowed = referrerGateAllowsRequest(
    headers,
    cookies,
    requestOrigin,
    config.allowedRules,
    config.allowDirectNavigation,
    method,
  );

  if (!allowed) {
    return {
      action: 'block',
      redirectUrl: resolveBlockRedirectUrl(config.redirectUrl, requestOrigin),
    };
  }

  if (!hasValidEntryCookie(cookies) && hasAllowedExternalReferrer(headers, requestOrigin, config.allowedRules)) {
    return { action: 'allow', setEntryCookie: true };
  }

  return { action: 'allow' };
}
