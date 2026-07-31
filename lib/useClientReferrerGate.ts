'use client';
import { useEffect } from 'react';

function normalizeHost(h: string): string {
  return h.toLowerCase().replace(/^www\./, '');
}

export function useClientReferrerGate(allowedUrls: string, redirectUrl: string): void {
  useEffect(() => {
    if (!allowedUrls) return;

    const ref = document.referrer;
    if (!ref) return;

    try {
      const refHost = normalizeHost(new URL(ref).hostname);
      const sameOrigin = normalizeHost(window.location.hostname);
      if (refHost === sameOrigin) return;

      const allowed = allowedUrls
        .split(',')
        .map((u) => {
          try {
            return normalizeHost(new URL(u.trim()).hostname);
          } catch {
            return '';
          }
        })
        .filter(Boolean);

      if (!allowed.includes(refHost)) {
        window.location.href = redirectUrl;
      }
    } catch {
      // URL parse error — don't block
    }
  }, [allowedUrls, redirectUrl]);
}
