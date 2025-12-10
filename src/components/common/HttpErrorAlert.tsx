'use client';

import { Alert, AlertTitle, Button, Collapse } from '@mui/material';
import { HttpError } from '@/lib/http';

/**
 * [F1-008] HttpErrorAlert - Muestra errores HTTP de forma amigable
 * 
 * GUÍA: Usar en formularios y páginas para mostrar errores de API
 * 
 * Uso:
 * ```tsx
 * const [error, setError] = useState<unknown>(null);
 * 
 * try {
 *   await api.call();
 * } catch (e) {
 *   setError(e);
 * }
 * 
 * <HttpErrorAlert error={error} onClose={() => setError(null)} />
 * ```
 */

interface HttpErrorAlertProps {
  error: unknown;
  onClose?: () => void;
  onRetry?: () => void;
  title?: string;
  showDetails?: boolean; // Solo en desarrollo
}

export function HttpErrorAlert({ 
  error, 
  onClose, 
  onRetry,
  title = 'Error',
  showDetails = process.env.NODE_ENV === 'development'
}: HttpErrorAlertProps) {
  // No mostrar nada si no hay error
  if (!error) return null;

  const message = HttpError.getUserMessage(error);
  const isHttpError = HttpError.isHttpError(error);
  const httpError = isHttpError ? error : null;
  const canRetry = !!httpError && (httpError.isServerError() || httpError.status === 429);

  return (
    <Collapse in={!!error}>
      <Alert 
        severity="error" 
        onClose={onClose}
        sx={{ mb: 2 }}
        action={
          canRetry && onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Reintentar
            </Button>
          ) : undefined
        }
      >
        <AlertTitle>{title}</AlertTitle>
        {message}
        
        {/* Detalles técnicos solo en desarrollo */}
        {showDetails && httpError && (
          <details style={{ marginTop: 8, fontSize: '0.75rem', opacity: 0.7 }}>
            <summary>Detalles técnicos</summary>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              Status: {httpError.status} {httpError.statusText}
              {'\n'}URL: {httpError.url}
              {httpError.details != null && `\nDetails: ${JSON.stringify(httpError.details, null, 2)}`}
            </pre>
          </details>
        )}
      </Alert>
    </Collapse>
  );
}

export default HttpErrorAlert;

