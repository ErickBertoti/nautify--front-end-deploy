import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = new URL(request.url).origin;

  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as 'signup' | 'email' | null;
  const code = searchParams.get('code');

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (tokenHash && type) {
    await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  } else if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/login`);
}
