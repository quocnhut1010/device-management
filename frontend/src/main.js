import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './routes/AppRouter';
import './index.css';
import { AppThemeProvider } from './contexts/ThemeContext';
import { SnackbarProvider } from 'notistack';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsxs(SnackbarProvider, { maxSnack: 3, anchorOrigin: { vertical: 'top', horizontal: 'right' }, autoHideDuration: 3000, children: [_jsx(AppThemeProvider, { children: _jsx(AppRouter, {}) }), _jsx(ToastContainer, {})] }) }));
