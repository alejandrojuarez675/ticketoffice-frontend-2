// src/lib/http.ts
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface FetchJsonOptions<B = unknown> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: B;
  retries?: number; // default 0
  retryDelayMs?: number; // default 300
  signal?: AbortSignal; // opcional: cancelar requests
}

// Provider global de token para Authorization
let authTokenProvider: (() => string | null) | null = null;
export function setAuthTokenProvider(provider: (() => string | null) | null) {
  authTokenProvider = provider;
}

/**
 * [F1-008] HttpError mejorado con métodos para UI
 * 
 * GUÍA: Esta clase captura errores HTTP y proporciona métodos
 * para obtener mensajes amigables para mostrar al usuario.
 * 
 * Uso en componentes:
 * ```tsx
 * try {
 *   await api.call();
 * } catch (error) {
 *   const message = HttpError.getUserMessage(error);
 *   setError(message);
 * }
 * ```
 */
export class HttpError extends Error {
  status: number;
  statusText: string;
  url: string;
  details?: unknown;

  constructor(url: string, status: number, statusText: string, details?: unknown) {
    super(`HTTP ${status} ${statusText}`);
    this.name = 'HttpError';
    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.details = details;
  }

  /**
   * Verifica si un error es HttpError
   */
  static isHttpError(error: unknown): error is HttpError {
    return error instanceof HttpError;
  }

  /**
   * Obtiene un mensaje amigable para mostrar al usuario
   * Extrae el mensaje del backend si existe, o genera uno genérico
   */
  getUserMessage(): string {
    // Intentar extraer mensaje del backend
    if (this.details && typeof this.details === 'object') {
      const details = this.details as Record<string, unknown>;
      
      // Formato común de BE: { message: "..." }
      if (typeof details.message === 'string') {
        return details.message;
      }
      
      // Formato alternativo: { error: "..." }
      if (typeof details.error === 'string') {
        return details.error;
      }
      
      // Formato con código: { code: "...", message: "..." }
      if (details.code && typeof details.message === 'string') {
        return details.message;
      }
    }

    // Mensajes genéricos por código de estado
    return HttpError.getMessageForStatus(this.status);
  }

  /**
   * Obtiene mensaje genérico por código de estado HTTP
   */
  static getMessageForStatus(status: number): string {
    const messages: Record<number, string> = {
      400: 'Los datos enviados no son válidos. Por favor, verifica e intenta nuevamente.',
      401: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      403: 'No tienes permisos para realizar esta acción.',
      404: 'El recurso solicitado no fue encontrado.',
      409: 'Hubo un conflicto con la operación. El recurso puede haber sido modificado.',
      422: 'Los datos enviados no pudieron ser procesados.',
      429: 'Demasiadas solicitudes. Por favor, espera un momento e intenta nuevamente.',
      500: 'Error interno del servidor. Por favor, intenta más tarde.',
      502: 'El servidor no está disponible temporalmente.',
      503: 'El servicio está en mantenimiento. Por favor, intenta más tarde.',
      504: 'El servidor tardó demasiado en responder. Por favor, intenta nuevamente.',
    };

    return messages[status] || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
  }

  /**
   * Helper estático para obtener mensaje amigable de cualquier error
   * Usar en catch blocks
   */
  static getUserMessage(error: unknown): string {
    if (HttpError.isHttpError(error)) {
      return error.getUserMessage();
    }

    if (error instanceof Error) {
      // Errores de red
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
      }
      return error.message;
    }

    return 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
  }

  /**
   * Verifica si el error es de autenticación (401)
   */
  isUnauthorized(): boolean {
    return this.status === 401;
  }

  /**
   * Verifica si el error es de permisos (403)
   */
  isForbidden(): boolean {
    return this.status === 403;
  }

  /**
   * Verifica si el error es de recurso no encontrado (404)
   */
  isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * Verifica si el error es del servidor (5xx)
   */
  isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }
}

async function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function fetchJson<TResponse, B = unknown>(url: string, opts: FetchJsonOptions<B> = {}): Promise<TResponse> {
  const { method = 'GET', headers = {}, body, retries = 0, retryDelayMs = 300, signal } = opts;

  const dynamicHeaders: Record<string, string> = {
    accept: 'application/json',
    'Content-Type': 'application/json',
    ...headers,
  };

  const token = authTokenProvider?.();
  if (token) dynamicHeaders.Authorization = `Bearer ${token}`;

  const init: RequestInit = {
    method,
    headers: dynamicHeaders,
    body: body != null ? JSON.stringify(body) : undefined,
    signal,
  };

  let attempt = 0;
  while (true) {
    try {
      const res = await fetch(url, init);
      const isJson = res.headers.get('content-type')?.includes('application/json');
      
      // Códigos de éxito: 2xx (200-299)
      const isSuccess = res.status >= 200 && res.status < 300;
      
      if (!isSuccess) {
        let details: unknown;
        if (isJson) {
          try {
            details = await res.json();
          } catch {}
        } else {
          try {
            details = await res.text();
          } catch {}
        }
        if (attempt < retries && (res.status === 429 || (res.status >= 500 && res.status < 600))) {
          attempt++;
          await delay(retryDelayMs * attempt);
          continue;
        }
        throw new HttpError(url, res.status, res.statusText, details);
      }
      
      // 204 No Content - sin body
      if (res.status === 204) return undefined as unknown as TResponse;
      
      // 201 Created, 200 OK, etc - con body
      if (isJson) return (await res.json()) as TResponse;
      return (await res.text()) as unknown as TResponse;
    } catch (err) {
      if (attempt < retries) {
        attempt++;
        await delay(retryDelayMs * attempt);
        continue;
      }
      throw err;
    }
  }
}

export const http = {
  get: <T,>(url: string, options?: Omit<FetchJsonOptions, 'method' | 'body'>) => fetchJson<T>(url, { method: 'GET', ...(options || {}) }),
  post: <T, B = unknown>(url: string, body?: B, options?: Omit<FetchJsonOptions<B>, 'method' | 'body'>) =>
    fetchJson<T, B>(url, { method: 'POST', body, ...(options || {}) }),
  put: <T, B = unknown>(url: string, body?: B, options?: Omit<FetchJsonOptions<B>, 'method' | 'body'>) =>
    fetchJson<T, B>(url, { method: 'PUT', body, ...(options || {}) }),
  patch: <T, B = unknown>(url: string, body?: B, options?: Omit<FetchJsonOptions<B>, 'method' | 'body'>) =>
    fetchJson<T, B>(url, { method: 'PATCH', body, ...(options || {}) }),
  delete: <T,>(url: string, options?: Omit<FetchJsonOptions, 'method' | 'body'>) => fetchJson<T>(url, { method: 'DELETE', ...(options || {}) }),
};
