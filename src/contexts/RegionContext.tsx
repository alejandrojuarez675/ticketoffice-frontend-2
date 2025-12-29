// src/contexts/RegionContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { RegionService, type CountryConfigDto } from '@/services/RegionService';
import RegionSelectorModal from '@/components/common/RegionSelectorModal';
import { logger } from '@/lib/logger';

/**
 * RegionContextType - Contexto de configuración regional del usuario
 * 
 * IMPORTANTE: La configuración regional NO limita qué eventos puede ver el usuario.
 * Solo afecta CÓMO se muestran los datos y qué opciones se ofrecen en formularios:
 * 
 * - Formato de precios (símbolo de moneda, preparado para conversión futura)
 * - Formato de fechas y horas (zona horaria del usuario)
 * - Opciones en formularios de compra (tipos de documento disponibles)
 * - Contexto para sellers al crear eventos (saber en qué horario crean)
 * 
 * El usuario puede ver y comprar eventos de CUALQUIER país, sin importar su configuración.
 */
type RegionContextType = {
  countryCode: string | null;
  countryConfig: CountryConfigDto | null;
  cityCode: string | null;
  currencyCode: string | null;
  isConfigured: boolean;
  isLoading: boolean;
  openRegionSelector: () => void;
  updateRegion: (countryCode: string, config: CountryConfigDto, cityCode?: string, currencyCode?: string) => void;
  clearRegion: () => void;
};

const RegionContext = createContext<RegionContextType | undefined>(undefined);

type RegionProviderProps = {
  children: ReactNode;
  forceSelection?: boolean; // Si es true, fuerza mostrar el modal al inicio
  defaultCountryCode?: string; // País sugerido (ej: cuando viene de link de evento específico)
};

export function RegionProvider({ 
  children, 
  forceSelection = false,
  defaultCountryCode,
}: RegionProviderProps) {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [countryConfig, setCountryConfig] = useState<CountryConfigDto | null>(null);
  const [cityCode, setCityCode] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Cargar configuración guardada al inicio
  useEffect(() => {
    const loadSavedConfig = () => {
      try {
        const saved = RegionService.getSavedRegionalConfig();
        
        if (saved.countryCode && saved.config && !saved.isExpired) {
          // Configuración válida guardada
          setCountryCode(saved.countryCode);
          setCountryConfig(saved.config);
          setCityCode(saved.cityCode);
          setCurrencyCode(saved.currencyCode);
          setIsConfigured(true);
          logger.info('Loaded saved regional config', { countryCode: saved.countryCode });
        } else {
          // No hay configuración o está expirada
          setIsConfigured(false);
          
          // Mostrar modal SOLO si se fuerza explícitamente
          if (forceSelection) {
            // Intentar detectar país automáticamente para sugerirlo (de forma asíncrona)
            setTimeout(() => {
              const estimatedCountry = RegionService.estimateCountryFromTimezone();
              if (estimatedCountry && !defaultCountryCode) {
                logger.info('Estimated country from timezone', { country: estimatedCountry });
              }
              setShowModal(true);
            }, 100);
          }
        }
      } catch (error) {
        logger.error('Error loading saved regional config', error);
        setIsConfigured(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSavedConfig();
  }, [forceSelection, defaultCountryCode]);

  const updateRegion = useCallback((
    newCountryCode: string, 
    config: CountryConfigDto, 
    newCityCode?: string,
    newCurrencyCode?: string
  ) => {
    setCountryCode(newCountryCode);
    setCountryConfig(config);
    setCityCode(newCityCode || null);
    
    // Si no se especifica moneda, usar la primera disponible
    const finalCurrencyCode = newCurrencyCode || config.availableCurrencies[0]?.code || null;
    setCurrencyCode(finalCurrencyCode);
    
    // Guardar en localStorage
    RegionService.saveRegionalConfig(newCountryCode, config, newCityCode, finalCurrencyCode || undefined);
    
    setIsConfigured(true);
    setShowModal(false);
    
    logger.info('Region updated', { 
      countryCode: newCountryCode, 
      cityCode: newCityCode,
      currencyCode: finalCurrencyCode,
    });
  }, []);

  const openRegionSelector = useCallback(() => {
    setShowModal(true);
  }, []);

  const clearRegion = useCallback(() => {
    setCountryCode(null);
    setCountryConfig(null);
    setCityCode(null);
    setCurrencyCode(null);
    setIsConfigured(false);
    RegionService.clearRegionalConfig();
    setShowModal(true);
    logger.info('Region cleared');
  }, []);

  const contextValue: RegionContextType = {
    countryCode,
    countryConfig,
    cityCode,
    currencyCode,
    isConfigured,
    isLoading,
    openRegionSelector,
    updateRegion,
    clearRegion,
  };

  return (
    <RegionContext.Provider value={contextValue}>
      {children}
      
      {/* Modal de selección de región - Solo renderizar si es necesario */}
      {(showModal || forceSelection) && (
        <RegionSelectorModal
          open={showModal}
          onSelect={(code, config, city) => {
            updateRegion(code, config, city);
          }}
          defaultCountryCode={defaultCountryCode || RegionService.estimateCountryFromTimezone() || undefined}
          allowClose={isConfigured} // Permitir cerrar solo si ya hay una configuración previa
        />
      )}
    </RegionContext.Provider>
  );
}

export function useRegion(): RegionContextType {
  const context = useContext(RegionContext);
  
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  
  return context;
}

