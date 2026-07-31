import { enforceReferrerGate } from '@/lib/referrer-gate-server';
import { redirect } from 'next/navigation';

export default async function Home() {
  await enforceReferrerGate('/');
  redirect('/login');
}
