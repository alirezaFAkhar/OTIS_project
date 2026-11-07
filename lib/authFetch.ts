export async function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const response = await fetch(input, { credentials: 'include', ...init });

  if (response.status === 401 || response.status === 403) {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return response;
}
