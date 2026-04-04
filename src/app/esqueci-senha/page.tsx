'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { isValidEmail } from '@/lib/validators';
import { createClient } from '@/utils/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidEmail(email)) {
      setError('Informe um e-mail valido.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const callbackUrl = new URL('/auth/callback', window.location.origin);
      callbackUrl.searchParams.set('next', '/redefinir-senha');

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: callbackUrl.toString(),
      });

      if (resetError) {
        setError(resetError.message || 'Nao foi possivel enviar o e-mail de recuperacao.');
        return;
      }

      setIsSubmitted(true);
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
              <CardTitle className="text-2xl text-[#dce2f7]">Esqueci minha senha</CardTitle>
              <CardDescription className="text-[#8f9097]">
                Enviamos um link seguro para voce redefinir a senha da sua conta.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            {isSubmitted ? (
              <div className="space-y-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-emerald-500/15 p-2">
                    <Mail className="h-4 w-4 text-emerald-300" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-emerald-200">
                      Verifique sua caixa de entrada
                    </p>
                    <p className="text-sm text-emerald-100/80">
                      Se o e-mail existir, voce recebera um link para redefinir a senha.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-white/15 bg-transparent text-white hover:bg-white/5"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                >
                  Enviar novamente
                </Button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="relative">
                  <Input
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="seu@email.com"
                    autoComplete="email"
                    error={error}
                    className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-[#8f9097]"
                  />
                  <Mail className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-[#8f9097]" />
                </div>

                <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                  {!isLoading && <Send className="h-4 w-4" />}
                  Enviar link de recuperacao
                </Button>
              </form>
            )}

            <p className="text-xs leading-relaxed text-[#8f9097]">
              O link enviado usa o callback do Supabase nesta aplicacao. Garanta que a URL
              <span className="mx-1 font-mono text-[#dce2f7]">
                /auth/callback
              </span>
              esteja liberada em Authentication {'>'} URL Configuration.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
