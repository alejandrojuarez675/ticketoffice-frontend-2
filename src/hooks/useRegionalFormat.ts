// src/hooks/useRegionalFormat.ts
'use client';

import { useMemo } from 'react';
import { useRegion } from '@/contexts/RegionContext';

/**
 * Hook para formatear valores según la configuración regional del usuario
 * 
 * IMPORTANTE: Este hook NO limita qué contenido se muestra.
 * Solo formatea CÓMO se muestran precios, fechas y horas.
 * 
 * Uso:
 * ```tsx
 * const { formatPrice, formatDate, formatDateTime } = useRegionalFormat();
 * 
 * <Typography>{formatPrice(5000, 'ARS')}</Typography>
 * <Typography>{formatDateTime(event.date)}</Typography>
 * ```
 */
export function useRegionalFormat() {
  const { countryConfig, currencyCode } = useRegion();

  /**
   * Formatea un precio según la moneda configurada del usuario
   * 
   * @param amount - Monto a formatear
   * @param originalCurrency - Moneda original del precio (ej: 'ARS', 'COP', 'USD')
   * @param showOriginal - Si es true y la moneda es diferente, muestra ambas
   * 
   * Nota: En el futuro, aquí se aplicará conversión de moneda en tiempo real
   */
  const formatPrice = useMemo(() => {
    return (amount: number, originalCurrency?: string, showOriginal = true): string => {
      const userCurrency = currencyCode || 'USD';
      const currency = originalCurrency || userCurrency;
      
      // Obtener símbolo de la moneda
      const currencySymbol = countryConfig?.availableCurrencies.find(c => c.code === currency)?.symbol || currency;
      
      // Formatear número
      const formatted = new Intl.NumberFormat('es', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
      
      // Si la moneda del evento es diferente a la del usuario, mostrar ambas
      if (showOriginal && originalCurrency && originalCurrency !== userCurrency) {
        // TODO: Aquí en el futuro se aplicará conversión de moneda
        return `${currencySymbol} ${formatted}`;
      }
      
      return `${currencySymbol} ${formatted}`;
    };
  }, [countryConfig, currencyCode]);

  /**
   * Formatea una fecha según la zona horaria del usuario
   * 
   * @param date - Fecha a formatear (string ISO o Date)
   * @param options - Opciones adicionales de formato
   */
  const formatDate = useMemo(() => {
    return (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options,
      };
      
      // Usar idioma de la config regional si existe
      const locale = countryConfig?.language || 'es';
      
      return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
    };
  }, [countryConfig]);

  /**
   * Formatea una fecha con hora según la zona horaria del usuario
   * 
   * @param date - Fecha a formatear (string ISO o Date)
   * @param options - Opciones adicionales de formato
   */
  const formatDateTime = useMemo(() => {
    return (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options,
      };
      
      // Usar idioma de la config regional si existe
      const locale = countryConfig?.language || 'es';
      
      return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
    };
  }, [countryConfig]);

  /**
   * Formatea solo la hora según la zona horaria del usuario
   * 
   * @param date - Fecha a formatear (string ISO o Date)
   */
  const formatTime = useMemo(() => {
    return (date: string | Date): string => {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
      };
      
      const locale = countryConfig?.language || 'es';
      
      return new Intl.DateTimeFormat(locale, options).format(dateObj);
    };
  }, [countryConfig]);

  /**
   * Obtiene la zona horaria del usuario
   */
  const getTimezone = (): string => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'UTC';
    }
  };

  /**
   * Obtiene el símbolo de la moneda configurada
   */
  const getCurrencySymbol = (): string => {
    if (!countryConfig || !currencyCode) return '$';
    
    const currency = countryConfig.availableCurrencies.find(c => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  };

  /**
   * Obtiene los tipos de documento disponibles según la config regional
   */
  const getDocumentTypes = () => {
    return countryConfig?.documentType || [];
  };

  return {
    formatPrice,
    formatDate,
    formatDateTime,
    formatTime,
    getTimezone,
    getCurrencySymbol,
    getDocumentTypes,
    // Datos del contexto para acceso directo
    countryConfig,
    currencyCode,
  };
}

export default useRegionalFormat;

