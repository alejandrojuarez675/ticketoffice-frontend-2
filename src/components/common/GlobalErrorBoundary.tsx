'use client';

import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Box, Button, Typography, Container, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * GlobalErrorBoundary - Captura errores críticos de la aplicación
 * 
 * Uso:
 * ```tsx
 * <GlobalErrorBoundary>
 *   <App />
 * </GlobalErrorBoundary>
 * ```
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log del error para debugging
    console.error('GlobalErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    this.setState({ errorInfo });

    // Aquí podrías enviar a un servicio de logging (Sentry, LogRocket, etc.)
    // if (process.env.NODE_ENV === 'production') {
    //   logErrorToService(error, errorInfo);
    // }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Si se proporcionó un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = process.env.NODE_ENV === 'development';

      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            p: 2,
          }}
        >
          <Container maxWidth="sm">
            <Paper
              elevation={3}
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: 2,
              }}
            >
              <ErrorOutlineIcon
                sx={{
                  fontSize: 80,
                  color: 'error.main',
                  mb: 2,
                }}
              />
              
              <Typography variant="h4" gutterBottom fontWeight="bold">
                ¡Algo salió mal!
              </Typography>
              
              <Typography color="text.secondary" paragraph>
                Ha ocurrido un error inesperado en la aplicación.
                Por favor, intenta nuevamente o vuelve al inicio.
              </Typography>

              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleReload}
                >
                  Reintentar
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={this.handleGoHome}
                >
                  Ir al inicio
                </Button>
              </Box>

              {/* Detalles técnicos solo en desarrollo */}
              {isDev && this.state.error && (
                <Box
                  sx={{
                    mt: 4,
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    textAlign: 'left',
                    overflow: 'auto',
                    maxHeight: 300,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    color="error"
                    gutterBottom
                    fontWeight="bold"
                  >
                    🐛 Error (solo visible en desarrollo):
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      m: 0,
                    }}
                  >
                    {this.state.error.name}: {this.state.error.message}
                  </Typography>
                  
                  {this.state.error.stack && (
                    <Typography
                      variant="body2"
                      component="pre"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontFamily: 'monospace',
                        fontSize: '0.65rem',
                        mt: 1,
                        color: 'text.secondary',
                        m: 0,
                      }}
                    >
                      {this.state.error.stack}
                    </Typography>
                  )}
                </Box>
              )}

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 3, display: 'block' }}
              >
                Si el problema persiste, contacta a soporte.
              </Typography>
            </Paper>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;

