import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

/**
 * Captura errores de renderizado de cualquier componente hijo.
 * Muestra una UI de fallback con botón "Reintentar".
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Error capturado:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100vh', gap: 2, p: 4,
            bgcolor: '#f5f5f5',
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 56, color: '#f48771' }} />
          <Typography variant="h6" fontWeight="bold" color="error">
            Algo salió mal
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, textAlign: 'center' }}>
            {this.state.error?.message || 'Error inesperado en la aplicación.'}
          </Typography>
          <Button variant="contained" onClick={this.handleRetry}>
            Reintentar
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
