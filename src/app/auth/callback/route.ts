import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

function buildRedirectUrl(request: Request, origin: string, next: string) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';

  if (isLocalEnv) {
    return `${origin}${next}`;
  }

  if (forwardedHost) {
    return `https://${forwardedHost}${next}`;
  }

  return `${origin}${next}`;
}

function sanitizeNext(next: string | null, fallback: string) {
  return next && next.startsWith('/') ? next : fallback;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = new URL(request.url).origin;

  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const code = searchParams.get('code');
  const otpNext = sanitizeNext(searchParams.get('next'), type === 'recovery' ? '/redefinir-senha' : '/login');
  const oauthNext = sanitizeNext(searchParams.get('next'), '/dashboard');

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let errorMessage: string | null = null;

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });

    errorMessage = error?.message ?? null;

    if (errorMessage) {
      return NextResponse.redirect(buildRedirectUrl(request, origin, '/login?error=auth-callback'));
    }

    return NextResponse.redirect(buildRedirectUrl(request, origin, otpNext));
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    errorMessage = error?.message ?? null;

    if (errorMessage) {
      return NextResponse.redirect(buildRedirectUrl(request, origin, '/login?error=auth-callback'));
    }

    const bridgeParams = new URLSearchParams({ next: oauthNext });
    return NextResponse.redirect(
      buildRedirectUrl(request, origin, `/auth/bridge?${bridgeParams.toString()}`),
    );
  }

  return NextResponse.redirect(buildRedirectUrl(request, origin, '/login?error=auth-callback'));
}
