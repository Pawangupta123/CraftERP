import type { Database } from '@/lib/database.types'

export type Currency = Database['public']['Enums']['currency_code']

export const CURRENCIES: Currency[] = ['INR', 'USD', 'EUR']

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
}
