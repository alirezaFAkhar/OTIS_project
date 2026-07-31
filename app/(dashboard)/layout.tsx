import { enforceReferrerGate } from '@/lib/referrer-gate-server';
import DashboardLayoutClient from './DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await enforceReferrerGate();
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
