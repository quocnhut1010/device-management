import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/common/UserAvatar.tsx
import { Avatar, Badge, styled, Box, IconButton, Tooltip, } from '@mui/material';
// Helper lấy chữ cái đầu
const stringAvatar = (name) => {
    const initials = name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase();
    return {
        children: initials,
    };
};
// Custom online badge
const StyledBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#44b700',
        color: '#44b700',
        boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
        '&::after': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            animation: 'ripple 1.2s infinite ease-in-out',
            border: '1px solid currentColor',
            content: '""',
        },
    },
    '@keyframes ripple': {
        '0%': {
            transform: 'scale(0.8)',
            opacity: 1,
        },
        '100%': {
            transform: 'scale(2.4)',
            opacity: 0,
        },
    },
}));
const UserAvatar = ({ name, imageUrl, isOnline = true, onClick, editable = false, onImageSelect, }) => {
    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onImageSelect?.(e.target.files[0]);
        }
    };
    return (_jsx(Box, { sx: { position: 'relative', display: 'inline-block' }, children: _jsx(Tooltip, { title: editable ? 'Click để đổi ảnh' : '', children: _jsxs(IconButton, { component: "label", onClick: onClick, sx: { p: 0 }, children: [_jsx(StyledBadge, { overlap: "circular", anchorOrigin: { vertical: 'bottom', horizontal: 'right' }, variant: "dot", invisible: !isOnline, children: _jsx(Avatar, { src: imageUrl, ...stringAvatar(name), sx: { width: 80, height: 80, fontSize: 28 } }) }), editable && (_jsx("input", { hidden: true, accept: "image/*", type: "file", onChange: handleImageChange }))] }) }) }));
};
export default UserAvatar;
