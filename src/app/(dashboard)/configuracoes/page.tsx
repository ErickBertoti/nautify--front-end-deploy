'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Hash,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Save,
  Camera,
  Shield,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';

// ============================================
// Masks (same as register)
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

const BR_STATES = [
  { value: 'AC', label: 'AC' }, { value: 'AL', label: 'AL' },
  { value: 'AP', label: 'AP' }, { value: 'AM', label: 'AM' },
  { value: 'BA', label: 'BA' }, { value: 'CE', label: 'CE' },
  { value: 'DF', label: 'DF' }, { value: 'ES', label: 'ES' },
  { value: 'GO', label: 'GO' }, { value: 'MA', label: 'MA' },
  { value: 'MT', label: 'MT' }, { value: 'MS', label: 'MS' },
  { value: 'MG', label: 'MG' }, { value: 'PA', label: 'PA' },
  { value: 'PB', label: 'PB' }, { value: 'PR', label: 'PR' },
  { value: 'PE', label: 'PE' }, { value: 'PI', label: 'PI' },
  { value: 'RJ', label: 'RJ' }, { value: 'RN', label: 'RN' },
  { value: 'RS', label: 'RS' }, { value: 'RO', label: 'RO' },
  { value: 'RR', label: 'RR' }, { value: 'SC', label: 'SC' },
  { value: 'SP', label: 'SP' }, { value: 'SE', label: 'SE' },
  { value: 'TO', label: 'TO' },
];

type TabKey = 'pessoal' | 'endereco' | 'seguranca';

// ============================================
// Component
// ============================================
export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('pessoal');
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Mock user data (will come from API)
  const [profile, setProfile] = useState({
    name: 'Gabriel',
    email: 'gabriel@email.com',
    phone: '(11) 99999-9999',
    documentType: 'cpf' as 'cpf' | 'cnpj',
    document: '000.000.000-00',
    birthDate: '1990-01-15',
    cep: '01001-000',
    street: 'Praça da Sé',
    number: '100',
    complement: '',
    neighborhood: 'Sé',
    city: 'São Paulo',
    state: 'SP',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  function updateProfile(field: string, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setSuccessMessage('');
  }

  function updatePassword(field: string, value: string) {
    setPasswords((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setSuccessMessage('');
  }

  function getAge(): number | null {
    if (!profile.birthDate) return null;
    const birth = new Date(profile.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  function validateAndSave() {
    const e: Record<string, string> = {};

    if (activeTab === 'pessoal') {
      if (!profile.name.trim()) e.name = 'Nome é obrigatório';
      const digits = profile.document.replace(/\D/g, '');
      if (profile.documentType === 'cpf' && digits.length !== 11) e.document = 'CPF inválido';
      if (profile.documentType === 'cnpj' && digits.length !== 14) e.document = 'CNPJ inválido';
      if (!profile.birthDate) e.birthDate = 'Data de nascimento é obrigatória';
      if (!profile.email.trim()) e.email = 'E-mail é obrigatório';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) e.email = 'E-mail inválido';
    }

    if (activeTab === 'endereco') {
      const cepDigits = profile.cep.replace(/\D/g, '');
      if (cepDigits.length !== 8) e.cep = 'CEP inválido';
      if (!profile.street.trim()) e.street = 'Rua é obrigatória';
      if (!profile.number.trim()) e.number = 'Número é obrigatório';
      if (!profile.neighborhood.trim()) e.neighborhood = 'Bairro é obrigatório';
      if (!profile.city.trim()) e.city = 'Cidade é obrigatória';
      if (!profile.state) e.state = 'Estado é obrigatório';
    }

    if (activeTab === 'seguranca') {
      if (!passwords.current) e.current = 'Senha atual é obrigatória';
      if (passwords.newPassword.length < 8) e.newPassword = 'Mínimo 8 caracteres';
      if (passwords.newPassword !== passwords.confirm) e.confirm = 'As senhas não coincidem';
    }

    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setIsSaving(true);
    // TODO: Integrar com API Go
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMessage('Alterações salvas com sucesso!');
      if (activeTab === 'seguranca') {
        setPasswords({ current: '', newPassword: '', confirm: '' });
      }
    }, 1000);
  }

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'pessoal', label: 'Dados Pessoais', icon: User },
    { key: 'endereco', label: 'Endereço', icon: MapPin },
    { key: 'seguranca', label: 'Segurança', icon: Shield },
  ];

  const docMask = profile.documentType === 'cpf' ? maskCPF : maskCNPJ;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie seu perfil e preferências</p>
      </div>

      {/* Profile header card */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-nautify-100 flex items-center justify-center">
                <User className="h-10 w-10 text-nautify-700" />
              </div>
              <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors cursor-pointer">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-success/10 text-success">
                  <div className="w-1.5 h-1.5 rounded-full bg-success" />
                  Conta ativa
                </span>
                <span className="text-xs text-muted-foreground">
                  {profile.documentType.toUpperCase()}: {profile.document}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg overflow-x-auto w-full sm:w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setErrors({});
                setSuccessMessage('');
              }}
              className={cn(
                'flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all cursor-pointer whitespace-nowrap flex-shrink-0',
                activeTab === tab.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title={tab.label}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Success message */}
      {successMessage && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm">
          <Save className="h-4 w-4" />
          {successMessage}
        </div>
      )}

      {/* Tab content */}
      {activeTab === 'pessoal' && (
        <Card>
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>Informações básicas do seu perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="relative">
                <Input
                  label="Nome completo"
                  value={profile.name}
                  onChange={(e) => updateProfile('name', e.target.value)}
                  error={errors.name}
                  className="pl-10"
                />
                <User className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
              </div>

              <div className="relative">
                <Input
                  label="E-mail"
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfile('email', e.target.value)}
                  error={errors.email}
                  className="pl-10"
                />
                <Mail className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Tipo de documento
              </label>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateProfile('documentType', 'cpf');
                    updateProfile('document', '');
                  }}
                  className={cn(
                    'py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium border transition-all cursor-pointer',
                    profile.documentType === 'cpf'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input bg-transparent text-muted-foreground hover:border-primary/50'
                  )}
                >
                  CPF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateProfile('documentType', 'cnpj');
                    updateProfile('document', '');
                  }}
                  className={cn(
                    'py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium border transition-all cursor-pointer',
                    profile.documentType === 'cnpj'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input bg-transparent text-muted-foreground hover:border-primary/50'
                  )}
                >
                  CNPJ
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="relative">
                <Input
                  label={profile.documentType === 'cpf' ? 'CPF' : 'CNPJ'}
                  value={profile.document}
                  onChange={(e) => updateProfile('document', docMask(e.target.value))}
                  error={errors.document}
                  className="pl-10"
                  placeholder={
                    profile.documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'
                  }
                />
                <Hash className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
              </div>

              <div>
                <div className="relative">
                  <Input
                    label="Data de nascimento"
                    type="date"
                    value={profile.birthDate}
                    onChange={(e) => updateProfile('birthDate', e.target.value)}
                    error={errors.birthDate}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
                </div>
                {profile.birthDate && getAge() !== null && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Idade: <span className="font-semibold text-foreground">{getAge()} anos</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={validateAndSave} isLoading={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Salvar alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'endereco' && (
        <Card>
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>Seu endereço completo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="relative">
                <Input
                  label="CEP"
                  placeholder="00000-000"
                  value={profile.cep}
                  onChange={(e) => updateProfile('cep', maskCEP(e.target.value))}
                  error={errors.cep}
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
              </div>
              <div className="lg:col-span-2">
                <Input
                  label="Rua"
                  placeholder="Nome da rua"
                  value={profile.street}
                  onChange={(e) => updateProfile('street', e.target.value)}
                  error={errors.street}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <Input
                label="Número"
                placeholder="123"
                value={profile.number}
                onChange={(e) => updateProfile('number', e.target.value)}
                error={errors.number}
              />
              <div className="lg:col-span-3">
                <Input
                  label="Complemento"
                  placeholder="Apto, Bloco (opcional)"
                  value={profile.complement}
                  onChange={(e) => updateProfile('complement', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Input
                label="Bairro"
                placeholder="Nome do bairro"
                value={profile.neighborhood}
                onChange={(e) => updateProfile('neighborhood', e.target.value)}
                error={errors.neighborhood}
              />
              <Input
                label="Cidade"
                placeholder="Nome da cidade"
                value={profile.city}
                onChange={(e) => updateProfile('city', e.target.value)}
                error={errors.city}
              />
            </div>

            <Select
              label="Estado"
              placeholder="Selecione"
              value={profile.state}
              onChange={(e) => updateProfile('state', e.target.value)}
              options={BR_STATES}
              error={errors.state}
            />

            <div className="flex justify-end pt-2">
              <Button onClick={validateAndSave} isLoading={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                Salvar alterações
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'seguranca' && (
        <Card>
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>Atualize sua senha de acesso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 max-w-md">
            <div className="relative">
              <Input
                label="Senha atual"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Digite sua senha atual"
                value={passwords.current}
                onChange={(e) => updatePassword('current', e.target.value)}
                error={errors.current}
                className="pl-10 pr-10"
              />
              <Lock className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Nova senha"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                value={passwords.newPassword}
                onChange={(e) => updatePassword('newPassword', e.target.value)}
                error={errors.newPassword}
                className="pl-10 pr-10"
              />
              <Lock className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirmar nova senha"
                type="password"
                placeholder="Repita a nova senha"
                value={passwords.confirm}
                onChange={(e) => updatePassword('confirm', e.target.value)}
                error={errors.confirm}
                className="pl-10"
              />
              <Lock className="absolute left-3 top-[38px] h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={validateAndSave} isLoading={isSaving}>
                <Shield className="h-4 w-4 mr-2" />
                Alterar senha
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
