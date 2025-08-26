export function formatCurrency(value: number, currency: string = 'USD', locale: string = 'es-AR') {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  } catch {
    // fallback if currency code is unknown
    return `${new Intl.NumberFormat(locale).format(value)} ${currency}`;
  }
}

export function formatEventDate(date: string | Date, locale: string = 'es-AR') {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = d.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  return { dateStr, timeStr };
}
