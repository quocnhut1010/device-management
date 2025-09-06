import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useMemo, useState, useContext } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
const ThemeContext = createContext({
    mode: 'light',
    toggleMode: () => { },
});
export const useAppTheme = () => useContext(ThemeContext);
export const AppThemeProvider = ({ children }) => {
    const [mode, setMode] = useState('light');
    const toggleMode = () => {
        setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
    };
    const theme = useMemo(() => createTheme({
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                    primary: { main: '#1976d2' },
                    background: {
                        default: '#f4f6f8',
                        paper: '#ffffff',
                    },
                }
                : {
                    primary: { main: '#90caf9' },
                    background: {
                        default: '#121212',
                        paper: '#1d1d1d',
                    },
                }),
        },
        shape: {
            borderRadius: 12,
        },
    }), [mode]);
    return (_jsx(ThemeContext.Provider, { value: { mode, toggleMode }, children: _jsxs(ThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), children] }) }));
};
