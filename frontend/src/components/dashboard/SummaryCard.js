import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/dashboard/SummaryCard.tsx
import { Box, Paper, Typography, Avatar } from '@mui/material';
const SummaryCard = ({ title, count, icon, color = 'primary' }) => {
    return (_jsxs(Paper, { elevation: 3, sx: {
            p: 2,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 3,
            backgroundColor: `${color}.lighter`,
            color: `${color}.darker`,
        }, children: [_jsx(Avatar, { sx: {
                    bgcolor: `${color}.main`,
                    color: 'white',
                    width: 56,
                    height: 56,
                    mr: 2,
                }, children: icon }), _jsxs(Box, { children: [_jsx(Typography, { variant: "h6", fontWeight: 600, children: count.toLocaleString() }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: title })] })] }));
};
export default SummaryCard;
