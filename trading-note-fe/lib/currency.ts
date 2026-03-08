export const CURRENCY_OPTIONS = [
  { value: 'KRW', label: 'KRW (원)', suffix: '원', prefix: '' },
  { value: 'USD', label: 'USD ($)', suffix: '', prefix: '$' },
  { value: 'USDT', label: 'USDT', suffix: ' USDT', prefix: '' },
  { value: 'USDC', label: 'USDC', suffix: ' USDC', prefix: '' },
] as const;

export type CurrencyCode = typeof CURRENCY_OPTIONS[number]['value'];

export function formatCurrency(amount: number, currency: string): string {
  const opt = CURRENCY_OPTIONS.find(o => o.value === currency);
  const abs = Math.abs(amount).toLocaleString();
  if (!opt) return abs + '원';
  return opt.prefix + abs + opt.suffix;
}

export function formatCurrencyWithSign(amount: number, currency: string): string {
  const sign = amount >= 0 ? '+' : '-';
  return sign + formatCurrency(Math.abs(amount), currency);
}

export function getCurrencySuffix(currency: string): string {
  const opt = CURRENCY_OPTIONS.find(o => o.value === currency);
  if (!opt) return '원';
  if (opt.prefix) return opt.prefix.trim();
  return opt.suffix.trim();
}
