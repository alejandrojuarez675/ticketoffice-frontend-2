// src/utils/format.ts

// Mapa simple país → { currencyCode, locale }
// Nota: usa nombres tal como los envías al BE (p.ej., "Colombia", "Argentina").
const countryToCurrency: Record<string, { code: string; locale: string }> = {
  Colombia: { code: 'COP', locale: 'es-CO' },
  Argentina: { code: 'ARS', locale: 'es-AR' },
  Chile:     { code: 'CLP', locale: 'es-CL' },
  México:    { code: 'MXN', locale: 'es-MX' },
  Mexico:    { code: 'MXN', locale: 'es-MX' },
  Perú:      { code: 'PEN', locale: 'es-PE' },
  Peru:      { code: 'PEN', locale: 'es-PE' },
  Uruguay:   { code: 'UYU', locale: 'es-UY' },
  Paraguay:  { code: 'PYG', locale: 'es-PY' },
  Bolivia:   { code: 'BOB', locale: 'es-BO' },
  Ecuador:   { code: 'USD', locale: 'es-EC' },
  España:    { code: 'EUR', locale: 'es-ES' },
  'Estados Unidos': { code: 'USD', locale: 'es-US' },
};

// Si no reconocemos el país, usamos COP por defecto (MVP)
export function getCurrencyForCountry(country?: string) {
  const key = (country || '').trim();
  return countryToCurrency[key] ?? { code: 'COP', locale: 'es-CO' };
}

// NUEVO: preferido en VIP/checkout
export function formatMoneyByCountry(value: number, country?: string) {
  const { code, locale } = getCurrencyForCountry(country);
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(value);
  } catch {
    return `${code} ${new Intl.NumberFormat(locale).format(value)}`;
  }
}

// Mantengo tu helper (por compatibilidad)
export function formatCurrency(value: number, currency: string = 'USD', locale: string = 'es-AR') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  } catch {
    return `${new Intl.NumberFormat(locale).format(value)} ${currency}`;
  }
}

export function formatEventDate(date: string | Date, locale: string = 'es-AR') {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = d.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  return { dateStr, timeStr };
}

/**
 * Capitaliza la primera letra de un string.
 * Si el string empieza con un número, busca la primera letra y la capitaliza.
 * @param str - El string a capitalizar
 * @returns El string con la primera letra en mayúscula
 */
export function capitalizeFirstLetter(str?: string | null): string {
  if (!str) return '';
  
  // Buscar la primera letra en el string
  const match = str.match(/[a-záéíóúñA-ZÁÉÍÓÚÑ]/);
  if (!match || match.index === undefined) {
    return str; // No hay letras, devolver el original
  }
  
  const idx = match.index;
  return str.slice(0, idx) + str.charAt(idx).toUpperCase() + str.slice(idx + 1);
}
