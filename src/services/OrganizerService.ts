// src/services/OrganizerService.ts
import { AuthService } from './AuthService';
import { ConfigService } from './ConfigService';
import { http } from '@/lib/http';
import { logger } from '@/lib/logger';

export interface OrganizerData {
  name: string;
  url: string;
  logo: {
    url: string;
    alt: string;
  };
}

export interface OrganizerResponse {
  id: string;
  name: string;
  url: string;
  logo?: {
    url: string;
    alt: string;
  };
}

/**
 * Servicio para gestionar datos de organizador
 * 
 * Endpoint BE: POST /api/v1/organizer
 * Requiere: Autenticación (admin o seller)
 * 
 * Este endpoint permite a un usuario crear su perfil de organizador,
 * necesario para poder crear y gestionar eventos.
 */
export const OrganizerService = {
  /**
   * Crear datos de organizador para el usuario autenticado
   * 
   * @param data - Datos del organizador (name, url, logo)
   * @throws HttpError si la creación falla
   */
  async createOrganizer(data: OrganizerData): Promise<void> {
    const base = ConfigService.getApiBase();
    await http.post<void, OrganizerData>(
      `${base}/api/v1/organizer`,
      data,
      { headers: { ...AuthService.getAuthHeader() }, retries: 0 }
    );
    logger.info('OrganizerService.createOrganizer ok', { name: data.name });
  },

  /**
   * Verifica si el usuario actual tiene datos de organizador
   * Se obtiene del usuario autenticado (/users/me)
   */
  async hasOrganizerData(): Promise<boolean> {
    try {
      const user = await AuthService.me();
      // El BE devuelve organizer como parte del usuario
      return !!(user && (user as unknown as { organizer?: { id: string } }).organizer?.id);
    } catch {
      return false;
    }
  },
};

