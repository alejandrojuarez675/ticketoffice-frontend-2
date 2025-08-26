/* Centralized HTTP client with basic retries and typed JSON parsing */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface FetchJsonOptions<B = unknown> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: B;
  retries?: number; // default 0
  retryDelayMs?: number; // default 300
}

export class HttpError extends Error {
  status: number;
  statusText: string;
  url: string;
  details?: unknown;
  constructor(url: string, status: number, statusText: string, details?: unknown) {
    super(`HTTP ${status} ${statusText}`);
    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.details = details;
  }
}

async function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function fetchJson<TResponse, B = unknown>(
  url: string,
  opts: FetchJsonOptions<B> = {}
): Promise<TResponse> {
  const {
    method = 'GET',
    headers = {},
    body,
    retries = 0,
    retryDelayMs = 300,
  } = opts;

  const init: RequestInit = {
    method,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body != null ? JSON.stringify(body) : undefined,
    // credentials: 'include', // enable if using cookies
  };

  let attempt = 0;
  // simple retry for idempotent methods or 5xx
  while (true) {
    try {
      const res = await fetch(url, init);
      const isJson = res.headers.get('content-type')?.includes('application/json');
      if (!res.ok) {
        let details: unknown;
        if (isJson) {
          try { details = await res.json(); } catch {}
        } else {
          try { details = await res.text(); } catch {}
        }
        // retry on 429/5xx
        if (attempt < retries && (res.status === 429 || (res.status >= 500 && res.status < 600))) {
          attempt++;
          await delay(retryDelayMs * attempt);
          continue;
        }
        throw new HttpError(url, res.status, res.statusText, details);
      }
      // happy path
      if (res.status === 204) return undefined as unknown as TResponse;
      if (isJson) {
        return (await res.json()) as TResponse;
      }
      // Fallback to text
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
  get: <T>(url: string, options?: Omit<FetchJsonOptions, 'method' | 'body'>) =>
    fetchJson<T>(url, { method: 'GET', ...(options || {}) }),
  post: <T, B = unknown>(url: string, body?: B, options?: Omit<FetchJsonOptions<B>, 'method' | 'body'>) =>
    fetchJson<T, B>(url, { method: 'POST', body, ...(options || {}) }),
  put: <T, B = unknown>(url: string, body?: B, options?: Omit<FetchJsonOptions<B>, 'method' | 'body'>) =>
    fetchJson<T, B>(url, { method: 'PUT', body, ...(options || {}) }),
  patch: <T, B = unknown>(url: string, body?: B, options?: Omit<FetchJsonOptions<B>, 'method' | 'body'>) =>
    fetchJson<T, B>(url, { method: 'PATCH', body, ...(options || {}) }),
  delete: <T>(url: string, options?: Omit<FetchJsonOptions, 'method' | 'body'>) =>
    fetchJson<T>(url, { method: 'DELETE', ...(options || {}) }),
};
