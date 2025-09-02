// src/components/ui/FilterDropdown.tsx
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  includeAll?: boolean;
}

const FilterDropdown = ({ label, value, onChange, options, includeAll = true }: Props) => {
  return (
    <FormControl size="small" sx={{ minWidth: 160 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        label={label}
      >
        {includeAll && <MenuItem value="">Tất cả</MenuItem>}
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FilterDropdown;
