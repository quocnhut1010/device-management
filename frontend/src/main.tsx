// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './routes/AppRouter';
import './index.css';
import { AppThemeProvider } from './contexts/ThemeContext';
import { SnackbarProvider } from 'notistack';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      autoHideDuration={3000}
    >
      <AppThemeProvider>
        <AppRouter />
      </AppThemeProvider>
    </SnackbarProvider>
  </React.StrictMode>,
);
