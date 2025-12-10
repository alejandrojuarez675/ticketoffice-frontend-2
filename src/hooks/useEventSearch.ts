'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { EventService } from '@/services/EventService';
import { HttpError } from '@/lib/http';
import { logger } from '@/lib/logger';
import type { SearchEvent, SearchEventParams, SearchEventResponse } from '@/types/search-event';

/**
 * [F2-002] useEventSearch - Hook para búsqueda de eventos con debounce
 * 
 * GUÍA: Este hook encapsula:
 * - Búsqueda con debounce (evita llamadas excesivas)
 * - Paginación
 * - Estados de carga/error
 * - Cache básico de resultados
 * 
 * Uso:
 * ```tsx
 * const {
 *   events, loading, error, pagination,
 *   search, setPage, clearResults
 * } = useEventSearch({ country: 'Colombia', debounceMs: 300 });
 * 
 * // Búsqueda manual
 * search({ query: 'concierto' });
 * 
 * // Cambiar página
 * setPage(2);
 * ```
 */

export interface UseEventSearchOptions {
  // Filtros iniciales
  country?: string;
  city?: string;
  query?: string;
  
  // Configuración
  pageSize?: number;
  debounceMs?: number;
  autoSearch?: boolean; // Buscar automáticamente al montar
}

export interface UseEventSearchResult {
  // Datos
  events: SearchEvent[];
  hasEventsInYourCity: boolean;
  
  // Estados
  loading: boolean;
  error: string | null;
  searched: boolean; // Si ya se realizó al menos una búsqueda
  
  // Paginación
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    hasMore: boolean;
  };
  
  // Acciones
  search: (params?: Partial<SearchEventParams>) => Promise<void>;
  setPage: (page: number) => void;
  clearResults: () => void;
  clearError: () => void;
}

export function useEventSearch(options: UseEventSearchOptions = {}): UseEventSearchResult {
  const {
    country: initialCountry = '',
    city: initialCity = '',
    query: initialQuery = '',
    pageSize = 9,
    debounceMs = 300,
    autoSearch = false,
  } = options;

  // Estados
  const [events, setEvents] = useState<SearchEvent[]>([]);
  const [hasEventsInYourCity, setHasEventsInYourCity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Parámetros actuales
  const [currentParams, setCurrentParams] = useState<SearchEventParams>({
    country: initialCountry,
    city: initialCity,
    query: initialQuery,
    pageSize,
    pageNumber: 0,
  });

  // Refs para debounce y cancelación
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * [F2-002] Ejecutar búsqueda con los parámetros actuales
   * 
   * GUÍA: Esta función:
   * 1. Cancela búsquedas pendientes
   * 2. Aplica debounce si es búsqueda por texto
   * 3. Llama al servicio de eventos
   * 4. Actualiza el estado con los resultados
   */
  const executeSearch = useCallback(async (params: SearchEventParams, immediate = false) => {
    // Cancelar búsqueda anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Limpiar timer de debounce anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const doSearch = async () => {
      // Crear nuevo AbortController
      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      setError(null);

      try {
        logger.debug('useEventSearch.executeSearch', params);
        
        const response: SearchEventResponse = await EventService.searchEvents(params);
        
        // Verificar si fue cancelada
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        setEvents(response.events || []);
        setHasEventsInYourCity(response.hasEventsInYourCity ?? false);
        setCurrentPage(response.currentPage ?? 0);
        setTotalPages(response.totalPages ?? 0);
        setSearched(true);
        setCurrentParams(params);
        
        logger.debug('useEventSearch.executeSearch success', { 
          count: response.events?.length,
          totalPages: response.totalPages 
        });
        
      } catch (err) {
        // Ignorar errores de cancelación
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        
        logger.error('useEventSearch.executeSearch failed', err);
        setError(HttpError.getUserMessage(err));
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    // Aplicar debounce solo si no es inmediato
    if (!immediate && debounceMs > 0) {
      debounceTimerRef.current = setTimeout(doSearch, debounceMs);
    } else {
      await doSearch();
    }
  }, [debounceMs]);

  /**
   * Búsqueda pública - permite sobrescribir parámetros
   */
  const search = useCallback(async (overrideParams?: Partial<SearchEventParams>) => {
    const newParams: SearchEventParams = {
      ...currentParams,
      ...overrideParams,
      pageNumber: overrideParams?.pageNumber ?? 0, // Reset página al cambiar filtros
    };
    
    // Si cambiaron los filtros (no solo la página), aplicar debounce
    const isOnlyPageChange = 
      overrideParams && 
      Object.keys(overrideParams).length === 1 && 
      'pageNumber' in overrideParams;
    
    await executeSearch(newParams, isOnlyPageChange);
  }, [currentParams, executeSearch]);

  /**
   * Cambiar página (sin debounce)
   */
  const setPage = useCallback((page: number) => {
    const newParams = { ...currentParams, pageNumber: page };
    executeSearch(newParams, true); // Inmediato, sin debounce
  }, [currentParams, executeSearch]);

  /**
   * Limpiar resultados
   */
  const clearResults = useCallback(() => {
    setEvents([]);
    setSearched(false);
    setCurrentPage(0);
    setTotalPages(0);
    setError(null);
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-search al montar si está habilitado
  useEffect(() => {
    if (autoSearch && initialCountry) {
      executeSearch({
        country: initialCountry,
        city: initialCity,
        query: initialQuery,
        pageSize,
        pageNumber: 0,
      }, true);
    }
    
    // Cleanup al desmontar
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // Solo al montar

  return {
    // Datos
    events,
    hasEventsInYourCity,
    
    // Estados
    loading,
    error,
    searched,
    
    // Paginación
    pagination: {
      currentPage,
      totalPages,
      pageSize,
      hasMore: currentPage < totalPages - 1,
    },
    
    // Acciones
    search,
    setPage,
    clearResults,
    clearError,
  };
}

export default useEventSearch;

