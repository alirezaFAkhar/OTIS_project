import { enforceReferrerGate } from '@/lib/referrer-gate-server';
import AuthLayoutClient from './AuthLayoutClient';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await enforceReferrerGate();
  const allowedUrls = process.env.REFERRER_GATE_ALLOWED_URLS || process.env.REFERRER_GATE_ALLOWED_URL || '';
  const redirectUrl = process.env.REFERRER_GATE_REDIRECT_URL || 'https://asiaotis.ir/';
  return (
    <AuthLayoutClient allowedUrls={allowedUrls} redirectUrl={redirectUrl}>
      {children}
    </AuthLayoutClient>
  );
}
