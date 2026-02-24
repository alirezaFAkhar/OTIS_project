const API_BASE = '/api/auth';

// Default fetch options with credentials to include httpOnly cookies
const defaultFetchOptions: RequestInit = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

// Verify token endpoint
export async function verifyToken() {
  const response = await fetch(`${API_BASE}/verify`, {
    method: 'GET',
    ...defaultFetchOptions,
  });
  return response.json();
}

export async function register(username: string, phone: string) {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    ...defaultFetchOptions,
    body: JSON.stringify({ username, phone }),
  });
  return response.json();
}

export async function login(username: string, password: string) {
  const response = await fetch('/api/members/login', {
    method: 'POST',
    ...defaultFetchOptions,
    body: JSON.stringify({ username, password }),
  });
  return response.json();
}

export async function membersLogin(username: string, password: string) {
  const response = await fetch('/api/members/login', {
    method: 'POST',
    ...defaultFetchOptions,
    body: JSON.stringify({ username, password }),
  });
  return response.json();
}

export async function verifyOTP(phone: string, code: string) {
  const response = await fetch(`${API_BASE}/verify-otp`, {
    method: 'POST',
    ...defaultFetchOptions,
    body: JSON.stringify({ phone, code }),
  });
  return response.json();
}

export async function forgotPassword(username: string, phone: string) {
  const response = await fetch(`${API_BASE}/forgot-password`, {
    method: 'POST',
    ...defaultFetchOptions,
    body: JSON.stringify({ username, phone }),
  });
  return response.json();
}

export async function resetPassword(phone: string, code: string, password: string) {
  const response = await fetch(`${API_BASE}/reset-password`, {
    method: 'POST',
    ...defaultFetchOptions,
    body: JSON.stringify({ phone, code, password }),
  });
  return response.json();
}

export async function adminLogin(username: string, password: string) {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    ...defaultFetchOptions,
    body: JSON.stringify({ username, password }),
  });
  return response.json();
}



