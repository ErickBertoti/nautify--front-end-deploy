import type { User as SupabaseUser } from '@supabase/supabase-js';
import { ApiError } from '@/lib/api';
import {
  AUTH_STATE_PROFILE_REQUIRED,
  PENDING_REGISTRATION_STORAGE_KEY,
} from '@/lib/auth-constants';
import { markProfileRequired, persistBackendToken } from '@/lib/auth-state';
import { authService } from '@/services';
import type { DocumentType, UserAddress } from '@/types';
import { createClient } from '@/utils/supabase/client';

export type AuthProvider = 'password' | 'google';

export interface BackendProfilePayload {
  name: string;
  email?: string;
  phone?: string;
  authProvider?: AuthProvider;
  documentType?: DocumentType;
  document?: string;
  birthDate?: string;
  address?: UserAddress;
}

export type BackendAuthStatus = 'ready' | typeof AUTH_STATE_PROFILE_REQUIRED;

function canAutoRegisterPendingProfile(
  profile: BackendProfilePayload | null,
): profile is BackendProfilePayload {
  if (!profile) {
    return false;
  }

  return Boolean(profile.name && profile.documentType && profile.document);
}

function mergePendingRegistrationFallback(
  existing: BackendProfilePayload | null,
  fallback: BackendProfilePayload,
): BackendProfilePayload {
  if (!existing) {
    return fallback;
  }

  if (existing.email && fallback.email && existing.email !== fallback.email) {
    return fallback;
  }

  return {
    ...fallback,
    ...existing,
    address: existing.address ?? fallback.address,
  };
}

export function buildAuthCallbackUrl(next = '/dashboard') {
  const callbackUrl = new URL('/auth/callback', window.location.origin);
  callbackUrl.searchParams.set('next', next);
  return callbackUrl.toString();
}

export function getAuthProviderForUser(user: SupabaseUser | null): AuthProvider | undefined {
  if (!user) {
    return undefined;
  }

  const provider = typeof user.app_metadata?.provider === 'string'
    ? user.app_metadata.provider
    : undefined;

  if (provider === 'google') {
    return 'google';
  }

  if (provider === 'email') {
    return 'password';
  }

  return undefined;
}

export function buildPendingRegistrationScaffold(user: SupabaseUser | null): BackendProfilePayload | null {
  if (!user) {
    return null;
  }

  return {
    name: getSupabaseDisplayName(user),
    email: user.email ?? '',
    authProvider: getAuthProviderForUser(user),
  };
}

export async function startGoogleOAuth(next = '/dashboard') {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: buildAuthCallbackUrl(next),
    },
  });

  if (error) {
    throw error;
  }
}

export async function syncBackendAuth(
  supabaseToken: string,
  options: {
    allowPendingRegistration?: boolean;
    profileRequiredFallback?: BackendProfilePayload | null;
  } = {},
): Promise<BackendAuthStatus> {
  try {
    const result = await authService.supabaseExchange(supabaseToken);
    persistBackendToken(result.data.token);
    return 'ready';
  } catch (error) {
    if (!(error instanceof ApiError) || error.code !== 'PROFILE_REQUIRED') {
      throw error;
    }

    const pendingRegistration = getPendingRegistration();

    if (options.allowPendingRegistration && canAutoRegisterPendingProfile(pendingRegistration)) {
      try {
        const result = await authService.supabaseRegister(supabaseToken, pendingRegistration);
        clearPendingRegistration();
        persistBackendToken(result.data.token);
        return 'ready';
      } catch {
        // Fall through to the guided profile completion screen.
      }
    }

    if (options.profileRequiredFallback) {
      savePendingRegistration(
        mergePendingRegistrationFallback(pendingRegistration, options.profileRequiredFallback),
      );
    }

    markProfileRequired();
    return AUTH_STATE_PROFILE_REQUIRED;
  }
}

export function savePendingRegistration(data: BackendProfilePayload) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(PENDING_REGISTRATION_STORAGE_KEY, JSON.stringify(data));
}

export function getPendingRegistration(): BackendProfilePayload | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = localStorage.getItem(PENDING_REGISTRATION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as BackendProfilePayload;
  } catch {
    return null;
  }
}

export function clearPendingRegistration() {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(PENDING_REGISTRATION_STORAGE_KEY);
}

export function getSupabaseDisplayName(user: SupabaseUser | null): string {
  if (!user) {
    return '';
  }

  const metadata = user.user_metadata ?? {};
  const candidates = [
    metadata.full_name,
    metadata.name,
    metadata.user_name,
    metadata.preferred_username,
    user.email?.split('@')[0],
  ];

  return candidates.find((candidate): candidate is string => typeof candidate === 'string' && candidate.trim().length > 0)?.trim() ?? '';
}
