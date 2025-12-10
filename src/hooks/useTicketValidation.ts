'use client';

import { useState, useCallback, useRef } from 'react';
import { SalesService } from '@/services/SalesService';
import { HttpError } from '@/lib/http';
import { logger } from '@/lib/logger';

/**
 * [F2-003] useTicketValidation - Hook para validar entradas (manual o QR)
 * 
 * GUÍA: Este hook encapsula:
 * - Validación de tickets por sessionId (código del QR)
 * - Estados de carga/éxito/error
 * - Historial de validaciones recientes
 * - Prevención de doble validación
 * 
 * ENDPOINT BE: POST /api/public/v1/checkout/session/{sessionId}/validate
 * 
 * Uso:
 * ```tsx
 * const {
 *   validating, lastResult, history,
 *   validateTicket, clearResult
 * } = useTicketValidation();
 * 
 * // Validar manualmente o desde QR
 * await validateTicket('session-id-from-qr');
 * 
 * // Resultado disponible en lastResult
 * if (lastResult?.success) {
 *   // Mostrar éxito
 * }
 * ```
 */

export interface ValidationResult {
  sessionId: string;
  success: boolean;
  message: string;
  validatedAt: Date;
}

export interface UseTicketValidationResult {
  // Estados
  validating: boolean;
  lastResult: ValidationResult | null;
  
  // Historial de validaciones (para mostrar lista)
  history: ValidationResult[];
  
  // Acciones
  validateTicket: (sessionId: string) => Promise<ValidationResult>;
  clearResult: () => void;
  clearHistory: () => void;
}

/**
 * Hook para validar entradas
 * Ya no requiere eventId - el endpoint usa sessionId directamente
 */
export function useTicketValidation(): UseTicketValidationResult {
  // Estados
  const [validating, setValidating] = useState(false);
  const [lastResult, setLastResult] = useState<ValidationResult | null>(null);
  const [history, setHistory] = useState<ValidationResult[]>([]);
  
  // Ref para prevenir doble validación
  const pendingValidationRef = useRef<string | null>(null);

  /**
   * [F2-003] Validar un ticket por sessionId
   * 
   * GUÍA: Esta función:
   * 1. Previene doble validación del mismo ticket
   * 2. Llama al endpoint POST /api/public/v1/checkout/session/{sessionId}/validate
   * 3. Actualiza el historial
   * 4. Retorna el resultado para uso inmediato
   * 
   * @param sessionId - ID de la sesión de checkout (viene en el QR del ticket)
   * @returns Resultado de la validación
   */
  const validateTicket = useCallback(async (sessionId: string): Promise<ValidationResult> => {
    // Limpiar espacios y validar
    const cleanSessionId = sessionId.trim();
    
    if (!cleanSessionId) {
      const result: ValidationResult = {
        sessionId: '',
        success: false,
        message: 'Por favor, ingresa un código de ticket válido.',
        validatedAt: new Date(),
      };
      setLastResult(result);
      return result;
    }

    // Prevenir doble validación
    if (pendingValidationRef.current === cleanSessionId) {
      logger.warn('useTicketValidation: Validación duplicada prevenida', { sessionId: cleanSessionId });
      return lastResult!;
    }

    pendingValidationRef.current = cleanSessionId;
    setValidating(true);
    setLastResult(null);

    let result: ValidationResult;

    try {
      logger.info('useTicketValidation.validateTicket', { sessionId: cleanSessionId });
      
      // Llamar al servicio de validación con el nuevo endpoint
      await SalesService.validate(cleanSessionId);
      
      result = {
        sessionId: cleanSessionId,
        success: true,
        message: '¡Entrada validada exitosamente!',
        validatedAt: new Date(),
      };
      
      logger.info('useTicketValidation.validateTicket success', { sessionId: cleanSessionId });
      
    } catch (err) {
      logger.error('useTicketValidation.validateTicket failed', err);
      
      // Determinar mensaje de error según el tipo
      let message = HttpError.getUserMessage(err);
      
      // Mensajes específicos para validación
      if (HttpError.isHttpError(err)) {
        if (err.isNotFound()) {
          message = 'Ticket no encontrado. Verifica el código e intenta nuevamente.';
        } else if (err.status === 400) {
          // Podría ser que ya está validado
          const details = err.details as Record<string, unknown> | undefined;
          if (details?.code === 'already_validated' || details?.message?.toString().includes('already')) {
            message = 'Este ticket ya fue validado anteriormente.';
          }
        } else if (err.isForbidden()) {
          message = 'No tienes permisos para validar este ticket.';
        }
      }
      
      result = {
        sessionId: cleanSessionId,
        success: false,
        message,
        validatedAt: new Date(),
      };
    } finally {
      setValidating(false);
      pendingValidationRef.current = null;
    }

    // Actualizar estado y historial
    setLastResult(result);
    setHistory(prev => [result, ...prev].slice(0, 50)); // Mantener últimas 50

    return result;
  }, [lastResult]);

  /**
   * Limpiar último resultado
   */
  const clearResult = useCallback(() => {
    setLastResult(null);
  }, []);

  /**
   * Limpiar historial
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
    setLastResult(null);
  }, []);

  return {
    validating,
    lastResult,
    history,
    validateTicket,
    clearResult,
    clearHistory,
  };
}

export default useTicketValidation;

