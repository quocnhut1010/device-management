import { jsx as _jsx } from "react/jsx-runtime";
// src/components/ui/CustomSearchInput.tsx
import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
const CustomSearchInput = ({ value, onChange, placeholder = 'Tìm kiếm...' }) => {
    return (_jsx(TextField, { size: "small", variant: "outlined", placeholder: placeholder, value: value, onChange: (e) => onChange(e.target.value), InputProps: {
            startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(Search, {}) })),
        } }));
};
export default CustomSearchInput;
