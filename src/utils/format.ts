/**
 * OmniCost: Enterprise AI & Cloud FinOps Command Center
 * Live Currency Exchange Rate & Formatting Engine (Phase 9.1 & 10)
 * 
 * ============================================================================
 * LEARNING RESOURCES & FETCH API:
 * ============================================================================
 * 1. Fetch API & Async/Await:
 *    https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 *    Fetches live daily global exchange rates from open forex APIs with fallback protection.
 * ============================================================================
 */

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rateFromUsd: number;
  locale: string;
}

// Default Fallback Exchange Rates ($1 USD =)
export const DEFAULT_RATES: Record<CurrencyCode, number> = {
  USD: 1.00,
  INR: 85.00,
  EUR: 0.92,
  GBP: 0.79
};

export let LIVE_RATES: Record<CurrencyCode, number> = { ...DEFAULT_RATES };

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', label: 'INR (₹)', rateFromUsd: DEFAULT_RATES.INR, locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', label: 'USD ($)', rateFromUsd: DEFAULT_RATES.USD, locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (€)', rateFromUsd: DEFAULT_RATES.EUR, locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP (£)', rateFromUsd: DEFAULT_RATES.GBP, locale: 'en-GB' }
};

/**
 * Fetches live global daily exchange rates asynchronously from Open Exchange Rate API.
 */
export async function fetchLiveExchangeRates(): Promise<Record<CurrencyCode, number>> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) throw new Error('Forex API response error');
    const data = await res.json();

    if (data && data.rates) {
      LIVE_RATES = {
        USD: 1.00,
        INR: data.rates.INR || DEFAULT_RATES.INR,
        EUR: data.rates.EUR || DEFAULT_RATES.EUR,
        GBP: data.rates.GBP || DEFAULT_RATES.GBP
      };

      SUPPORTED_CURRENCIES.INR.rateFromUsd = LIVE_RATES.INR;
      SUPPORTED_CURRENCIES.USD.rateFromUsd = LIVE_RATES.USD;
      SUPPORTED_CURRENCIES.EUR.rateFromUsd = LIVE_RATES.EUR;
      SUPPORTED_CURRENCIES.GBP.rateFromUsd = LIVE_RATES.GBP;

      return LIVE_RATES;
    }
  } catch (error) {
    console.warn('[OmniCost Forex] Failed to fetch live exchange rates, using fallback rates:', error);
  }
  return DEFAULT_RATES;
}

/**
 * Formats a USD base amount into the target currency using live exchange rates.
 */
export function formatCurrency(
  amountInUsd: number,
  currency: CurrencyCode = 'INR',
  decimals: number = 2,
  rates: Record<CurrencyCode, number> = LIVE_RATES
): string {
  const config = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.INR;
  const rate = rates[currency] || config.rateFromUsd;
  const convertedAmount = amountInUsd * rate;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(convertedAmount);
}

export function formatINR(amountInUsd: number, decimals: number = 2): string {
  return formatCurrency(amountInUsd, 'INR', decimals);
}
