'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckoutService } from '@/services/CheckoutService';
import { EventService } from '@/services/EventService';
import { HttpError } from '@/lib/http';
import { logger } from '@/lib/logger';
import type { EventDetail } from '@/types/Event';
import type { BuyerData } from '@/types/checkout';

/**
 * [F2-001] useCheckoutFlow - Hook para manejar todo el flujo de checkout
 * 
 * GUÍA: Este hook encapsula:
 * - Carga de datos de sesión y evento
 * - Validación de formulario
 * - Envío de datos de comprador
 * - Manejo de estados de carga/error
 * 
 * Estados del flujo:
 * - 'loading': Cargando datos iniciales
 * - 'ready': Listo para llenar formulario
 * - 'submitting': Enviando datos de compra
 * - 'success': Compra exitosa
 * - 'error': Error en algún paso
 * 
 * Uso:
 * ```tsx
 * const { 
 *   state, event, error, 
 *   submitPurchase 
 * } = useCheckoutFlow(sessionId, sessionMeta);
 * ```
 */

export type CheckoutState = 'loading' | 'ready' | 'submitting' | 'success' | 'error';

export interface SessionMeta {
  eventId: string;
  priceId: string;
  quantity: number;
}

export interface UseCheckoutFlowResult {
  // Estado
  state: CheckoutState;
  error: string | null;
  
  // Datos
  event: EventDetail | null;
  sessionMeta: SessionMeta | null;
  selectedTicket: EventDetail['tickets'][0] | null;
  
  // Acciones
  submitPurchase: (mainEmail: string, buyers: BuyerData[]) => Promise<void>;
  clearError: () => void;
  retry: () => void;
}

export function useCheckoutFlow(
  sessionId: string | null,
  initialMeta?: SessionMeta | null
): UseCheckoutFlowResult {
  const router = useRouter();
  
  // Estados
  const [state, setState] = useState<CheckoutState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [sessionMeta, setSessionMeta] = useState<SessionMeta | null>(initialMeta || null);
  
  // Derivado: ticket seleccionado
  const selectedTicket = event?.tickets.find(t => t.id === sessionMeta?.priceId) || null;

  /**
   * Cargar datos del evento
   */
  const loadEventData = useCallback(async (eventId: string) => {
    try {
      const eventData = await EventService.getPublicById(eventId);
      setEvent(eventData);
      return eventData;
    } catch (err) {
      logger.error('useCheckoutFlow.loadEventData failed', err);
      throw err;
    }
  }, []);

  /**
   * Inicialización: cargar meta de localStorage si no se proporcionó
   */
  useEffect(() => {
    if (!sessionId) {
      setState('error');
      setError('Sesión no válida');
      return;
    }

    let meta = initialMeta;

    // Intentar obtener meta de localStorage si no se proporcionó
    if (!meta) {
      try {
        const key = `checkout:meta:${sessionId}`;
        const raw = localStorage.getItem(key);
        if (raw) {
          meta = JSON.parse(raw) as SessionMeta;
          setSessionMeta(meta);
        }
      } catch {
        // Ignorar errores de parsing
      }
    }

    if (!meta) {
      setState('error');
      setError('La sesión no existe o ha expirado. Por favor, inicia el proceso de compra nuevamente.');
      return;
    }

    // Cargar datos del evento
    setState('loading');
    loadEventData(meta.eventId)
      .then(() => {
        setState('ready');
      })
      .catch((err) => {
        setState('error');
        setError(HttpError.getUserMessage(err));
      });
  }, [sessionId, initialMeta, loadEventData]);

  /**
   * [F2-001] Enviar datos de compra
   * 
   * GUÍA: Este método:
   * 1. Valida que haya sesión y datos
   * 2. Llama al endpoint de compra
   * 3. Redirige a página de éxito
   */
  const submitPurchase = useCallback(async (mainEmail: string, buyers: BuyerData[]) => {
    if (!sessionId || !sessionMeta) {
      setError('Sesión no válida');
      return;
    }

    setState('submitting');
    setError(null);

    try {
      logger.info('useCheckoutFlow.submitPurchase', { sessionId, buyersCount: buyers.length });

      // Llamar al servicio de compra
      await CheckoutService.buy(sessionId, {
        mainEmail,
        buyer: buyers,
      });

      setState('success');
      
      // Limpiar localStorage
      try {
        localStorage.removeItem(`checkout:meta:${sessionId}`);
      } catch {
        // Ignorar errores
      }

      // Redirigir a página de éxito
      router.push(`/checkout/congrats?sessionId=${encodeURIComponent(sessionId)}`);
      
    } catch (err) {
      logger.error('useCheckoutFlow.submitPurchase failed', err);
      setState('error');
      setError(HttpError.getUserMessage(err));
    }
  }, [sessionId, sessionMeta, router]);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
    if (state === 'error' && event) {
      setState('ready');
    }
  }, [state, event]);

  /**
   * Reintentar carga
   */
  const retry = useCallback(() => {
    if (sessionMeta) {
      setState('loading');
      setError(null);
      loadEventData(sessionMeta.eventId)
        .then(() => setState('ready'))
        .catch((err) => {
          setState('error');
          setError(HttpError.getUserMessage(err));
        });
    }
  }, [sessionMeta, loadEventData]);

  return {
    state,
    error,
    event,
    sessionMeta,
    selectedTicket,
    submitPurchase,
    clearError,
    retry,
  };
}

export default useCheckoutFlow;

