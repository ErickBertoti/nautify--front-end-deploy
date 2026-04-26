export function maskPhone(value: string) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

export function formatCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  const numeric = Number(digits) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numeric);
}

export function parseCurrencyInput(value: string) {
  if (!value) {
    return 0;
  }

  const normalized = value
    .replace(/[^\d,-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function currencyToInputValue(value?: number | null) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return '';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
