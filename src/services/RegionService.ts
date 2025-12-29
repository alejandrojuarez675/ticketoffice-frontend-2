// src/services/RegionService.ts
import { http } from '@/lib/http';
import { ConfigService } from './ConfigService';
import { logger } from '@/lib/logger';

// Types based on API documentation
export type CountryDto = {
  code: string;
  name: string;
};

export type CityDto = {
  code: string;
  name: string;
};

export type CurrencyDto = {
  code: string;
  name: string;
  symbol: string;
};

export type DocumentTypeDto = {
  code: string;
  name: string;
  description?: string;
  format?: string;
  regex?: string;
};

export type CountryConfigDto = {
  data: CountryDto;
  cities: CityDto[];
  language: string;
  availableCurrencies: CurrencyDto[];
  documentType: DocumentTypeDto[];
};

// Storage keys for regional config
const STORAGE_KEYS = {
  COUNTRY_CODE: 'region_country_code',
  COUNTRY_CONFIG: 'region_country_config',
  SELECTED_CITY: 'region_selected_city',
  SELECTED_CURRENCY: 'region_selected_currency',
  CONFIG_TIMESTAMP: 'region_config_timestamp',
} as const;

// Cache duration: 24 hours
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

class RegionService {
  private static BASE_URL = ConfigService.getApiBase();

  /**
   * Obtiene la lista de países disponibles
   */
  static async getCountries(): Promise<CountryDto[]> {
    try {
      const useMocks = ConfigService.isMockedEnabled();
      logger.info('RegionService.getCountries called', { useMocks });
      
      if (useMocks) {
        logger.debug('RegionService.getCountries: using mock data');
        return [
          { code: 'ARG', name: 'Argentina' },
          { code: 'COL', name: 'Colombia' },
          { code: 'OTHER', name: 'Otro' },
        ];
      }

      const url = `${this.BASE_URL}/api/public/v1/form/country`;
      logger.info('RegionService.getCountries: calling API', { url });
      const countries = await http.get<CountryDto[]>(url);
      logger.info('Countries fetched successfully from API', { count: countries.length, countries });
      return countries;
    } catch (error) {
      logger.error('Error fetching countries from API', error);
      throw error;
    }
  }

  /**
   * Obtiene la configuración de un país específico
   * @param countryCode - El código del país (viene del campo 'code' de CountryDto)
   */
  static async getCountryConfig(countryCode: string): Promise<CountryConfigDto> {
    try {
      const useMocks = ConfigService.isMockedEnabled();
      logger.info('RegionService.getCountryConfig called', { countryCode, useMocks });
      
      if (useMocks) {
        logger.debug('RegionService.getCountryConfig: using mock data', { countryCode });
        
        if (countryCode === 'ARG' || countryCode === 'AR') {
          return {
            data: { code: 'ARG', name: 'Argentina' },
            cities: [
              { code: 'CABA', name: 'Buenos Aires' },
              { code: 'COR', name: 'Córdoba' },
              { code: 'ROS', name: 'Rosario' },
              { code: 'MEN', name: 'Mendoza' },
            ],
            language: 'es-AR',
            availableCurrencies: [
              { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
              { code: 'USD', name: 'Dólar', symbol: 'USD' },
            ],
            documentType: [
              { code: 'DNI', name: 'DNI', description: 'Documento Nacional de Identidad', format: '##.###.###', regex: '^\\d{7,8}$' },
              { code: 'PASSPORT', name: 'Pasaporte', description: 'Pasaporte', format: 'AAA######', regex: '^[A-Z]{3}\\d{6}$' },
            ],
          };
        }
        
        if (countryCode === 'COL' || countryCode === 'CO') {
          return {
            data: { code: 'COL', name: 'Colombia' },
            cities: [
              { code: 'BOG', name: 'Bogotá' },
              { code: 'MED', name: 'Medellín' },
              { code: 'CAL', name: 'Cali' },
              { code: 'BAQ', name: 'Barranquilla' },
            ],
            language: 'es-CO',
            availableCurrencies: [
              { code: 'COP', name: 'Peso Colombiano', symbol: '$' },
              { code: 'USD', name: 'Dólar', symbol: 'USD' },
            ],
            documentType: [
              { code: 'CC', name: 'Cédula de Ciudadanía', description: 'Cédula de Ciudadanía', format: '#########', regex: '^\\d{6,10}$' },
              { code: 'CE', name: 'Cédula de Extranjería', description: 'Cédula de Extranjería', format: '#########', regex: '^\\d{6,10}$' },
              { code: 'PASSPORT', name: 'Pasaporte', description: 'Pasaporte', format: 'AAA######', regex: '^[A-Z]{3}\\d{6}$' },
            ],
          };
        }
        
        // OTHER/default country
        return {
          data: { code: 'OTHER', name: 'Otro' },
          cities: [],
          language: 'es',
          availableCurrencies: [
            { code: 'USD', name: 'Dólar', symbol: 'USD' },
          ],
          documentType: [
            { code: 'PASSPORT', name: 'Pasaporte', description: 'Pasaporte Internacional' },
            { code: 'OTHER', name: 'Otro', description: 'Otro documento de identidad' },
          ],
        };
      }

      const url = `${this.BASE_URL}/api/public/v1/form/country/${countryCode}/config`;
      logger.info('RegionService.getCountryConfig: calling API', { url, countryCode });
      const config = await http.get<CountryConfigDto>(url);
      logger.info('Country config fetched successfully from API', { countryCode, config });
      return config;
    } catch (error) {
      logger.error('Error fetching country config from API', { countryCode, error });
      throw error;
    }
  }

  /**
   * Guarda la configuración regional seleccionada en localStorage
   */
  static saveRegionalConfig(countryCode: string, config: CountryConfigDto, cityCode?: string, currencyCode?: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.COUNTRY_CODE, countryCode);
      localStorage.setItem(STORAGE_KEYS.COUNTRY_CONFIG, JSON.stringify(config));
      localStorage.setItem(STORAGE_KEYS.CONFIG_TIMESTAMP, Date.now().toString());
      
      if (cityCode) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_CITY, cityCode);
      }
      
      if (currencyCode) {
        localStorage.setItem(STORAGE_KEYS.SELECTED_CURRENCY, currencyCode);
      }
      
      logger.info('Regional config saved', { countryCode, cityCode, currencyCode });
    } catch (error) {
      logger.error('Error saving regional config', error);
    }
  }

  /**
   * Obtiene la configuración regional guardada
   */
  static getSavedRegionalConfig(): {
    countryCode: string | null;
    config: CountryConfigDto | null;
    cityCode: string | null;
    currencyCode: string | null;
    isExpired: boolean;
  } {
    if (typeof window === 'undefined') {
      return { countryCode: null, config: null, cityCode: null, currencyCode: null, isExpired: true };
    }
    
    try {
      const countryCode = localStorage.getItem(STORAGE_KEYS.COUNTRY_CODE);
      const configStr = localStorage.getItem(STORAGE_KEYS.COUNTRY_CONFIG);
      const cityCode = localStorage.getItem(STORAGE_KEYS.SELECTED_CITY);
      const currencyCode = localStorage.getItem(STORAGE_KEYS.SELECTED_CURRENCY);
      const timestampStr = localStorage.getItem(STORAGE_KEYS.CONFIG_TIMESTAMP);
      
      if (!countryCode || !configStr || !timestampStr) {
        return { countryCode: null, config: null, cityCode: null, currencyCode: null, isExpired: true };
      }
      
      const timestamp = parseInt(timestampStr, 10);
      const isExpired = Date.now() - timestamp > CACHE_DURATION_MS;
      
      const config = JSON.parse(configStr) as CountryConfigDto;
      
      return { countryCode, config, cityCode, currencyCode, isExpired };
    } catch (error) {
      logger.error('Error getting saved regional config', error);
      return { countryCode: null, config: null, cityCode: null, currencyCode: null, isExpired: true };
    }
  }

  /**
   * Limpia la configuración regional guardada
   */
  static clearRegionalConfig(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(STORAGE_KEYS.COUNTRY_CODE);
      localStorage.removeItem(STORAGE_KEYS.COUNTRY_CONFIG);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_CITY);
      localStorage.removeItem(STORAGE_KEYS.SELECTED_CURRENCY);
      localStorage.removeItem(STORAGE_KEYS.CONFIG_TIMESTAMP);
      logger.info('Regional config cleared');
    } catch (error) {
      logger.error('Error clearing regional config', error);
    }
  }

  /**
   * Detecta automáticamente la zona horaria del usuario
   */
  static getTimezone(): string {
    if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') {
      return 'UTC';
    }
    
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'UTC';
    }
  }

  /**
   * Obtiene el código de país desde la zona horaria (estimación básica)
   * IMPORTANTE: Retorna códigos de 3 letras que coinciden con la API real
   */
  static estimateCountryFromTimezone(): string | null {
    const timezone = this.getTimezone();
    
    if (timezone.includes('Buenos_Aires') || timezone.includes('Argentina')) {
      return 'ARG';
    }
    
    if (timezone.includes('Bogota') || timezone.includes('Colombia')) {
      return 'COL';
    }
    
    return null;
  }
}

export { RegionService };

