// src/services/ContactService.ts
import { http } from '@/lib/http';
import { logger } from '@/lib/logger';
import { ConfigService } from './ConfigService';

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Servicio para el formulario de contacto
 * 
 * Endpoint BE: POST /api/public/v1/form/contact-us
 * No requiere autenticación (público)
 */
export const ContactService = {
  /**
   * Envía el formulario de contacto al backend
   * 
   * @param data - Datos del formulario (name, email, subject, message)
   * @throws HttpError si el envío falla
   */
  async submitContactForm(data: ContactFormData): Promise<void> {
    if (ConfigService.isMockedEnabled()) {
      await new Promise((r) => setTimeout(r, 500));
      logger.info('ContactService.submitContactForm mock', { email: data.email });
      return;
    }

    const base = ConfigService.getApiBase();
    await http.post<void, ContactFormData>(
      `${base}/api/public/v1/form/contact-us`,
      data,
      { retries: 0 } // Sin reintentos para evitar envíos duplicados
    );
    logger.info('ContactService.submitContactForm success', { email: data.email });
  },
};
