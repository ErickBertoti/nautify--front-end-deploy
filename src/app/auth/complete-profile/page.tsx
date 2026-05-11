'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, FileText, Mail, MapPin, Phone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { CityAutocomplete } from '@/components/shared/CityAutocomplete';
import { fetchCep } from '@/lib/cep';
import { clearPendingRegistration, getPendingRegistration, getSupabaseDisplayName } from '@/lib/auth-flow';
import { persistBackendToken } from '@/lib/auth-state';
import { authService } from '@/services';
import type { DocumentType } from '@/types';
import { createClient } from '@/utils/supabase/client';
import { isValidCNPJ, isValidCPF, isValidPhone } from '@/lib/validators';
import { maskPhone } from '@/lib/form-formatters';

function maskCPF(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskCNPJ(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

function maskCEP(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2');
}

function sanitizeNext(next: string | null) {
  return next && next.startsWith('/') ? next : '/dashboard';
}

function getAge(birthDate: string) {
  if (!birthDate) {
    return null;
  }

  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
}

function CompleteProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    name: '',
    documentType: 'cpf' as DocumentType,
    document: '',
    birthDate: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    phone: '',
    acceptTerms: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadProfileContext() {
      const supabase = createClient();
      const [userResult, sessionResult] = await Promise.all([
        supabase.auth.getUser(),
        supabase.auth.getSession(),
      ]);

      if (!isMounted) {
        return;
      }

      if (userResult.error || sessionResult.error || !userResult.data.user || !sessionResult.data.session) {
        router.replace('/login?error=auth-callback');
        return;
      }

      const pendingRegistration = getPendingRegistration();
      const user = userResult.data.user;
      const matchesCurrentUser = !pendingRegistration?.email || !user.email || pendingRegistration.email === user.email;

      if (pendingRegistration && !matchesCurrentUser) {
        clearPendingRegistration();
      }

      const resolvedPendingRegistration = matchesCurrentUser ? pendingRegistration : null;
      const documentType = resolvedPendingRegistration?.documentType ?? 'cpf';
      const documentValue = resolvedPendingRegistration?.document ?? '';
      const pendingName = resolvedPendingRegistration?.name?.trim();
      const pendingEmail = resolvedPendingRegistration?.email?.trim();

      setEmail(pendingEmail || user.email || '');
      setForm((current) => ({
        ...current,
        name: pendingName || getSupabaseDisplayName(user),
        documentType,
        document: documentType === 'cnpj' ? maskCNPJ(documentValue) : maskCPF(documentValue),
        birthDate: resolvedPendingRegistration?.birthDate ?? '',
        cep: resolvedPendingRegistration?.address?.cep ? maskCEP(resolvedPendingRegistration.address.cep) : '',
        street: resolvedPendingRegistration?.address?.street ?? '',
        number: resolvedPendingRegistration?.address?.number ?? '',
        complement: resolvedPendingRegistration?.address?.complement ?? '',
        neighborhood: resolvedPendingRegistration?.address?.neighborhood ?? '',
        city: resolvedPendingRegistration?.address?.city ?? '',
        state: resolvedPendingRegistration?.address?.state ?? '',
        phone: resolvedPendingRegistration?.phone ? maskPhone(resolvedPendingRegistration.phone) : '',
      }));
      setIsPageLoading(false);
    }

    loadProfileContext();

    return () => {
      isMounted = false;
    };
  }, [router]);

  function updateField(field: string, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => ({ ...current, [field]: '' }));
    setError('');
  }

  async function handleCepChange(rawValue: string) {
    const masked = maskCEP(rawValue);
    updateField('cep', masked);

    const digits = masked.replace(/\D/g, '');
    if (digits.length !== 8) {
      return;
    }

    setIsCepLoading(true);
    const result = await fetchCep(digits);
    setIsCepLoading(false);

    if (!result) {
      setFormErrors((current) => ({ ...current, cep: 'CEP não encontrado' }));
      return;
    }

    setForm((current) => ({
      ...current,
      street: result.street || current.street,
      neighborhood: result.neighborhood || current.neighborhood,
      city: result.city || current.city,
      state: result.state || current.state,
    }));
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Nome é obrigatório';
    } else if (form.name.trim().split(/\s+/).length < 2) {
      nextErrors.name = 'Informe nome e sobrenome';
    }

    if (form.documentType === 'cpf') {
      if (!isValidCPF(form.document)) {
        nextErrors.document = 'CPF inválido';
      }
    } else if (!isValidCNPJ(form.document)) {
      nextErrors.document = 'CNPJ inválido';
    }

    if (!form.birthDate) {
      nextErrors.birthDate = 'Data de nascimento é obrigatória';
    } else {
      const age = getAge(form.birthDate);
      if (age !== null && age < 18) {
        nextErrors.birthDate = 'Você deve ter pelo menos 18 anos';
      }
    }

    if (form.phone && !isValidPhone(form.phone)) {
      nextErrors.phone = 'Telefone inválido';
    }

    if (form.cep.replace(/\D/g, '').length !== 8) {
      nextErrors.cep = 'CEP inválido';
    }
    if (!form.street.trim()) {
      nextErrors.street = 'Rua é obrigatória';
    }
    if (!form.number.trim()) {
      nextErrors.number = 'Número é obrigatório';
    }
    if (!form.neighborhood.trim()) {
      nextErrors.neighborhood = 'Bairro é obrigatório';
    }
    if (!form.city.trim()) {
      nextErrors.city = 'Cidade é obrigatória';
    }
    if (!form.state.trim()) {
      nextErrors.state = 'Estado é obrigatório';
    }
    if (!form.acceptTerms) {
      nextErrors.acceptTerms = 'Você deve aceitar os termos para continuar.';
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    const supabase = createClient();
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      router.replace('/login?error=auth-callback');
      return;
    }

    try {
      const availability = await authService.checkAvailability({
        document: form.document.replace(/\D/g, ''),
      });

      if (!availability.data.documentAvailable) {
        setFormErrors((current) => ({ ...current, document: 'Este CPF/CNPJ já está em uso' }));
        return;
      }

      const result = await authService.supabaseRegister(session.access_token, {
        name: form.name.trim(),
        phone: form.phone.replace(/\D/g, ''),
        documentType: form.documentType,
        document: form.document.replace(/\D/g, ''),
        birthDate: form.birthDate || undefined,
        address: {
          cep: form.cep.replace(/\D/g, ''),
          street: form.street.trim(),
          number: form.number.trim(),
          complement: form.complement.trim(),
          neighborhood: form.neighborhood.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
        },
      });

      clearPendingRegistration();
      persistBackendToken(result.data.token);
      router.replace(sanitizeNext(searchParams.get('next')));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Não foi possível concluir seu cadastro.');
    } finally {
      setIsLoading(false);
    }
  }

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#0c1322_0%,#141b2b_100%)] px-4 py-8">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center justify-center">
          <div className="w-full rounded-2xl border border-white/10 bg-[rgba(20,27,43,0.92)] p-8 text-center text-sm text-[#b9c6eb] shadow-2xl">
            Validando sua sessão e carregando seus dados...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0c1322_0%,#141b2b_100%)] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-white/10 bg-[rgba(20,27,43,0.92)] p-6 shadow-2xl sm:p-8">
          <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Último passo
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-[#dce2f7]">Complete seu cadastro</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-[#8f9097]">
                Sua autenticação já está pronta. Falta apenas preencher os dados obrigatórios para liberar o acesso completo ao Nautify.
              </p>
            </div>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <section className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input
                  label="Nome completo"
                  value={form.name}
                  onChange={(event) => updateField('name', event.target.value)}
                  error={formErrors.name}
                  className="border-white/10 bg-white/5 text-white placeholder:text-[#8f9097]"
                />
              </div>

              <div className="relative">
                <Input
                  label="E-mail"
                  value={email}
                  disabled
                  className="border-white/10 bg-white/5 pl-10 text-white/80"
                />
                <Mail className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-[#8f9097]" />
              </div>

              <div className="relative">
                <Input
                  label="Telefone"
                  value={form.phone}
                  onChange={(event) => updateField('phone', maskPhone(event.target.value))}
                  error={formErrors.phone}
                  placeholder="(11) 99999-9999"
                  className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-[#8f9097]"
                />
                <Phone className="pointer-events-none absolute left-3 top-[38px] h-4 w-4 text-[#8f9097]" />
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <Select
                label="Tipo de documento"
                value={form.documentType}
                onChange={(event) => {
                  const documentType = event.target.value as DocumentType;
                  updateField('documentType', documentType);
                  updateField('document', '');
                }}
                className="border-white/10 bg-white/5 text-white"
              >
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
              </Select>

              <div className="md:col-span-2">
                <Input
                  label={form.documentType === 'cpf' ? 'CPF' : 'CNPJ'}
                  value={form.document}
                  onChange={(event) => updateField('document', form.documentType === 'cpf' ? maskCPF(event.target.value) : maskCNPJ(event.target.value))}
                  error={formErrors.document}
                  placeholder={form.documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                  className="border-white/10 bg-white/5 text-white placeholder:text-[#8f9097]"
                />
              </div>

              <div className="md:col-span-1">
                <Input
                  label="Data de nascimento"
                  type="date"
                  value={form.birthDate}
                  onChange={(event) => updateField('birthDate', event.target.value)}
                  error={formErrors.birthDate}
                  className="border-white/10 bg-white/5 text-white"
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-[#dce2f7]">
                <MapPin className="h-4 w-4 text-[#eec068]" />
                Endereço principal
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-1">
                  <Input
                    label="CEP"
                    value={form.cep}
                    onChange={(event) => {
                      void handleCepChange(event.target.value);
                    }}
                    error={formErrors.cep}
                    placeholder="00000-000"
                    className="border-white/10 bg-white/5 text-white placeholder:text-[#8f9097]"
                    helperText={isCepLoading ? 'Buscando endereço...' : undefined}
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Rua"
                    value={form.street}
                    onChange={(event) => updateField('street', event.target.value)}
                    error={formErrors.street}
                    className="border-white/10 bg-white/5 text-white placeholder:text-[#8f9097]"
                  />
                </div>

                <Input
                  label="Número"
                  value={form.number}
                  onChange={(event) => updateField('number', event.target.value)}
                  error={formErrors.number}
                  className="border-white/10 bg-white/5 text-white placeholder:text-[#8f9097]"
                />

                <Input
                  label="Complemento"
                  value={form.complement}
                  onChange={(event) => updateField('complement', event.target.value)}
                  className="border-white/10 bg-white/5 text-white placeholder:text-[#8f9097]"
                />

                <Input
                  label="Bairro"
                  value={form.neighborhood}
                  onChange={(event) => updateField('neighborhood', event.target.value)}
                  error={formErrors.neighborhood}
                  className="border-white/10 bg-white/5 text-white placeholder:text-[#8f9097]"
                />

                <div className="md:col-span-2">
                  <CityAutocomplete
                    label="Cidade"
                    value={form.city}
                    onChange={(value) => updateField('city', value)}
                    onSelectCity={(city, state) => {
                      updateField('city', city);
                      updateField('state', state);
                    }}
                    error={formErrors.city}
                    placeholder="Digite sua cidade"
                  />
                </div>

                <Input
                  label="Estado"
                  value={form.state}
                  onChange={(event) => updateField('state', event.target.value.toUpperCase().slice(0, 2))}
                  error={formErrors.state}
                  placeholder="UF"
                  className="border-white/10 bg-white/5 text-white placeholder:text-[#8f9097]"
                />
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-[#dce2f7]">
                <Shield className="h-4 w-4 text-[#eec068]" />
                Termos e políticas
              </div>
              <p className="text-sm leading-relaxed text-[#8f9097]">
                Para concluir seu acesso, aceite os documentos legais da plataforma.
              </p>
              <div className="flex flex-wrap gap-3 text-sm">
                <Link href="/termos/uso" target="_blank" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[#dce2f7] transition-colors hover:border-[#eec068]/50 hover:text-white">
                  <FileText className="h-3.5 w-3.5" />
                  Termos de Uso
                </Link>
                <Link href="/termos/privacidade" target="_blank" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[#dce2f7] transition-colors hover:border-[#eec068]/50 hover:text-white">
                  <FileText className="h-3.5 w-3.5" />
                  Política de Privacidade
                </Link>
                <Link href="/termos/cadastro-embarcacao" target="_blank" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[#dce2f7] transition-colors hover:border-[#eec068]/50 hover:text-white">
                  <FileText className="h-3.5 w-3.5" />
                  Termo de Cadastro
                </Link>
              </div>
              <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-[rgba(12,19,34,0.6)] p-4 text-sm text-[#dce2f7]">
                <input
                  type="checkbox"
                  checked={form.acceptTerms}
                  onChange={(event) => updateField('acceptTerms', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 accent-[var(--primary)]"
                />
                <span>
                  Li e aceito os Termos de Uso, a Política de Privacidade e o Termo de Cadastro de Embarcação.
                </span>
              </label>
              {formErrors.acceptTerms && <p className="text-xs text-red-300">{formErrors.acceptTerms}</p>}
            </section>

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-[#8f9097]">
                Este cadastro complementa sua autenticação. Nenhum segredo do provedor é salvo no código do app.
              </p>
              <Button type="submit" size="lg" isLoading={isLoading}>
                Finalizar acesso
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[linear-gradient(180deg,#0c1322_0%,#141b2b_100%)]" />}>
      <CompleteProfilePageContent />
    </Suspense>
  );
}
