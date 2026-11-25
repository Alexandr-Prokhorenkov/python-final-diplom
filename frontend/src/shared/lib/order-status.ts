export const ORDER_STATUSES = [
  'new',
  'confirmed',
  'assembled',
  'sent',
  'delivered',
  'canceled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number] | 'basket';

const LABELS: Record<string, string> = {
  basket: 'Корзина',
  new: 'Новый',
  confirmed: 'Подтверждён',
  assembled: 'Собран',
  sent: 'Отправлен',
  delivered: 'Доставлен',
  canceled: 'Отменён',
};

const SEVERITY: Record<string, 'info' | 'success' | 'warn' | 'danger' | 'secondary'> = {
  basket: 'secondary',
  new: 'info',
  confirmed: 'success',
  assembled: 'info',
  sent: 'warn',
  delivered: 'success',
  canceled: 'danger',
};

export function orderStatusLabel(state: string | null | undefined): string {
  if (!state) {
    return '';
  }
  return LABELS[state] ?? state;
}

export function orderStatusSeverity(
  state: string | null | undefined,
): 'info' | 'success' | 'warn' | 'danger' | 'secondary' {
  if (!state) {
    return 'secondary';
  }
  return SEVERITY[state] ?? 'secondary';
}
