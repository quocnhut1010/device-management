import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/ui/FilterDropdown.tsx
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
const FilterDropdown = ({ label, value, onChange, options, includeAll = true }) => {
    return (_jsxs(FormControl, { size: "small", sx: { minWidth: 160 }, children: [_jsx(InputLabel, { children: label }), _jsxs(Select, { value: value, onChange: (e) => onChange(e.target.value), label: label, children: [includeAll && _jsx(MenuItem, { value: "", children: "T\u1EA5t c\u1EA3" }), options.map((opt) => (_jsx(MenuItem, { value: opt, children: opt }, opt)))] })] }));
};
export default FilterDropdown;
