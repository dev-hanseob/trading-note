/**
 * Format a number string with comma separators for input fields.
 * Handles negative numbers. Strips non-numeric characters.
 */
export function formatNumberInput(value: string | number): string {
  if (typeof value === 'number') value = value.toString();
  const numberOnly = value.replace(/[^\d-]/g, '');
  if (numberOnly === '' || numberOnly === '-') return numberOnly;
  if (numberOnly.startsWith('-')) {
    return '-' + numberOnly.substring(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return numberOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Parse a formatted number string back to a number.
 */
export function parseNumberInput(value: string): number {
  return Number(value.replace(/,/g, '')) || 0;
}

/**
 * Format a number for display (read-only, not input fields).
 * Returns '-' for null/undefined values.
 */
export function formatNumberDisplay(n: number | null | undefined): string {
  if (n === null || n === undefined) return '-';
  return n.toLocaleString('ko-KR');
}

/**
 * Format ROI percentage.
 */
export function formatRoi(roi: number): string {
  return roi.toFixed(2);
}

/**
 * Format win rate percentage.
 */
export function formatWinRate(rate: number): string {
  return rate.toFixed(1);
}

/**
 * Format large numbers with K/M suffix for chart axes.
 */
export function formatCompactNumber(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(0)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(0)}K`;
  return `${sign}${abs}`;
}

/**
 * Format a trade date string for short display (MM.DD).
 */
export function formatTradeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}.${day}`;
  } catch {
    return dateStr;
  }
}

/**
 * Format a trade date string with year (YYYY.MM.DD).
 */
export function formatTradeDateFull(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  } catch {
    return dateStr;
  }
}
