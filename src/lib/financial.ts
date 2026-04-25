import type { CashFlowEntry, InstallmentStrategy, PaymentMethod, RefundStatus } from '@/types';

export const PAYMENT_METHOD_OPTIONS: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'pix', label: 'PIX' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'cartao_credito', label: 'Cartão de crédito' },
  { value: 'cartao_debito', label: 'Cartão de débito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'outro', label: 'Outro' },
];

export function getPaymentMethodLabel(method?: PaymentMethod) {
  if (!method) {
    return '—';
  }

  return PAYMENT_METHOD_OPTIONS.find((option) => option.value === method)?.label ?? method;
}

export function getRefundStatusLabel(status?: RefundStatus) {
  switch (status) {
    case 'partial':
      return 'Reembolso parcial';
    case 'full':
      return 'Reembolsado';
    default:
      return 'Sem reembolso';
  }
}

export function getInstallmentStrategyLabel(strategy?: InstallmentStrategy) {
  switch (strategy) {
    case 'generated':
      return 'Gerar parcelas';
    case 'metadata_only':
      return 'Só metadados';
    default:
      return 'À vista';
  }
}

export function getCashFlowSourceLabel(entry: CashFlowEntry) {
  if (entry.relatedExpenseId) {
    return 'Despesa';
  }
  if (entry.relatedRevenueId) {
    return 'Receita';
  }
  if (entry.relatedContributionId) {
    return 'Contribuição';
  }
  return 'Manual';
}
