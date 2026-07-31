import { enforceReferrerGate } from '@/lib/referrer-gate-server';
import AdminLayoutClient from './AdminLayoutClient';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await enforceReferrerGate();
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
