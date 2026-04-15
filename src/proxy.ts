import { type NextRequest, NextResponse } from 'next/server';
import {
  AUTH_STATE_COOKIE,
  AUTH_STATE_PROFILE_REQUIRED,
  BACKEND_TOKEN_COOKIE,
} from '@/lib/auth-constants';
import { createClient } from '@/utils/supabase/middleware';

const publicRoutes = ['/', '/login', '/register', '/esqueci-senha', '/auth/callback', '/auth/bridge', '/auth/complete-profile'];
const backendAuthBypassRoutes = ['/auth/callback', '/auth/bridge', '/auth/complete-profile', '/redefinir-senha'];

function isExactRoute(pathname: string, routes: string[]) {
  return routes.some((route) => pathname === route);
}

function clearProxyAuthCookies(response: NextResponse) {
  response.cookies.set(AUTH_STATE_COOKIE, '', { maxAge: 0, path: '/' });
  response.cookies.set(BACKEND_TOKEN_COOKIE, '', { maxAge: 0, path: '/' });
}

function buildRedirectWithNext(request: NextRequest, pathname: string) {
  const redirectUrl = new URL(pathname, request.url);
  redirectUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return redirectUrl;
}

function buildLoginRedirect(request: NextRequest, shouldClearCookies = false) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', `${request.nextUrl.pathname}${request.nextUrl.search}`);

  const response = NextResponse.redirect(loginUrl);
  if (shouldClearCookies) {
    clearProxyAuthCookies(response);
  }

  return response;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicRoute = isExactRoute(pathname, publicRoutes) || pathname.startsWith('/termos');
  const bypassesBackendAuth = isExactRoute(pathname, backendAuthBypassRoutes) || pathname.startsWith('/termos');

  const { supabase, supabaseResponse } = createClient(request);
  const authState = request.cookies.get(AUTH_STATE_COOKIE)?.value;
  const hasBackendToken = Boolean(request.cookies.get(BACKEND_TOKEN_COOKIE)?.value);
  const profileCompletionRequired = authState === AUTH_STATE_PROFILE_REQUIRED;
  const hasStaleNautifyAuth = Boolean(authState || hasBackendToken);

  let user = null;

  try {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();

    user = currentUser;
  } catch (error) {
    console.error('Erro ao validar sessao no proxy:', error);

    if (hasStaleNautifyAuth) {
      clearProxyAuthCookies(supabaseResponse);
    }

    if (isPublicRoute) {
      return supabaseResponse;
    }

    return buildLoginRedirect(request, hasStaleNautifyAuth);
  }

  if (!user) {
    if (hasStaleNautifyAuth) {
      clearProxyAuthCookies(supabaseResponse);
    }

    if (isPublicRoute) {
      return supabaseResponse;
    }

    return buildLoginRedirect(request, hasStaleNautifyAuth);
  }

  if (!hasBackendToken && !bypassesBackendAuth) {
    const target = profileCompletionRequired ? '/auth/complete-profile' : '/auth/bridge';
    return NextResponse.redirect(buildRedirectWithNext(request, target));
  }

  if (pathname === '/login' || pathname === '/register') {
    if (hasBackendToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const target = profileCompletionRequired ? '/auth/complete-profile' : '/auth/bridge';
    const targetUrl = new URL(target, request.url);
    const requestedRedirect = request.nextUrl.searchParams.get('redirect');
    targetUrl.searchParams.set('next', requestedRedirect && requestedRedirect.startsWith('/') ? requestedRedirect : '/dashboard');
    return NextResponse.redirect(targetUrl);
  }

  if (hasBackendToken && (pathname === '/auth/bridge' || pathname === '/auth/complete-profile')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
