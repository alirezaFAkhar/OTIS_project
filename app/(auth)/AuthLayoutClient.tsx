'use client';

import { useEffect, useState } from 'react';
import { useClientReferrerGate } from '@/lib/useClientReferrerGate';

export default function AuthLayoutClient({
  children,
  allowedUrls = '',
  redirectUrl = 'https://asiaotis.ir/',
}: {
  children: React.ReactNode;
  allowedUrls?: string;
  redirectUrl?: string;
}) {
  useClientReferrerGate(allowedUrls, redirectUrl);

  const [backgroundImage, setBackgroundImage] = useState<string>(
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
  );

  useEffect(() => {
    fetch('/api/tenant/info')
      .then((res) => res.json())
      .then((data) => {
        if (data.tenant?.background_image_url) {
          setBackgroundImage(data.tenant.background_image_url);
        }
      })
      .catch((err) => console.error('Error loading tenant info:', err));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </div>
  );
}
