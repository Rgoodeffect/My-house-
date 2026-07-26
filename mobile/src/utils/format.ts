import { MONTHS } from './constants';

export function thisMonthKey(): string {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

export function monthLabelOf(key: string): string {
  const [y, m] = key.split('-').map(Number);
  return MONTHS[m - 1] + ' ' + y;
}

export function daysInMonth(key: string): number {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m, 0).getDate();
}

export function shiftMonthKey(key: string, delta: number): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

export function prevMonthKey(key: string): string {
  return shiftMonthKey(key, -1);
}

export function fmt(n: number | undefined | null): string {
  return Number(n || 0).toLocaleString('ar-LY', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDate(d: string): string {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  return day + '/' + m + '/' + y;
}

export function todayISODate(): string {
  return new Date().toISOString().split('T')[0];
}
