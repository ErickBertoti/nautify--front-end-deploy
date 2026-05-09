import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined): string {
  const safe = Number.isFinite(value) ? (value as number) : 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(safe);
}

export function formatDecimal(value: number | null | undefined, fractionDigits = 2): string {
  const safe = Number.isFinite(value) ? (value as number) : 0;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(safe);
}

export function parseLocaleNumber(value: FormDataEntryValue | string | null | undefined): number {
  if (value === null || value === undefined) return 0;

  const normalized = String(value)
    .trim()
    .replace(/\s+/g, '')
    .replace(/R\$/gi, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function calculateSplit(totalAmount: number, activeMembers: number): number {
  if (activeMembers === 0) return 0;
  return totalAmount / activeMembers;
}
