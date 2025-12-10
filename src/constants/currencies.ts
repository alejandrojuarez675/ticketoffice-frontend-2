/**
 * [F1-007] Constantes de monedas y formateo
 * 
 * GUÍA: Configuración de monedas soportadas en el MVP
 * 
 * Uso:
 * ```tsx
 * import { getCurrencyConfig, formatMoney } from '@/constants/currencies';
 * 
 * const config = getCurrencyConfig('Colombia');
 * formatMoney(150000, config); // "$ 150.000"
 * ```
 */

export interface CurrencyConfig {
  code: string;      // ISO 4217: ARS, COP, USD
  symbol: string;    // $, €
  locale: string;    // es-AR, es-CO
  decimals: number;  // Decimales a mostrar
}

// Configuración de monedas por país
export const CURRENCY_BY_COUNTRY: Record<string, CurrencyConfig> = {
  'Argentina': { code: 'ARS', symbol: '$', locale: 'es-AR', decimals: 0 },
  'Colombia': { code: 'COP', symbol: '$', locale: 'es-CO', decimals: 0 },
  'Chile': { code: 'CLP', symbol: '$', locale: 'es-CL', decimals: 0 },
  'México': { code: 'MXN', symbol: '$', locale: 'es-MX', decimals: 2 },
  'Perú': { code: 'PEN', symbol: 'S/', locale: 'es-PE', decimals: 2 },
  'Uruguay': { code: 'UYU', symbol: '$', locale: 'es-UY', decimals: 0 },
  'Paraguay': { code: 'PYG', symbol: '₲', locale: 'es-PY', decimals: 0 },
  'Bolivia': { code: 'BOB', symbol: 'Bs', locale: 'es-BO', decimals: 2 },
  'Ecuador': { code: 'USD', symbol: '$', locale: 'es-EC', decimals: 2 },
  'España': { code: 'EUR', symbol: '€', locale: 'es-ES', decimals: 2 },
  'Estados Unidos': { code: 'USD', symbol: '$', locale: 'en-US', decimals: 2 },
};

// Moneda por defecto (Colombia para MVP)
export const DEFAULT_CURRENCY: CurrencyConfig = CURRENCY_BY_COUNTRY['Colombia'];

/**
 * Obtener configuración de moneda por país
 */
export function getCurrencyConfig(country?: string): CurrencyConfig {
  if (!country) return DEFAULT_CURRENCY;
  return CURRENCY_BY_COUNTRY[country] || DEFAULT_CURRENCY;
}

/**
 * Formatear monto con la configuración de moneda
 */
export function formatMoney(amount: number, config: CurrencyConfig): string {
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(amount);
  } catch {
    // Fallback si Intl no soporta la moneda
    return `${config.symbol} ${amount.toLocaleString(config.locale)}`;
  }
}

/**
 * Formatear monto por país (shortcut)
 */
export function formatMoneyByCountry(amount: number, country?: string): string {
  return formatMoney(amount, getCurrencyConfig(country));
}

