'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Lock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PasswordStrengthBar } from '@/components/shared/PasswordStrengthBar';
import { clearClientAuth } from '@/lib/auth-state';
import { createClient } from '@/utils/supabase/client';

function translateResetPasswordError(message: string) {
  const normalizedMessage = message.trim().toLowerCase();

  if (
    normalizedMessage.includes('auth session missing') ||
    normalizedMessage.includes('session missing') ||
    normalizedMessage.includes('session_not_found')
  ) {
    return 'Seu link de recuperação expirou. Solicite um novo e-mail para redefinir a senha.';
  }

  if (
    normalizedMessage.includes('new password should be different from the old password') ||
    normalizedMessage.includes('same password')
  ) {
    return 'A nova senha deve ser diferente da senha atual.';
  }

  if (
    normalizedMessage.includes('password should be at least') ||
    normalizedMessage.includes('password must be at least')
  ) {
    return 'A nova senha deve ter pelo menos 8 caracteres.';
  }

  if (
    normalizedMessage.includes('password is too weak') ||
    normalizedMessage.includes('weak password')
  ) {
    return 'Escolha uma senha mais forte para continuar.';
  }

  if (normalizedMessage.includes('rate limit') || normalizedMessage.includes('too many requests')) {
    return 'Muitas tentativas em sequência. Aguarde um instante e tente novamente.';
  }

  return 'Não foi possível atualizar a senha. Tente novamente.';
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const supabase = createClient();
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (sessionError || !data.session) {
        router.replace('/login?error=auth-callback');
        return;
      }

      setSessionReady(true);
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword.length < 8) {
      setError('A nova senha precisa ter pelo menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas nao coincidem.');
      return;
    }

    setIsLoading(true);
    setError('');

    const supabase = createClient();

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(translateResetPasswordError(updateError.message));
        return;
      }

      await supabase.auth.signOut();
      clearClientAuth();
      router.replace('/login?message=password-reset-success');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0c1322_0%,#141b2b_100%)] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center">
        <Card className="w-full border-white/10 bg-[rgba(20,27,43,0.92)] text-white shadow-2xl">
          <CardHeader className="space-y-3 border-white/10">
            <Link
              href="/login"
              className="inline-flex w-fit items-center gap-2 text-sm text-[#b9c6eb] transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para login
            </Link>
            <div className="space-y-2">
              <CardTitle className="text-2xl text-[#dce2f7]">Definir nova senha</CardTitle>
              <CardDescription className="text-[#8f9097]">
                Escolha uma senha forte para concluir a recuperação da sua conta.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {!sessionReady ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-[#b9c6eb]">
                Validando seu link de recuperação...
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="relative">
                  <Input
                    label="Nova senha"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      setError('');
                    }}
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    className="border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-[#8f9097]"
                  />
                  <Lock className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-[#8f9097]" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((current) => !current)}
                    className="absolute right-3 top-[38px] text-[#8f9097] transition-colors hover:text-white"
                    aria-label={showNewPassword ? 'Ocultar nova senha' : 'Mostrar nova senha'}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <PasswordStrengthBar password={newPassword} />

                <div className="relative">
                  <Input
                    label="Confirmar nova senha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setError('');
                    }}
                    placeholder="Repita a nova senha"
                    autoComplete="new-password"
                    error={error}
                    className="border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-[#8f9097]"
                  />
                  <Shield className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-[#8f9097]" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute right-3 top-[38px] text-[#8f9097] transition-colors hover:text-white"
                    aria-label={showConfirmPassword ? 'Ocultar confirmação de senha' : 'Mostrar confirmação de senha'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                  Atualizar senha
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
