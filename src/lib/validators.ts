// ============================================
// Validação de CPF e CNPJ com algoritmo oficial
// ============================================

/**
 * Valida um CPF utilizando o algoritmo oficial da Receita Federal.
 * Aceita com ou sem máscara (000.000.000-00 ou 00000000000).
 */
export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;

  // Rejeita sequências repetidas (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // Cálculo do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits.charAt(9))) return false;

  // Cálculo do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits.charAt(10))) return false;

  return true;
}

/**
 * Valida um CNPJ utilizando o algoritmo oficial da Receita Federal.
 * Aceita com ou sem máscara (00.000.000/0000-00 ou 00000000000000).
 */
export function isValidCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;

  // Rejeita sequências repetidas
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  // Cálculo do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits.charAt(i)) * weights1[i];
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  if (firstDigit !== parseInt(digits.charAt(12))) return false;

  // Cálculo do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(digits.charAt(i)) * weights2[i];
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  if (secondDigit !== parseInt(digits.charAt(13))) return false;

  return true;
}

/**
 * Valida um e-mail com regex mais completa.
 */
export function isValidEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

/**
 * Valida um CEP (8 dígitos).
 */
export function isValidCEP(cep: string): boolean {
  return cep.replace(/\D/g, '').length === 8;
}

/**
 * Valida um telefone brasileiro (10 ou 11 dígitos).
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

/**
 * Valida força da senha.
 * Retorna um objeto com nível e requisitos atendidos.
 */
export function getPasswordStrength(password: string): {
  score: number; // 0-4
  label: string;
  color: string;
  checks: {
    minLength: boolean;
    hasUpper: boolean;
    hasLower: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
} {
  const checks = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;

  const levels: Record<number, { label: string; color: string }> = {
    0: { label: '', color: '' },
    1: { label: 'Muito fraca', color: 'bg-red-500' },
    2: { label: 'Fraca', color: 'bg-orange-500' },
    3: { label: 'Média', color: 'bg-amber-500' },
    4: { label: 'Forte', color: 'bg-emerald-500' },
    5: { label: 'Muito forte', color: 'bg-emerald-600' },
  };

  return { score, ...levels[score], checks };
}
