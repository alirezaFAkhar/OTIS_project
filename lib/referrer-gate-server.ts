import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ENTRY_COOKIE_NAME,
  evaluateReferrerGate,
  readReferrerGateConfigFromEnv,
} from '@/lib/referrer-gate';

/**
 * Server-side gate — reads process.env at request time (works after deploy without rebuild).
 * Use in layouts / pages; middleware alone is not enough when env is only set at container start.
 */
export async function enforceReferrerGate(pathname = '/'): Promise<void> {
  const config = readReferrerGateConfigFromEnv();
  const headersList = await headers();
  const cookieStore = await cookies();

  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost';
  const proto = headersList.get('x-forwarded-proto') || 'http';
  const requestOrigin = `${proto}://${host}`;

  const decision = evaluateReferrerGate({
    pathname,
    requestOrigin,
    headers: headersList,
    cookies: cookieStore,
    config,
  });

  if (decision.action === 'block') {
    if (decision.redirectUrl) {
      redirect(decision.redirectUrl);
    }
    redirect('https://asiaotis.ir/');
  }

  if (decision.action === 'allow' && 'setEntryCookie' in decision && decision.setEntryCookie) {
    cookieStore.set(ENTRY_COOKIE_NAME, '1', {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: config.cookieMaxAge,
    });
  }
}
