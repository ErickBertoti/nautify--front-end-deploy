'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  User,
  MapPin,
  Lock,
  FileText,
  Mail,
  Phone,
  Eye,
  EyeOff,
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Hash,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { fetchCep } from '@/lib/cep';
import { CityAutocomplete } from '@/components/shared/CityAutocomplete';
import { isValidCPF, isValidCNPJ, isValidEmail, isValidPhone, getPasswordStrength } from '@/lib/validators';
import { PasswordStrengthBar } from '@/components/shared/PasswordStrengthBar';
import { createClient } from '@/utils/supabase/client';
import { authService } from '@/services';

// ============================================
// Masks
// ============================================
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

function maskPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

// ============================================
// Constants (outside component — stable refs)
// ============================================
const STEPS = [
  { number: 1, label: 'Pessoal' },
  { number: 2, label: 'Endereço' },
  { number: 3, label: 'Segurança' },
  { number: 4, label: 'Termos' },
];

// ============================================
// Component
// ============================================
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [readDocs, setReadDocs] = useState({ uso: false, privacidade: false, cadastro: false });
  const [openTerm, setOpenTerm] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    documentType: 'cpf' as 'cpf' | 'cnpj',
    document: '',
    birthDate: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [isCepLoading, setIsCepLoading] = useState(false);

  async function handleCepChange(rawValue: string) {
    const masked = maskCEP(rawValue);
    updateField('cep', masked);
    const digits = masked.replace(/\D/g, '');
    if (digits.length === 8) {
      setIsCepLoading(true);
      const result = await fetchCep(digits);
      setIsCepLoading(false);
      if (result) {
        setForm((prev) => ({
          ...prev,
          street: result.street || prev.street,
          neighborhood: result.neighborhood || prev.neighborhood,
          city: result.city || prev.city,
          state: result.state || prev.state,
        }));
        setErrors((prev) => ({
          ...prev,
          street: '',
          neighborhood: '',
          city: '',
          state: '',
          cep: '',
        }));
      } else {
        setErrors((prev) => ({ ...prev, cep: 'CEP não encontrado' }));
      }
    }
  }

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function getAge(): number | null {
    if (!form.birthDate) return null;
    const birth = new Date(form.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  function validateStep(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.name.trim()) e.name = 'Nome é obrigatório';
      else if (form.name.trim().split(/\s+/).length < 2) e.name = 'Informe nome e sobrenome';
      if (form.documentType === 'cpf') {
        if (!isValidCPF(form.document)) e.document = 'CPF inválido';
      } else {
        if (!isValidCNPJ(form.document)) e.document = 'CNPJ inválido';
      }
      if (!form.birthDate) e.birthDate = 'Data de nascimento é obrigatória';
      else {
        const age = getAge();
        if (age !== null && age < 18) e.birthDate = 'Você deve ter pelo menos 18 anos';
      }
    }
    if (s === 2) {
      if (form.cep.replace(/\D/g, '').length !== 8) e.cep = 'CEP inválido';
      if (!form.street.trim()) e.street = 'Rua é obrigatória';
      if (!form.number.trim()) e.number = 'Número é obrigatório';
      if (!form.neighborhood.trim()) e.neighborhood = 'Bairro é obrigatório';
      if (!form.city.trim()) e.city = 'Cidade é obrigatória';
      if (!form.state) e.state = 'Estado é obrigatório';
    }
    if (s === 3) {
      if (!form.email.trim()) e.email = 'E-mail é obrigatório';
      else if (!isValidEmail(form.email)) e.email = 'E-mail inválido';
      if (form.phone && !isValidPhone(form.phone)) e.phone = 'Telefone inválido';
      const strength = getPasswordStrength(form.password);
      if (!form.password) e.password = 'Senha é obrigatória';
      else if (strength.score < 3) e.password = 'Senha muito fraca — atenda pelo menos 3 requisitos';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'As senhas não coincidem';
    }
    if (s === 4) {
      if (!form.acceptTerms) e.acceptTerms = 'Você deve aceitar os termos e políticas para concluir o cadastro.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) setStep((prev) => Math.min(prev + 1, 4));
  }

  function prevStep() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSubmit() {
    if (!validateStep(4)) return;
    setIsLoading(true);
    setSubmitError('');

    try {
      // Verificar disponibilidade de email e CPF
      try {
        const { data: availability } = await authService.checkAvailability({
          email: form.email,
          document: form.document.replace(/\D/g, ''),
        });
        if (!availability.emailAvailable) {
          setErrors({ email: 'Este email já está em uso' });
          setStep(3); // Go back to the step with email
          setIsLoading(false);
          return;
        }
        if (!availability.documentAvailable) {
          setErrors({ document: 'Este CPF/CNPJ já está em uso' });
          setStep(1); // Go back to step with document
          setIsLoading(false);
          return;
        }
      } catch {
        // If check fails, proceed anyway (backend will catch it)
      }

      const supabase = createClient();
      const { data, error: sbError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (sbError) {
        setSubmitError(sbError.message === 'User already registered'
          ? 'Este e-mail já está cadastrado'
          : sbError.message);
        setIsLoading(false);
        return;
      }

      if (!data.session) {
        // Salva dados do formulário para completar registro após verificação de email
        localStorage.setItem('nautify_pending_registration', JSON.stringify({
          name: form.name,
          phone: form.phone.replace(/\D/g, ''),
          documentType: form.documentType,
          document: form.document.replace(/\D/g, ''),
          birthDate: form.birthDate || undefined,
          address: {
            cep: form.cep.replace(/\D/g, ''),
            street: form.street,
            number: form.number,
            complement: form.complement,
            neighborhood: form.neighborhood,
            city: form.city,
            state: form.state,
          },
        }));
        setSubmitError('Verifique seu e-mail para confirmar o cadastro e depois faça login.');
        setIsLoading(false);
        return;
      }

      const res = await authService.supabaseRegister(data.session.access_token, {
        name: form.name,
        phone: form.phone.replace(/\D/g, ''),
        documentType: form.documentType,
        document: form.document.replace(/\D/g, ''),
        birthDate: form.birthDate || undefined,
        address: {
          cep: form.cep.replace(/\D/g, ''),
          street: form.street,
          number: form.number,
          complement: form.complement,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state,
        },
      });

      localStorage.setItem('nautify_token', res.data.token);
      router.push('/dashboard');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao criar conta');
      setIsLoading(false);
    }
  }

  const docMask = form.documentType === 'cpf' ? maskCPF : maskCNPJ;
  const docPlaceholder = form.documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00';
  const age = getAge();

  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-nautify-900 via-nautify-950 to-[#0a1128] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 800 800">
            <defs>
              <pattern id="reg-waves" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
                <path d="M0 100 Q50 50 100 100 T200 100" fill="none" stroke="white" strokeWidth="1" />
                <path d="M0 150 Q50 100 100 150 T200 150" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="800" height="800" fill="url(#reg-waves)" />
          </svg>
        </div>

        {/* Decorative circles */}
        <div className="absolute top-16 right-16 w-36 h-36 rounded-full bg-nautify-400/20 blur-3xl animate-fade-in" style={{ animationDelay: '600ms' }} />
        <div className="absolute bottom-24 right-28 w-48 h-48 rounded-full bg-primary/20 blur-3xl animate-fade-in" style={{ animationDelay: '800ms' }} />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-nautify-300/10 blur-2xl animate-fade-in" style={{ animationDelay: '1000ms' }} />

        <div className="relative z-10 flex flex-col justify-center px-16 animate-stagger">
          <div className="flex items-center gap-3 mb-8">
            <Image src="/logo-white.png" alt="Nautify" width={56} height={56} className="drop-shadow-lg" />
            <div>
              <h1 className="text-3xl font-bold text-white tracking-wide">Nautify</h1>
              <p className="text-sm text-accent-gold-foreground/90 uppercase tracking-widest font-medium">Gestão Náutica</p>
            </div>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-4">
            Comece a gerenciar<br />sua embarcação<br />
            <span className="text-accent-gold italic pr-2">de forma profissional</span>
          </h2>
          <p className="text-lg text-nautify-200/80 max-w-md">
            Crie sua conta gratuita e adicione sua primeira embarcação em minutos.
          </p>

          <div className="mt-12 space-y-3">
            {STEPS.map((s) => (
              <div
                key={s.number}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300',
                  step === s.number ? 'bg-white/10 text-white' :
                    step > s.number ? 'text-nautify-400' : 'text-nautify-700'
                )}
              >
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300',
                  step > s.number ? 'bg-accent-gold/20 text-accent-gold' :
                    step === s.number ? 'bg-white/20 text-white' : 'bg-white/5 text-nautify-700'
                )}>
                  {step > s.number ? <Check className="h-3.5 w-3.5" /> : s.number}
                </div>
                <span className="text-sm font-medium">{s.label}</span>
                {step === s.number && <ChevronRight className="h-4 w-4 ml-auto animate-fade-in" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col justify-center px-5 py-6 sm:px-6 sm:py-8 overflow-y-auto relative z-10 bg-grid-pattern">
        <div className="w-full max-w-lg mx-auto glass-panel rounded-2xl p-6 sm:p-8 border-t border-t-white/40 shadow-2xl">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-6 lg:hidden animate-fade-up">
            <div className="p-2 rounded-xl bg-primary/10">
              <Image src="/logo-blue.png" alt="Nautify" width={32} height={32} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Nautify</h1>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8 gap-1 sm:gap-3 animate-fade-up" style={{ animationDelay: '50ms' }}>
            {STEPS.map((s, i) => (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center gap-1">
                  <div className={cn(
                    'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold',
                    'transition-all duration-300 ease-out',
                    step > s.number ? 'bg-success text-success-foreground scale-100' :
                      step === s.number ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-110' :
                        'bg-muted text-muted-foreground scale-100'
                  )}>
                    {step > s.number ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : s.number}
                  </div>
                  <span className={cn(
                    'text-[10px] sm:text-xs font-medium transition-colors duration-300',
                    step === s.number ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 rounded-full bg-muted overflow-hidden">
                    <div className={cn(
                      'h-full rounded-full transition-all duration-500 ease-out',
                      step > s.number ? 'w-full bg-success' : 'w-0 bg-success'
                    )} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ── Step 1: Dados Pessoais ── */}
          {step === 1 && (
            <div key="step-1" className="space-y-5 animate-step-enter">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Dados Pessoais</h2>
                <p className="text-muted-foreground mt-1">Informações básicas sobre você</p>
              </div>

              <div className="relative">
                <Input
                  label="Nome completo"
                  placeholder="Seu nome completo"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  error={errors.name}
                  className="pl-10"
                />
                <User className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Tipo de documento
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { updateField('documentType', 'cpf'); updateField('document', ''); }}
                    className={cn(
                      'flex-1 py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium border transition-all cursor-pointer',
                      form.documentType === 'cpf'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-input bg-transparent text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    <span className="sm:hidden">CPF</span>
                    <span className="hidden sm:inline">CPF — Física</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { updateField('documentType', 'cnpj'); updateField('document', ''); }}
                    className={cn(
                      'flex-1 py-2.5 px-3 sm:px-4 rounded-lg text-xs sm:text-sm font-medium border transition-all cursor-pointer',
                      form.documentType === 'cnpj'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-input bg-transparent text-muted-foreground hover:border-primary/50'
                    )}
                  >
                    <span className="sm:hidden">CNPJ</span>
                    <span className="hidden sm:inline">CNPJ — Jurídica</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <Input
                  label={form.documentType === 'cpf' ? 'CPF' : 'CNPJ'}
                  placeholder={docPlaceholder}
                  value={form.document}
                  onChange={(e) => updateField('document', docMask(e.target.value))}
                  error={errors.document}
                  className="pl-10"
                />
                <Hash className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <Input
                    label="Data de nascimento"
                    type="date"
                    value={form.birthDate}
                    onChange={(e) => updateField('birthDate', e.target.value)}
                    error={errors.birthDate}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex items-end">
                  {form.birthDate && age !== null && (
                    <div className="flex items-center gap-2 h-10 px-4 rounded-lg bg-muted text-sm text-foreground w-full">
                      <span className="text-muted-foreground">Idade:</span>
                      <span className="font-semibold">{age} anos</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Endereço ── */}
          {step === 2 && (
            <div key="step-2" className="space-y-5 animate-step-enter">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Endereço</h2>
                <p className="text-muted-foreground mt-1">Informe seu endereço completo</p>
              </div>

              <div className="relative">
                <Input
                  label="CEP"
                  placeholder="00000-000"
                  value={form.cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  error={errors.cep}
                  className="pl-10 pr-10"
                />
                <MapPin className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
                {isCepLoading && (
                  <Loader2 className="absolute right-3 top-[38px] h-4 w-4 text-muted-foreground animate-spin" />
                )}
              </div>

              <Input
                label="Rua"
                placeholder="Nome da rua"
                value={form.street}
                onChange={(e) => updateField('street', e.target.value)}
                error={errors.street}
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-1">
                  <Input
                    label="Número"
                    placeholder="123"
                    value={form.number}
                    onChange={(e) => updateField('number', e.target.value)}
                    error={errors.number}
                  />
                </div>
                <div className="col-span-1 sm:col-span-3">
                  <Input
                    label="Complemento"
                    placeholder="Apto, Bloco (opcional)"
                    value={form.complement}
                    onChange={(e) => updateField('complement', e.target.value)}
                  />
                </div>
              </div>

              <Input
                label="Bairro"
                placeholder="Nome do bairro"
                value={form.neighborhood}
                onChange={(e) => updateField('neighborhood', e.target.value)}
                error={errors.neighborhood}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <CityAutocomplete
                  label="Cidade"
                  value={form.city}
                  onChange={(city) => updateField('city', city)}
                  onSelectCity={(city, uf) => {
                    updateField('city', city);
                    updateField('state', uf);
                  }}
                  error={errors.city}
                />
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-foreground">Estado</label>
                  <div
                    className={cn(
                      'flex h-10 w-full items-center rounded-lg border border-input bg-muted/50 px-3 text-sm',
                      !form.state && 'text-muted-foreground',
                      errors.state && 'border-destructive'
                    )}
                  >
                    {form.state || 'Preenchido automaticamente'}
                  </div>
                  {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Segurança ── */}
          {step === 3 && (
            <div key="step-3" className="space-y-5 animate-step-enter">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Segurança</h2>
                <p className="text-muted-foreground mt-1">Dados de acesso e contato</p>
              </div>

              <div className="relative">
                <Input
                  label="E-mail"
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  error={errors.email}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
              </div>

              <div className="relative">
                <Input
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  value={form.phone}
                  onChange={(e) => updateField('phone', maskPhone(e.target.value))}
                  error={errors.phone}
                  className="pl-10"
                />
                <Phone className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
              </div>

              <div className="relative">
                <Input
                  label="Senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  value={form.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  error={errors.password}
                  className="pl-10 pr-10"
                />
                <Lock className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <PasswordStrengthBar password={form.password} />

              <div className="relative">
                <Input
                  label="Confirmar senha"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  value={form.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  error={errors.confirmPassword}
                  className="pl-10 pr-10"
                />
                <Lock className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Termos ── */}
          {step === 4 && (
            <div key="step-4" className="space-y-5 animate-step-enter">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Termos e Políticas</h2>
                <p className="text-muted-foreground mt-1">Leia e aceite para finalizar seu cadastro</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-input bg-muted/30 p-5 sm:p-6 text-sm text-muted-foreground leading-relaxed shadow-sm">
                  <p className="mb-4">
                    Para utilizar a plataforma Nautify, você precisa concordar com nossos documentos legais que regulamentam o uso do sistema, a proteção dos seus dados e as responsabilidades envolvidas.
                  </p>
                  
                  <div className="mt-6 pt-6 border-t border-input/50">
                    <label className={cn(
                      "flex items-start gap-4 cursor-pointer group hover:bg-background/80 p-3 -mx-3 rounded-lg transition-colors",
                      (!readDocs.uso || !readDocs.privacidade || !readDocs.cadastro) && "opacity-60 cursor-not-allowed hover:bg-transparent"
                    )}>
                      <input
                        type="checkbox"
                        checked={form.acceptTerms}
                        onChange={(e) => updateField('acceptTerms', e.target.checked)}
                        disabled={!readDocs.uso || !readDocs.privacidade || !readDocs.cadastro}
                        className="mt-0.5 h-5 w-5 rounded border-input accent-primary cursor-pointer shrink-0 transition-all focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed"
                      />
                      <span className="text-sm text-foreground">
                        Li e aceito os{' '}
                        <button type="button" onClick={(e) => { e.preventDefault(); setOpenTerm('uso'); setReadDocs(p => ({...p, uso: true})); }} className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer">
                          Termos de Uso
                        </button>
                        , a{' '}
                        <button type="button" onClick={(e) => { e.preventDefault(); setOpenTerm('privacidade'); setReadDocs(p => ({...p, privacidade: true})); }} className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer">
                          Política de Privacidade
                        </button>{' '}
                        e o{' '}
                        <button type="button" onClick={(e) => { e.preventDefault(); setOpenTerm('cadastro'); setReadDocs(p => ({...p, cadastro: true})); }} className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors cursor-pointer">
                          Termo de Cadastro de Embarcação
                        </button>
                      </span>
                    </label>
                    {(!readDocs.uso || !readDocs.privacidade || !readDocs.cadastro) && (
                      <p className="text-xs text-muted-foreground mt-2 ml-1 animate-fade-in fade-in-50">
                        * Clique nos três termos acima para ler e liberar a opção de aceite.
                      </p>
                    )}
                    {errors.acceptTerms && (
                      <p className="text-sm font-medium text-destructive mt-3 flex items-center gap-1.5 bg-destructive/10 text-destructive px-3 py-2 rounded-md animate-fade-in">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                        {errors.acceptTerms}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {submitError && (
            <p className="mt-4 text-sm text-destructive text-center">{submitError}</p>
          )}

          {/* ── Navigation ── */}
          <div className="flex gap-3 mt-8 animate-fade-up" style={{ animationDelay: '150ms' }}>
            {step > 1 && (
              <Button variant="outline" onClick={prevStep} size="lg">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Voltar
              </Button>
            )}
            {step < 4 ? (
              <Button onClick={nextStep} className="flex-1" size="lg">
                Continuar
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="flex-1" size="lg" isLoading={isLoading}>
                Criar conta
              </Button>
            )}
          </div>

          <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '300ms' }}>
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary font-medium hover:underline hover:text-primary/80 transition-colors">
                Fazer login
              </Link>
            </p>
          </div>

        </div>

        {/* ── Terms Modal ── */}
        <Modal
          isOpen={openTerm !== null}
          onClose={() => setOpenTerm(null)}
          title={
            openTerm === 'uso' ? 'Termos de Uso' :
            openTerm === 'privacidade' ? 'Política de Privacidade' :
            openTerm === 'cadastro' ? 'Termo de Cadastro de Embarcação' :
            ''
          }
          className="max-w-2xl"
        >
          <div className="max-h-[60vh] overflow-y-auto prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
            {openTerm === 'uso' && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">1. Sobre a Plataforma</h2>
                  <p>
                    A Nautify é uma plataforma digital voltada ao gerenciamento de embarcações, permitindo que usuários cadastrem, organizem e acompanhem informações relacionadas aos seus bens náuticos.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">2. Aceitação dos Termos</h2>
                  <p>
                    Ao criar uma conta, o usuário declara que leu, entendeu e concorda integralmente com estes Termos de Uso.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">3. Cadastro de Conta</h2>
                  <p className="mb-2">
                    O usuário se compromete a fornecer informações verdadeiras, atualizadas e completas no momento do cadastro, sendo o único responsável pelos dados informados.
                  </p>
                  <p>
                    A Nautify não se responsabiliza por informações incorretas fornecidas pelo usuário.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">4. Uso da Plataforma</h2>
                  <p className="mb-2">O usuário concorda em utilizar a plataforma de forma legal, ética e de acordo com sua finalidade, sendo proibido:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Inserir dados falsos ou enganosos</li>
                    <li>Utilizar a plataforma para fins ilícitos</li>
                    <li>Tentar invadir, modificar ou prejudicar o sistema</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">5. Planos e Pagamentos</h2>
                  <p className="mb-2">A Nautify poderá oferecer planos pagos mensais, semestrais e anuais.</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Os pagamentos são recorrentes, podendo ser processados por plataformas terceiras</li>
                    <li>A renovação ocorre automaticamente ao final do período contratado</li>
                    <li>O não pagamento poderá resultar na suspensão ou cancelamento da conta</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">6. Cancelamento</h2>
                  <p>
                    O usuário poderá cancelar sua assinatura a qualquer momento. O cancelamento impede novas cobranças, mas não garante reembolso de valores já pagos.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">7. Limitação de Responsabilidade</h2>
                  <p className="mb-2">A Nautify não garante disponibilidade contínua da plataforma e não se responsabiliza por:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Perdas financeiras</li>
                    <li>Dados inseridos incorretamente pelo usuário</li>
                    <li>Decisões tomadas com base nas informações da plataforma</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">8. Suspensão ou Encerramento de Conta</h2>
                  <p className="mb-2">A Nautify poderá suspender ou encerrar contas em caso de:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Violação destes termos</li>
                    <li>Suspeita de fraude ou uso indevido</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">9. Modificações nos Termos</h2>
                  <p>
                    Os termos podem ser alterados a qualquer momento, sendo responsabilidade do usuário revisá-los periodicamente.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">10. Foro</h2>
                  <p>
                    Fica eleito o foro da comarca do usuário para resolução de eventuais conflitos.
                  </p>
                </section>
              </div>
            )}

            {openTerm === 'privacidade' && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">1. Coleta de Dados</h2>
                  <p className="mb-2">Coletamos dados fornecidos pelo usuário, como:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Nome</li>
                    <li>E-mail</li>
                    <li>Telefone</li>
                    <li>Informações de embarcações cadastradas</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">2. Uso das Informações</h2>
                  <p className="mb-2">Os dados são utilizados para:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Operação da plataforma</li>
                    <li>Gestão das embarcações</li>
                    <li>Comunicação com o usuário</li>
                    <li>Processamento de pagamentos</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">3. Compartilhamento de Dados</h2>
                  <p>
                    Os dados podem ser compartilhados com terceiros quando necessário, como plataformas de pagamento (ex: Asaas), sempre respeitando a legislação vigente.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">4. Segurança</h2>
                  <p>
                    Adotamos medidas para proteger os dados, mas não garantimos segurança absoluta contra acessos indevidos.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">5. Direitos do Usuário (LGPD)</h2>
                  <p className="mb-2">O usuário pode:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Solicitar acesso aos dados</li>
                    <li>Corrigir informações</li>
                    <li>Solicitar exclusão da conta</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">6. Retenção de Dados</h2>
                  <p>
                    Os dados serão armazenados enquanto a conta estiver ativa ou conforme necessário para cumprimento legal.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">7. Alterações</h2>
                  <p>
                    Esta política pode ser atualizada a qualquer momento.
                  </p>
                </section>
              </div>
            )}

            {openTerm === 'cadastro' && (
              <div>
                <p className="mb-4 text-foreground font-medium">Ao cadastrar uma embarcação na plataforma Nautify, o usuário declara que:</p>

                <ol className="list-decimal pl-6 mb-8 space-y-2">
                  <li>É o proprietário da embarcação ou possui autorização legal para cadastrá-la</li>
                  <li>Todas as informações fornecidas são verdadeiras e atualizadas</li>
                  <li>Assume total responsabilidade pelos dados inseridos</li>
                </ol>

                <p className="mb-4 text-foreground font-medium">A Nautify não realiza validação de propriedade e não se responsabiliza por:</p>

                <ul className="list-disc pl-6 mb-8 space-y-2">
                  <li>Informações incorretas</li>
                  <li>Disputas de propriedade</li>
                  <li>Uso indevido de dados cadastrados</li>
                </ul>

                <p className="mb-4">
                  O usuário concorda que os dados da embarcação poderão ser utilizados dentro da plataforma para fins de gerenciamento.
                </p>

                <p>
                  A Nautify se reserva o direito de remover cadastros suspeitos ou inconsistentes.
                </p>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
}
