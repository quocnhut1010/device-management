import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/devicetypes/DeviceTypeTable.tsx
import { Box, Typography, IconButton, Tooltip, Table, TableHead, TableBody, TableRow, TableCell, Paper, Chip, } from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
const DeviceTypeTable = ({ data, onEdit, onDelete }) => {
    return (_jsxs(Paper, { elevation: 3, sx: { borderRadius: 2, p: 2 }, children: [_jsx(Typography, { variant: "h6", gutterBottom: true, fontWeight: 600, children: "Danh s\u00E1ch lo\u1EA1i thi\u1EBFt b\u1ECB" }), _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "Lo\u1EA1i thi\u1EBFt b\u1ECB" }), _jsx(TableCell, { children: "M\u00F4 t\u1EA3" }), _jsx(TableCell, { align: "center", children: "Thao t\u00E1c" })] }) }), _jsx(TableBody, { children: data.map((row) => (_jsxs(TableRow, { hover: true, children: [_jsx(TableCell, { children: _jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [_jsx(DevicesIcon, { color: "primary" }), _jsx(Typography, { fontWeight: 500, children: row.typeName })] }) }), _jsx(TableCell, { children: row.description ? (_jsx(Typography, { color: "text.secondary", children: row.description })) : (_jsx(Chip, { label: "Ch\u01B0a c\u00F3 m\u00F4 t\u1EA3", size: "small", variant: "outlined" })) }), _jsxs(TableCell, { align: "center", children: [_jsx(Tooltip, { title: "Ch\u1EC9nh s\u1EEDa", children: _jsx(IconButton, { onClick: () => onEdit(row), children: _jsx(EditIcon, {}) }) }), _jsx(Tooltip, { title: "Xo\u00E1", children: _jsx(IconButton, { onClick: () => row.id && onDelete(row.id), children: _jsx(DeleteIcon, { color: "error" }) }) })] })] }, row.id))) })] })] }));
};
export default DeviceTypeTable;
