import {
  AUTH_STATE_COOKIE,
  AUTH_STATE_MAX_AGE,
  AUTH_STATE_PROFILE_REQUIRED,
  AUTH_STATE_READY,
  BACKEND_TOKEN_COOKIE,
  BACKEND_TOKEN_STORAGE_KEY,
  PENDING_REGISTRATION_STORAGE_KEY,
} from '@/lib/auth-constants';

type AuthStateValue = typeof AUTH_STATE_READY | typeof AUTH_STATE_PROFILE_REQUIRED;

function shouldUseSecureCookies() {
  return typeof window !== 'undefined' && window.location.protocol === 'https:';
}

function setCookie(name: string, value: string, maxAge = AUTH_STATE_MAX_AGE) {
  if (typeof document === 'undefined') {
    return;
  }

  const cookieParts = [
    `${name}=${value}`,
    `Max-Age=${maxAge}`,
    'Path=/',
    'SameSite=Lax',
  ];

  if (shouldUseSecureCookies()) {
    cookieParts.push('Secure');
  }

  document.cookie = cookieParts.join('; ');
}

function clearCookie(name: string) {
  if (typeof document === 'undefined') {
    return;
  }

  const cookieParts = [
    `${name}=`,
    'Max-Age=0',
    'Path=/',
    'SameSite=Lax',
  ];

  if (shouldUseSecureCookies()) {
    cookieParts.push('Secure');
  }

  document.cookie = cookieParts.join('; ');
}

function getCookie(name: string) {
  if (typeof document === 'undefined') {
    return null;
  }

  const prefix = `${name}=`;
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(prefix));

  return cookie ? cookie.slice(prefix.length) : null;
}

function decodeTokenExpiry(token: string) {
  const payload = token.split('.')[1];
  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - normalized.length % 4) % 4), '=');
    const decoded = JSON.parse(window.atob(padded)) as { exp?: number };

    return typeof decoded.exp === 'number' ? decoded.exp : null;
  } catch {
    return null;
  }
}

function clearPendingRegistrationStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(PENDING_REGISTRATION_STORAGE_KEY);
}

function clearBackendTokenStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(BACKEND_TOKEN_STORAGE_KEY);
}

function clearBackendTokenArtifacts() {
  clearBackendTokenStorage();
  clearCookie(BACKEND_TOKEN_COOKIE);
}

export function setClientAuthState(state: AuthStateValue, maxAge = AUTH_STATE_MAX_AGE) {
  setCookie(AUTH_STATE_COOKIE, state, maxAge);
}

export function getBackendToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  const cookieToken = getCookie(BACKEND_TOKEN_COOKIE);
  const localToken = localStorage.getItem(BACKEND_TOKEN_STORAGE_KEY);

  if (cookieToken) {
    if (localToken !== cookieToken) {
      localStorage.setItem(BACKEND_TOKEN_STORAGE_KEY, cookieToken);
    }

    return cookieToken;
  }

  return localToken;
}

export function persistBackendToken(token: string) {
  if (typeof window === 'undefined') {
    return;
  }

  const expiry = decodeTokenExpiry(token);
  const now = Math.floor(Date.now() / 1000);
  const maxAge = expiry ? expiry - now : 0;

  if (maxAge <= 0) {
    clearBackendTokenArtifacts();
    clearCookie(AUTH_STATE_COOKIE);
    throw new Error('Token do Nautify invalido ou expirado.');
  }

  localStorage.setItem(BACKEND_TOKEN_STORAGE_KEY, token);
  setCookie(BACKEND_TOKEN_COOKIE, token, maxAge);
  setClientAuthState(AUTH_STATE_READY, maxAge);
}

export function markProfileRequired() {
  clearBackendTokenArtifacts();
  setClientAuthState(AUTH_STATE_PROFILE_REQUIRED);
}

export function clearClientAuth() {
  clearBackendTokenArtifacts();
  clearCookie(AUTH_STATE_COOKIE);
  clearPendingRegistrationStorage();
}

export async function clearSupabaseAndBackendAuth() {
  clearClientAuth();

  if (typeof window === 'undefined') {
    return;
  }

  try {
    const { createClient } = await import('@/utils/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    // Best effort cleanup for invalid or expired browser sessions.
  }
}
