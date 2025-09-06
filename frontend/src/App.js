import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, useLocation, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Welcome from './pages/Welcome';
import Login from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
const AppRoutes = () => {
    const location = useLocation();
    return (_jsx(AnimatePresence, { mode: "wait", children: _jsxs(Routes, { location: location, children: [_jsx(Route, { path: "/", element: _jsx(Welcome, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) })] }, location.pathname) }));
};
function App() {
    return (_jsx(Router, { children: _jsx(AppRoutes, {}) }));
}
export default App;
