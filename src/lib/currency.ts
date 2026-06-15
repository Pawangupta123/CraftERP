// Currency is stored as free text on payments (any code the user types).
// Common codes power the input's datalist; symbols are shown where known, else the code.

export const COMMON_CURRENCIES = [
  'INR', 'USD', 'EUR', 'GBP', 'AED', 'AUD', 'CAD', 'JPY', 'CNY', 'SGD', 'CHF', 'SAR', 'ZAR', 'HKD', 'NZD',
] as const

export const BASE_CURRENCY = 'INR'

const SYMBOLS: Record<string, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', AUD: 'A$', CAD: 'C$', SGD: 'S$', HKD: 'HK$', NZD: 'NZ$',
}

/** Symbol for a currency code, falling back to the code itself (e.g. "AED 100"). */
export function currencySymbol(code: string | null | undefined): string {
  if (!code) return ''
  return SYMBOLS[code] ?? `${code} `
}
